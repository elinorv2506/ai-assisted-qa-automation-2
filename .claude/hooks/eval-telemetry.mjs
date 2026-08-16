#!/usr/bin/env node
/**
 * Logs AskQuestion (and optional guess) events for eval-report ask-vs-guess metric.
 */
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TELEMETRY = join(__dirname, '..', 'eval', 'telemetry.jsonl');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input || '{}');
    const tool = payload.tool_name ?? payload.tool ?? '';
    if (!/AskQuestion/i.test(tool)) {
      process.exit(0);
    }

    mkdirSync(dirname(TELEMETRY), { recursive: true });
    appendFileSync(
      TELEMETRY,
      `${JSON.stringify({
        type: 'ask',
        tool,
        timestamp: new Date().toISOString(),
        session_id: payload.conversation_id ?? payload.session_id ?? null,
      })}\n`,
    );
  } catch {
    /* fail open */
  }
  process.exit(0);
});
