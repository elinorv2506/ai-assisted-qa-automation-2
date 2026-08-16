#!/usr/bin/env node
/**
 * Generates eval-report.md when an agent/orchestrator session ends.
 */
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  let sessionHint = 'local agent session';
  try {
    const payload = JSON.parse(input || '{}');
    sessionHint = payload.conversation_id ?? payload.session_id ?? sessionHint;
  } catch {
    /* use default */
  }

  try {
    execSync(
      `node scripts/eval-report-collect.mjs --runs 10 --trigger "local session ${sessionHint}"`,
      { cwd: ROOT, stdio: 'pipe' },
    );
    execSync('node scripts/eval-report-write.mjs', { cwd: ROOT, stdio: 'pipe' });
  } catch {
    /* fail open — do not block session end */
  }

  // Silent exit — no followup_message (avoids stop-hook loop on every agent turn).
  process.exit(0);
});
