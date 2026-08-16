---
name: self-heal
description: >-
  Repairs drifted Playwright locators after a UI change — re-discovers
  elements via the Agent-Browser a11y tree and patches the POM with a
  minimal role-based diff. Use ONLY after triage classifies the red run
  as a test issue (drift); NEVER for a real app bug. Triggers on "the
  build is red because a locator broke", "fix the drifted selector",
  "the test broke after a UI change", or "heal the suite".
---

# Self-Heal (Locator Drift Repair)

Repairs **one** drifted locator per run. Every heal becomes a PR.

## Preconditions — stop if not met

**Require triage's drift classification.** The red run must already be
classified as **Test issue (drift)** by [ci-failure-triage](../ci-failure-triage/SKILL.md).

- **Not triaged yet?** Stop. Run triage first.
- **Classified as app bug?** Stop. Route to
  [jira-bug-reporter](../jira-bug-reporter/SKILL.md) — do not heal.
- **Inconclusive?** Stop. Ask a human to confirm drift vs app bug.

This skill is for **locator drift only** — label/text/role changes that
broke a selector while the product behavior and AC remain correct.

## Workflow

Copy this checklist and track progress:

```
Heal progress:
- [ ] Step 1: Confirm triage drift classification
- [ ] Step 2: Extract failing locator + POM from trace
- [ ] Step 3: Re-discover element via Agent-Browser a11y tree
- [ ] Step 4: Patch POM locator (minimal role-based diff)
- [ ] Step 5: Re-run — green with assertions unchanged
- [ ] Step 6: Report old→new diff + green run; open PR
```

### Step 1 — Require triage drift classification

Accept only an explicit **Test issue (drift)** verdict from triage
(PR comment or coordinator handoff). No classification → triage. App bug
→ bug-reporter. Never skip this gate.

### Step 2 — Find the failing locator and its POM

From the Playwright trace and triage report:

1. Identify the failing test, step, and timeout/error (locator not found,
   strict-mode violation, wrong element).
2. Map the call site in `tests/*.spec.ts` to the POM method in `pages/*.ts`.
3. Record the **current locator expression** (property name + full chain).

See [pom-conventions](../pom-conventions/SKILL.md) for locator priority:
`getByRole` → `getByLabel` / `getByPlaceholder` → `getByText` →
`getByTestId`.

### Step 3 — Re-discover via Agent-Browser a11y tree

Use the **cursor-ide-browser** MCP (Agent-Browser):

1. `browser_navigate` to the page/state from the failing step (reuse
   auth/fixtures from the spec if needed).
2. `browser_snapshot` — read the accessibility tree.
3. Find the target by **role + current accessible name** (and optional
   `filter({ hasText })` / parent context from the trace screenshot).
4. Derive the new locator following POM priority — role-first, never CSS/XPath.

If the element is missing from the a11y tree or behavior contradicts AC,
**stop** — this is likely an app bug, not drift. Escalate to triage /
bug-reporter.

### Step 4 — Patch the POM only

Edit **only** the drifted locator in `pages/*.ts`:

- Minimal diff: update role, name, or filter — nothing else.
- **Never** edit spec assertions, expected values, or test logic.
- **Never** edit application source.
- **Never** weaken assertions (`.toBeVisible()` → loose match,
  `expect.soft`, extra `.first()`, delete checks) to force green.

One locator repair per run. Multiple failures → heal the primary drift
from triage; leave the rest for a follow-up run.

### Step 5 — Re-run and prove green with assertions unchanged

```bash
npx playwright test <spec-file> -g "<failing test title>" --workers=1
```

Verify:

- Run is **green**.
- **Assertions in the spec are byte-for-byte unchanged** (`git diff tests/` must be empty).
- Failure was locator drift, not a masked regression.

**Green via a weakened assertion is a bug.** If the only path to green
requires changing assertions, **stop and escalate** — do not ship the heal.

### Step 6 — Report and open a PR

Post a structured summary (PR comment or handoff):

```markdown
## Self-heal: locator drift repair

**Classification:** Test issue (drift) — triage run <run-id>

**Failing test:** `tests/...spec.ts` — "<test title>"

**Locator diff:**
| | |
|---|---|
| **POM** | `pages/...ts` → `<property>` |
| **Old** | `page.getByRole('button', { name: 'Save' })` |
| **New** | `page.getByRole('button', { name: 'Save program' })` |

**Re-discovery:** role=`button`, accessible name=`Save program` (Agent-Browser snapshot)

**Verification:** `npx playwright test ...` — **passed** · assertions unchanged

**PR:** <branch / URL>
```

Every heal becomes a PR:

1. Branch: `fix/self-heal-<short-description>`
2. Commit: POM locator patch only
3. `git push -u origin HEAD` → `gh pr create` with triage link + locator diff

Do not merge without human approval.

## Rules

| Do | Don't |
|----|-------|
| Heal after triage says **drift** | Heal app bugs or untriaged reds |
| Patch `pages/*.ts` locators only | Touch spec assertions or app code |
| Re-discover via a11y role + name | Guess selectors from DOM/CSS |
| One locator repair per run | Batch unrelated heals |
| Open a PR for every heal | Push directly to main |
| Prove green with assertions intact | Weaken expects to force pass |

## Related skills

- [ci-failure-triage](../ci-failure-triage/SKILL.md) — required gate; supplies classification + trace
- [pom-conventions](../pom-conventions/SKILL.md) — locator priority and POM layout
- [jira-bug-reporter](../jira-bug-reporter/SKILL.md) — when drift diagnosis was wrong
