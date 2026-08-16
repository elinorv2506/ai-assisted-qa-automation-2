# Didaxis Playwright E2E

End-to-end tests and AI-assisted QA automation for [Didaxis Studio](https://test.didaxis.studio). Specs live under `tests/`; UI interactions are in `pages/`.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- npm (included with Node)

## Install

```bash
git clone https://github.com/elinorv2506/ai-assisted-qa-automation-2.git
cd ai-assisted-qa-automation-2
npm ci
npx playwright install --with-deps chromium
```

## Environment

Copy the example file and fill in your values (never commit `.env`):

```bash
cp .env.example .env
```

```powershell
# Windows
copy .env.example .env
```

See [`.env.example`](.env.example) for every variable. **Required to run tests locally:**

| Variable | Purpose |
|----------|---------|
| `DIDAXIS_URL` | Base URL of the Didaxis environment under test |
| `DIDAXIS_EMAIL` | Admin login email (used once by `auth.setup.ts` → `storageState`) |
| `DIDAXIS_PASSWORD` | Admin login password |
| `DIDAXIS_API_TOKEN` | Bearer token for API cleanup and contract checks |

Optional `DIDAXIS_ALT_EMAIL` / `DIDAXIS_ALT_PASSWORD` support permission-probe scenarios with a non-admin account.

## Run tests

Full suite (Chromium, authenticated via saved `storageState`):

```bash
npx playwright test
```

Headed / debug:

```bash
npx playwright test --headed
npx playwright test --debug
```

Open the last HTML report:

```bash
npx playwright show-report
```

## Run a tagged slice

Each test carries exactly one importance tag (`@smoke`, `@sanity`, `@regression`, `@api`, `@e2e`, or `@destructive`). Use the npm scripts or `--grep`:

```bash
npm run test:smoke        # critical happy-path (~6 tests)
npm run test:sanity       # lightweight UI checks
npm run test:regression   # negative, edge, a11y, network mocks
npm run test:api          # API contract checks
npm run test:e2e          # multi-step UI journeys
npm run test:destructive  # shared-state mutations — serial (--workers=1)
```

Examples:

```bash
npm run test:smoke
npx playwright test tests/ds5-program-list-display.spec.ts --grep @api
```

## CI

- **E2E Tests** (`.github/workflows/e2e.yml`) — tiered by tag and trigger; needs the four `DIDAXIS_*` secrets:
  - **Push** → `@sanity` (`npm run test:sanity`)
  - **Pull request** → `@smoke` (`npm run test:smoke`)
  - **Manual (workflow_dispatch)** → full suite (`npx playwright test`)
- **Test Generation** (`.github/workflows/test-generation.yml`) — headless Cursor agent backlog run; also needs `CURSOR_API_KEY` and Atlassian secrets (see `.env.example`). Ends with **`reports/eval-report.md`** (reliability artifact).

## Agent & skill setup (optional)

You do **not** need this section to run Playwright locally. It is for Cursor-driven test generation, triage, and Jira integration.

### `.cursor/` layout

| Path | Role |
|------|------|
| [`.cursor/rules/constitution.mdc`](.cursor/rules/constitution.mdc) | Always-on MUST / SHOULD / WON'T for locators, auth, assertions |
| [`.cursor/rules/qa-orchestration.mdc`](.cursor/rules/qa-orchestration.mdc) | How the coordinator delegates to agents and heals on red |
| [`.cursor/agents/`](.cursor/agents/) | **triage**, **test-writer**, **bug-reporter** subagents |
| [`.cursor/skills/`](.cursor/skills/) | Playwright, Jira, a11y, self-heal, and related skills |
| [`.cursor/hooks.json`](.cursor/hooks.json) | Post-edit guards (constitution WON'T violations, assertion weakening) |

### Secrets & MCP

1. Add **Agent / CI** vars from `.env.example` to GitHub Actions secrets for `test-generation.yml`.
2. In **Cursor → Settings → MCP**, configure the Atlassian plugin (Jira/Confluence) with your account — tokens are stored in Cursor, not in the repo.
3. Set `CURSOR_API_KEY` for the headless `agent` CLI used in CI.

Typical flow: Jira ticket → `jira-ticket-to-gherkin` skill → **test-writer** agent → `npx playwright test` → **triage** on failure → self-heal (drift) or **bug-reporter** (real defect).

## Project conventions

- **Locators:** role-based, defined in `pages/` (see [constitution](.cursor/rules/constitution.mdc)).
- **Auth:** one UI login in `tests/auth.setup.ts`; specs reuse `storageState` — no per-test login.
- **Cleanup:** tests that create programs/users register teardown via `fixtures/cleanup.fixture.ts`.
