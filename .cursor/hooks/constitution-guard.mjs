#!/usr/bin/env node
/**
 * Constitution guard — blocks afterFileEdit Write when tests/** or pages/**
 * content introduces a mechanically-checkable WON'T violation.
 * Exit 0 = allow, exit 2 = block (deny), exit 1 = hook error (failClosed blocks).
 */
import { readFileSync } from 'node:fs';
import { normalize } from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8'));
const filePath = normalize(input.file_path ?? '').replace(/\\/g, '/');

function isGuardedPath(path) {
  return /(^|\/)tests\//.test(path) || /(^|\/)pages\//.test(path);
}

function deny(reason) {
  const payload = {
    permission: 'deny',
    user_message: `Constitution guard blocked: ${reason}`,
    agent_message:
      `Edit violates the project constitution (WON'T): ${reason}. ` +
      'See .cursor/rules/constitution.mdc — fix the violation before retrying.',
  };
  console.error(JSON.stringify(payload, null, 2));
  process.exit(2);
}

function allow(reason = 'no WON\'T violations') {
  console.error(
    JSON.stringify(
      { permission: 'allow', user_message: `Constitution guard passed (${reason}).`, file_path: filePath },
      null,
      2,
    ),
  );
  process.exit(0);
}

function stripComments(content) {
  const withoutBlock = content.replace(/\/\*[\s\S]*?\*\//g, '');
  return withoutBlock
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n');
}

function lineNumber(content, index) {
  return content.slice(0, index).split('\n').length;
}

function reconstructBefore(newContent, edits) {
  if (!Array.isArray(edits) || edits.length === 0) {
    return newContent;
  }
  let before = newContent;
  for (let i = edits.length - 1; i >= 0; i--) {
    const { old_string: oldString, new_string: newString } = edits[i] ?? {};
    if (typeof oldString !== 'string' || typeof newString !== 'string') {
      continue;
    }
    if (!before.includes(newString)) {
      continue;
    }
    before = before.replace(newString, oldString);
  }
  return before;
}

function countActiveExpects(content) {
  const matches = stripComments(content).match(/\bexpect\s*\(/g);
  return matches ? matches.length : 0;
}

function findNewlyCommentedExpects(before, after) {
  const violations = [];
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');

  for (let i = 0; i < Math.max(beforeLines.length, afterLines.length); i++) {
    const oldLine = beforeLines[i] ?? '';
    const newLine = afterLines[i] ?? '';
    const oldActive = /\bexpect\s*\(/.test(stripComments(oldLine));
    const newActive = /\bexpect\s*\(/.test(stripComments(newLine));
    const newCommentedExpect = /^\s*\/\/\s*.*\bexpect\s*\(/.test(newLine);

    if (oldActive && newCommentedExpect && !newActive) {
      violations.push({ line: i + 1, text: newLine.trim() });
    }
  }
  return violations;
}

function checkWaitForTimeout(content) {
  const stripped = stripComments(content);
  const pattern = /\b(?:page|this\.page)\.waitForTimeout\s*\(/g;
  for (const match of stripped.matchAll(pattern)) {
    return `page.waitForTimeout at line ${lineNumber(stripped, match.index)}`;
  }
  return null;
}

function checkXPathLocators(content) {
  const stripped = stripComments(content);
  const patterns = [
    /\blocator\s*\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g,
    /\$\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g,
  ];

  for (const pattern of patterns) {
    for (const match of stripped.matchAll(pattern)) {
      const selector = match[2];
      if (selector.includes('//') || /^xpath=/i.test(selector.trim())) {
        return `XPath locator "${selector.slice(0, 60)}" at line ${lineNumber(stripped, match.index)}`;
      }
    }
  }
  return null;
}

function checkAnyType(content) {
  const stripped = stripComments(content);
  const patterns = [
    { re: /:\s*any\b(?!\w)/, label: ': any' },
    { re: /:\s*any\[\]/, label: ': any[]' },
    { re: /\bas\s+any\b/, label: 'as any' },
    { re: /<\s*any\s*>/, label: '<any>' },
  ];

  for (const { re, label } of patterns) {
    const match = re.exec(stripped);
    if (match) {
      return `${label} at line ${lineNumber(stripped, match.index)}`;
    }
  }
  return null;
}

function checkHardcodedCredential(content) {
  const stripped = stripComments(content);
  const patterns = [
    {
      re: /\b(?:const|let|var)\s+(?:password|secret|apiKey|api_key|authToken|accessToken|token)\s*=\s*['"][^'"]+['"]/gi,
      label: 'auth variable assigned a string literal',
    },
    {
      re: /\b(?:DIDAXIS_PASSWORD|DIDAXIS_EMAIL|API_KEY|AUTH_TOKEN|ACCESS_TOKEN)\s*=\s*['"][^'"]+['"]/gi,
      label: 'env-like name assigned a string literal',
    },
    {
      re: /Authorization\s*:\s*['"]Bearer\s+[A-Za-z0-9._-]{8,}['"]/g,
      label: 'hardcoded Bearer token',
    },
    {
      re: /process\.env\.\w+\s*\|\|\s*['"][^'"]+['"]/g,
      label: 'process.env fallback to a hardcoded secret',
    },
  ];

  for (const { re, label } of patterns) {
    const match = re.exec(stripped);
    if (match) {
      return `${label} at line ${lineNumber(stripped, match.index)}`;
    }
  }
  return null;
}

function checkTagOnDescribe(content) {
  const stripped = stripComments(content);
  const patterns = [
    /\btest\.describe\s*\([^)]*,\s*\{\s*tag\s*:/,
    /\btest\.describe\s*\(\s*['"`][^'"`]*@\w+/,
    /\bdescribe\s*\([^)]*,\s*\{\s*tag\s*:/,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(stripped);
    if (match) {
      return `tag on describe() at line ${lineNumber(stripped, match.index)}`;
    }
  }
  return null;
}

function checkWeakenedExpects(beforeContent, afterContent) {
  const beforeCount = countActiveExpects(beforeContent);
  const afterCount = countActiveExpects(afterContent);

  if (afterCount < beforeCount) {
    return `active expect() count dropped from ${beforeCount} to ${afterCount}`;
  }

  const commented = findNewlyCommentedExpects(beforeContent, afterContent);
  if (commented.length > 0) {
    const sample = commented[0];
    return `expect() commented out at line ${sample.line}: "${sample.text}"`;
  }
  return null;
}

function checkContent(content, beforeContent = content) {
  const checks = [
    checkWaitForTimeout,
    checkXPathLocators,
    checkAnyType,
    checkHardcodedCredential,
    checkTagOnDescribe,
  ];

  for (const check of checks) {
    const violation = check(content);
    if (violation) {
      return violation;
    }
  }

  if (/(^|\/)tests\//.test(filePath)) {
    return checkWeakenedExpects(beforeContent, content);
  }
  return null;
}

if (!isGuardedPath(filePath)) {
  allow('path outside tests/** and pages/**');
}

let newContent;
try {
  newContent = readFileSync(input.file_path, 'utf8');
} catch (err) {
  console.error(
    JSON.stringify({
      error: `Could not read edited file: ${err instanceof Error ? err.message : String(err)}`,
      file_path: filePath,
    }),
  );
  process.exit(1);
}

const beforeContent = reconstructBefore(newContent, input.edits);
const violation = checkContent(newContent, beforeContent);

if (violation) {
  deny(violation);
}

allow();
