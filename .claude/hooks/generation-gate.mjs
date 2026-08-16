#!/usr/bin/env node
/**
 * Generation gate for Playwright specs under tests/.
 * Exit 0 = allow, exit 2 = block (deny), exit 1 = hook error (failClosed blocks).
 */
import { readFileSync } from 'node:fs';
import { normalize } from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8'));
const filePath = normalize(input.file_path ?? '').replace(/\\/g, '/');

function isTestsSpec(path) {
  return /(^|\/)tests\/.+\.spec\.(ts|js|tsx|jsx)$/.test(path);
}

function deny(reason) {
  const payload = {
    permission: 'deny',
    user_message: `Generation gate blocked: ${reason}`,
    agent_message:
      `Test spec failed the generation gate: ${reason}. ` +
      'Add at least one expect() assertion and use getByRole/getByLabel locators ' +
      'instead of page.locator with CSS (#, .) or XPath (//).',
  };
  console.error(JSON.stringify(payload, null, 2));
  process.exit(2);
}

function allow() {
  console.error(
    JSON.stringify(
      {
        permission: 'allow',
        user_message: 'Generation gate passed.',
        file_path: filePath,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (!isTestsSpec(filePath)) {
  allow();
}

let content;
try {
  content = readFileSync(input.file_path, 'utf8');
} catch (err) {
  console.error(
    JSON.stringify({
      error: `Could not read edited file: ${err instanceof Error ? err.message : String(err)}`,
      file_path: filePath,
    }),
  );
  process.exit(1);
}

if (!content.includes('expect(')) {
  deny('spec contains no expect() assertions');
}

const locatorPattern = /page\.locator\s*\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
for (const match of content.matchAll(locatorPattern)) {
  const selector = match[2];
  if (selector.includes('.') || selector.includes('#') || selector.includes('//')) {
    deny('spec uses page.locator with CSS or XPath selectors');
  }
}

allow();
