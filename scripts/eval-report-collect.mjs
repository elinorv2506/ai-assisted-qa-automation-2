#!/usr/bin/env node
/**
 * Collects raw reliability metrics for eval-report.md.
 * Sources: gh CLI (CI logs, PR history), .cursor/eval/telemetry.jsonl (ask events).
 * Cursor has no built-in telemetry — ask-vs-guess guesses need session review.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'reports');
const TELEMETRY = join(ROOT, '.cursor', 'eval', 'telemetry.jsonl');

const args = process.argv.slice(2);
const runsIdx = args.indexOf('--runs');
const triggerIdx = args.indexOf('--trigger');
const RUN_COUNT = runsIdx >= 0 ? Number.parseInt(args[runsIdx + 1], 10) || 10 : 10;
const TRIGGER = triggerIdx >= 0 ? args[triggerIdx + 1] : 'local';

function gh(cmd) {
  const candidates = ['gh', '"C:\\Program Files\\GitHub CLI\\gh.exe"'];
  for (const bin of candidates) {
    try {
      return execSync(`${bin} ${cmd}`, {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      }).trim();
    } catch {
      /* try next */
    }
  }
  return null;
}

function ghJson(subcmd, fields) {
  const out = gh(`${subcmd} --json ${fields}`);
  if (!out) return [];
  try {
    return JSON.parse(out);
  } catch {
    return [];
  }
}

function parseFlakesFromLog(log) {
  const flaky = new Set();
  let retries = 0;
  let passed = 0;

  for (const line of log.split('\n')) {
    if (/Retry\s+#\d+/i.test(line)) retries += 1;
    if (/^\s*\d+\s+(passed|failed|flaky)/i.test(line) || /\d+\s+passed/i.test(line)) {
      const m = line.match(/(\d+)\s+passed/);
      if (m) passed = Math.max(passed, Number.parseInt(m[1], 10));
    }
    const retryTest = line.match(/(?:✘|×|FAIL).*?›\s*(.+?)(?:\s+\(\d+ms\))?$/);
    if (retryTest && /Retry/i.test(log.slice(Math.max(0, log.indexOf(line) - 200), log.indexOf(line) + 200))) {
      flaky.add(retryTest[1].trim());
    }
  }

  const retryBlocks = log.match(/Retry #\d+[\s\S]{0,400}?›\s*([^\n]+)/g) ?? [];
  for (const block of retryBlocks) {
    const title = block.match(/›\s*([^\n]+)/);
    if (title) flaky.add(title[1].trim());
  }

  return { flakyTests: [...flaky], retryEvents: retries, passedTests: passed };
}

function collectFlakeRate(n) {
  const runs =
    ghJson(
      `run list --workflow=e2e.yml --limit ${n}`,
      'databaseId,conclusion,displayTitle,workflowName,createdAt,url',
    ) ?? [];

  const e2eRuns = runs.filter((r) => r.workflowName === 'E2E Tests' || r.displayTitle?.includes('E2E'));
  let totalFlaky = 0;
  let totalPassed = 0;
  const runDetails = [];

  for (const run of e2eRuns.slice(0, n)) {
    const log = gh(`run view ${run.databaseId} --log`) ?? '';
    const { flakyTests, retryEvents, passedTests } = parseFlakesFromLog(log);
    totalFlaky += flakyTests.length;
    totalPassed += passedTests;
    runDetails.push({
      id: run.databaseId,
      conclusion: run.conclusion,
      url: run.url,
      flakyTests,
      retryEvents,
      passedTests,
    });
  }

  const denominator = totalPassed || 1;
  return {
    windowRuns: e2eRuns.length,
    flakyTestCount: totalFlaky,
    passedTestCount: totalPassed,
    rate: totalFlaky / denominator,
    rateLabel: `${totalFlaky} flaky test(s) / ${totalPassed} passed across last ${e2eRuns.length} E2E runs`,
    measured: `Parsed \`gh run view --log\` for Playwright \`Retry #\` blocks on E2E workflow (N=${n})`,
    runs: runDetails,
    ghAvailable: e2eRuns.length > 0 || gh('auth status') !== null,
  };
}

async function prFilesChanged(number) {
  const out = gh(`api repos/{owner}/{repo}/pulls/${number}/files --paginate`);
  if (!out) return [];
  try {
    return JSON.parse(out).map((f) => f.filename);
  } catch {
    return [];
  }
}

async function collectHealRate() {
  const prs =
    ghJson(
      'pr list --state all --limit 50 --search "self-heal in:head"',
      'number,title,state,headRefName,mergedAt,statusCheckRollup,url,createdAt,labels',
    ) ?? [];
  const healPrs = prs.filter(
    (p) => p.headRefName?.includes('self-heal') || /self-heal/i.test(p.title ?? ''),
  );

  let healedClean = 0;
  let total = healPrs.length;
  let maskedRegression = 0;
  const details = [];

  for (const pr of healPrs) {
    const files = await prFilesChanged(pr.number);
    const touchedTests = files.some((f) => f.startsWith('tests/'));
    const touchedPages = files.some((f) => f.startsWith('pages/'));
    const checks = pr.statusCheckRollup ?? [];
    const green = checks.length === 0 || checks.every((c) => c.conclusion === 'SUCCESS' || c.conclusion === 'SKIPPED');
    const clean = green && touchedPages && !touchedTests;

    if (touchedTests) maskedRegression += 1;
    if (clean) healedClean += 1;

    details.push({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      url: pr.url,
      touchedTests,
      touchedPages,
      green,
      clean,
    });
  }

  return {
    healedClean,
    total,
    maskedRegression,
    rate: total ? healedClean / total : null,
    rateLabel: total ? `${healedClean} / ${total} drift heals clean` : 'No self-heal PRs found',
    measured: 'PR history via `gh pr list --search "self-heal in:head"`; masked regression = any PR diff touching `tests/`',
    prs: details,
  };
}

async function collectGenerationGate() {
  const prs =
    ghJson(
      'pr list --state all --limit 30',
      'number,title,state,headRefName,statusCheckRollup,url,createdAt,labels',
    ) ?? [];
  const generated = prs.filter(
    (p) =>
      /DS-\d+/i.test(p.title ?? '') ||
      (p.labels ?? []).some((l) => l.name === 'tests-generated'),
  );

  let passFirst = 0;
  const details = [];

  for (const pr of generated) {
    const checks = pr.statusCheckRollup ?? [];
    const smoke = checks.find((c) => /smoke|e2e/i.test(c.name ?? ''));
    const firstGreen = smoke?.conclusion === 'SUCCESS' || checks.every((c) => c.conclusion === 'SUCCESS' || c.conclusion === 'SKIPPED');
    if (firstGreen) passFirst += 1;

    details.push({
      number: pr.number,
      title: pr.title,
      url: pr.url,
      firstGreen,
      checks: checks.map((c) => ({ name: c.name, conclusion: c.conclusion })),
    });
  }

  const total = generated.length;
  return {
    passFirst,
    total,
    rate: total ? passFirst / total : null,
    rateLabel: total ? `${passFirst} / ${total} generated PRs green on first CI` : 'No agent-generated PRs found',
    measured:
      'PR history for DS-* titles; first-run green from `statusCheckRollup`; conforming + maps-to-AC verified by generation-gate hook + human PR review',
    prs: details,
  };
}

function collectAskVsGuess() {
  let asks = 0;
  const askEvents = [];

  if (existsSync(TELEMETRY)) {
    for (const line of readFileSync(TELEMETRY, 'utf8').split('\n').filter(Boolean)) {
      try {
        const evt = JSON.parse(line);
        if (evt.type === 'ask') {
          asks += 1;
          askEvents.push(evt);
        }
        if (evt.type === 'guess') {
          askEvents.push(evt);
        }
      } catch {
        /* skip bad line */
      }
    }
  }

  const guesses = askEvents.filter((e) => e.type === 'guess').length;

  return {
    asks,
    guesses,
    rateLabel: `${asks} ask(s), ${guesses} guess(es) logged`,
    measured:
      'AskQuestion events from `.cursor/eval/telemetry.jsonl` (postToolUse hook); guesses from session review — log manually or via stop-hook prompt',
    events: askEvents.slice(-20),
    needsSessionReview: guesses === 0 && asks === 0,
  };
}

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(dirname(TELEMETRY), { recursive: true });

const data = {
  generatedAt: new Date().toISOString(),
  trigger: TRIGGER,
  flake: collectFlakeRate(RUN_COUNT),
  heal: await collectHealRate(),
  generationGate: await collectGenerationGate(),
  askVsGuess: collectAskVsGuess(),
};

writeFileSync(join(OUT_DIR, 'eval-report-data.json'), JSON.stringify(data, null, 2));
console.log(`Wrote ${join(OUT_DIR, 'eval-report-data.json')}`);
