#!/usr/bin/env node
/**
 * Blocks test-spec edits that weaken assertions (afterFileEdit hook).
 * Exit 0 = allow, exit 2 = block (deny), exit 1 = hook error (failClosed blocks).
 */
import { readFileSync } from 'node:fs';
import { normalize } from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8'));
const filePath = normalize(input.file_path ?? '').replace(/\\/g, '/');

function isTestsFile(path) {
  return /(^|\/)tests\//.test(path);
}

function deny(reason) {
  const payload = {
    permission: 'deny',
    user_message: `Assertion guard blocked: ${reason}`,
    agent_message:
      `Test edit weakened assertions: ${reason}. ` +
      'Do not delete or comment out expect() to force green. Fix locators in pages/ or file a bug.',
  };
  console.error(JSON.stringify(payload, null, 2));
  process.exit(2);
}

function allow(reason = 'assertion count unchanged') {
  console.error(
    JSON.stringify(
      {
        permission: 'allow',
        user_message: `Assertion guard passed (${reason}).`,
        file_path: filePath,
      },
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

function countActiveExpects(content) {
  const stripped = stripComments(content);
  const matches = stripped.match(/\bexpect\s*\(/g);
  return matches ? matches.length : 0;
}

function findNewlyCommentedExpects(before, after) {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const violations = [];

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

if (!isTestsFile(filePath)) {
  allow('not under tests/');
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
const beforeCount = countActiveExpects(beforeContent);
const afterCount = countActiveExpects(newContent);

if (afterCount < beforeCount) {
  deny(
    `active expect() count dropped from ${beforeCount} to ${afterCount} — assertions were deleted or commented out`,
  );
}

const commented = findNewlyCommentedExpects(beforeContent, newContent);
if (commented.length > 0) {
  const sample = commented[0];
  deny(
    `expect() was commented out at line ${sample.line}: "${sample.text}"`,
  );
}

allow(`${afterCount} active expect() call(s)`);
