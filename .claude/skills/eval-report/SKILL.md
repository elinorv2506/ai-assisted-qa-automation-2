---
name: eval-report
description: Generates reports/eval-report.md — a suite reliability report with flake rate, heal success, generation-gate pass rate, and ask-vs-guess. Use after test-generation.yml completes, after any agent/orchestrator session, or when the user asks for a reliability or eval report. Cursor has no built-in telemetry; metrics come from CI logs, PR history, hooks, and session review.
---

# Eval Report

Produces `reports/eval-report.md` — a short reliability snapshot for the
Playwright suite and agent pipeline.

## When to run

- **CI:** end of `.github/workflows/test-generation.yml` (automated)
- **Local:** agent/orchestrator session end (`stop` hook, silent) or `npm run eval-report`
- **On demand:** user asks for reliability / eval report

## Procedure

1. **Collect** — `node scripts/eval-report-collect.mjs --runs 10 --trigger "<context>"`
2. **Write** — `node scripts/eval-report-write.mjs`
3. **Session review (ask-vs-guess)** — if telemetry is empty, scan the session
   for values the agent invented (URLs, credentials, ticket IDs, AC details)
   without `AskQuestion`. Log guesses:
   ```json
   {"type":"guess","field":"DIDAXIS_URL","timestamp":"..."}
   ```
   to `.cursor/eval/telemetry.jsonl`, then re-run step 1–2.

Or: `npm run eval-report`

## Report sections

Each section must include: **value**, **how measured**, **one-line signal**.

### Flake rate

Tests that **passed only on retry** in the last N E2E CI runs.

| Source | Method |
|--------|--------|
| CI logs | `gh run list --workflow=e2e.yml` → `gh run view --log`; count `Retry #` blocks and flaky test titles |

**Signal guide:** 0 flakes = stable; rising rate = fix before expanding coverage.

### Heal success rate

Drift heals that went green with **POM-only** diffs / total heal PRs.

| Source | Method |
|--------|--------|
| PR history | `gh pr list --search "self-heal in:head"` |
| Masked regression | Count heals where PR diff touches `tests/` — **must be 0** |

**Signal guide:** masked regression > 0 is a blocker; revert and re-heal locators only.

### Generation-gate pass rate

Agent-generated specs that are **green + conforming + maps-to-AC** on first PR.

| Source | Method |
|--------|--------|
| PR history | DS-* titled PRs; first `statusCheckRollup` green |
| Conforming | `generation-gate.mjs` + constitution-guard on spec edits |
| Maps-to-AC | Human PR review vs Jira AC (not automatable) |

**Signal guide:** low first-pass rate → tighten test-writer and generation-gate.

### Ask vs guess

Times the agent **asked** vs **invented** a value.

| Source | Method |
|--------|--------|
| Asks | `postToolUse` hook → `.cursor/eval/telemetry.jsonl` (`type: ask`) |
| Guesses | Session review; manual `type: guess` log entries |

**Signal guide:** guesses > asks → require AskQuestion for ambiguous inputs.

## Output template

Written to `reports/eval-report.md`:

```markdown
# Suite Reliability Report

Generated: <ISO timestamp>
Trigger: <workflow run id | local session>

## Flake rate
| **Value** | … |
| **Measured** | … |
| **Signal** | … |

## Heal success rate
| **Value** | … |
| **Masked regression** | **N** (must be 0) |
| **Measured** | … |
| **Signal** | … |

## Generation-gate pass rate
…

## Ask vs guess
…

## Top reliability risk
…

## Next action
…
```

## Guardrails

- Do not fabricate numbers — use collected JSON or mark `n/a`
- Masked regression count is explicit; never hide non-zero
- Re-run after logging guess events from session review
