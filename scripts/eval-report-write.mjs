#!/usr/bin/env node
/**
 * Writes reports/eval-report.md from reports/eval-report-data.json.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_PATH = join(ROOT, 'reports', 'eval-report-data.json');
const OUT_PATH = join(ROOT, 'reports', 'eval-report.md');

function pct(rate) {
  if (rate == null || Number.isNaN(rate)) return 'n/a';
  return `${(rate * 100).toFixed(1)}%`;
}

function signalFlake(f) {
  if (!f.ghAvailable) return 'Could not reach GitHub — run locally with `gh auth login` or check CI artifact.';
  if (f.flakyTestCount === 0) return 'No retry-only passes in the window — suite looks stable under current retry policy.';
  if (f.rate < 0.01) return 'Occasional flakes — monitor but not blocking.';
  if (f.rate < 0.05) return 'Elevated flake rate — investigate timing/data isolation before adding coverage.';
  return 'High flake rate — fix or quarantine flaky tests before trusting red/green signal.';
}

function signalHeal(h) {
  if (h.maskedRegression > 0) return `BLOCKER: ${h.maskedRegression} heal(s) touched \`tests/\` — possible masked regression.`;
  if (h.total === 0) return 'No heal PRs in history — drift repairs not exercised yet.';
  if (h.rate === 1) return 'All heals were POM-only with green CI — drift repair process is working.';
  if (h.rate >= 0.8) return 'Most heals clean — review failures for assertion changes or incomplete fixes.';
  return 'Heal success below target — triage before healing and enforce assertion-guard.';
}

function signalGeneration(g) {
  if (g.total === 0) return 'No agent-generated PRs in window — generation pipeline not exercised.';
  if (g.rate === 1) return 'Every generated PR green on first CI — generation gate and test-writer quality look good.';
  if (g.rate >= 0.7) return 'Most PRs pass first run — review failures for constitution violations or AC gaps.';
  return 'Low first-pass rate — tighten test-writer prompts and generation-gate before scaling backlog.';
}

function signalAsk(a) {
  if (a.needsSessionReview) return 'No telemetry yet — review this session for invented URLs, credentials, or ticket IDs without AskQuestion.';
  const total = a.asks + a.guesses;
  if (total === 0) return 'No ask/guess events recorded.';
  const askRatio = a.asks / total;
  if (askRatio >= 0.8) return 'Agent mostly asked — low risk of silent wrong assumptions.';
  if (askRatio >= 0.5) return 'Mixed ask/guess — tighten prompts on env vars and AC ambiguity.';
  return 'Too many guesses — add AskQuestion for missing feature/risk/env inputs.';
}

function topRisk(data) {
  if (data.heal.maskedRegression > 0) {
    return {
      risk: 'Masked regression from self-heal (assertions or specs changed during drift repair)',
      action: 'Revert heals that touched `tests/`; re-run triage; repair POM only with assertion-guard green.',
    };
  }
  if (data.flake.flakyTestCount > 0 && data.flake.rate >= 0.05) {
    return {
      risk: `Flake rate ${pct(data.flake.rate)} — CI green may not mean stable tests`,
      action: 'Identify retry-only tests from last E2E logs; fix root cause or reduce `retries` to surface flakes.',
    };
  }
  if (data.generationGate.total > 0 && (data.generationGate.rate ?? 0) < 0.7) {
    return {
      risk: 'Agent-generated specs often fail first PR CI',
      action: 'Audit failing PRs for generation-gate violations and AC mapping; update test-writer checklist.',
    };
  }
  if (data.askVsGuess.guesses > data.askVsGuess.asks) {
    return {
      risk: 'Agent invents values instead of asking — wrong env or AC assumptions',
      action: 'Require AskQuestion for missing inputs; log guesses in `.cursor/eval/telemetry.jsonl`.',
    };
  }
  return {
    risk: 'No critical signal in window — maintain current gates',
    action: 'Keep running eval-report after each test-generation and orchestrator session.',
  };
}

if (!existsSync(DATA_PATH)) {
  console.error(`Missing ${DATA_PATH} — run: node scripts/eval-report-collect.mjs`);
  process.exit(1);
}

const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
const risk = topRisk(data);

const md = `# Suite Reliability Report

Generated: ${data.generatedAt}  
Trigger: ${data.trigger}

---

## Flake rate

| | |
|---|---|
| **Value** | ${data.flake.rateLabel} (${pct(data.flake.rate)}) |
| **Measured** | ${data.flake.measured} |
| **Signal** | ${signalFlake(data.flake)} |

## Heal success rate

| | |
|---|---|
| **Value** | ${data.heal.rateLabel}${data.heal.rate != null ? ` (${pct(data.heal.rate)})` : ''} |
| **Masked regression** | **${data.heal.maskedRegression}** (must be 0) |
| **Measured** | ${data.heal.measured} |
| **Signal** | ${signalHeal(data.heal)} |

## Generation-gate pass rate

| | |
|---|---|
| **Value** | ${data.generationGate.rateLabel}${data.generationGate.rate != null ? ` (${pct(data.generationGate.rate)})` : ''} |
| **Measured** | ${data.generationGate.measured} |
| **Signal** | ${signalGeneration(data.generationGate)} |

## Ask vs guess

| | |
|---|---|
| **Value** | ${data.askVsGuess.rateLabel} |
| **Measured** | ${data.askVsGuess.measured} |
| **Signal** | ${signalAsk(data.askVsGuess)} |

---

## Top reliability risk

${risk.risk}

## Next action

${risk.action}
`;

writeFileSync(OUT_PATH, md);
console.log(`Wrote ${OUT_PATH}`);
