---
name: playwright-api-fixture
description: Use Playwright's request fixture and the cleanup fixture for API
  setup, teardown, and contract checks. Apply when a test seeds data via API,
  asserts on response status/body, or needs programmatic auth outside UI login.
---

# Playwright API Fixture

Use the API layer for **setup/teardown** and **contract checks** — not for
asserting UI behavior the test is meant to verify through the browser.

## Default — cleanup fixture

Import `test` and `expect` from `fixtures/cleanup.fixture.ts`, not
`@playwright/test`. The extended fixture provides:

- **`trackProgram(uuid)`** — registers programs for DELETE teardown after the test
- Internal `request` context with Bearer token resolution (env token or
  `POST /api/auth/login` via `DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD`)

```typescript
import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';

test('TC-NNN — create via UI, cleanup via API', async ({ page, trackProgram }) => {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
  await programsPage.openNewProgramForm();
  await programsPage.createProgram(`QA Program ${Date.now()}`, trackProgram);
});
```

Every test that creates a program **must** call `trackProgram(uuid)` immediately
after capture. Never hardcode `DIDAXIS_API_TOKEN` in specs.

## Built-in `{ request }` fixture

Use Playwright's `{ request }` when the test needs direct HTTP calls without
opening a browser — contract checks, bulk seeding, or verifying an endpoint
shape before/after UI action.

```typescript
import { test, expect } from '../fixtures/cleanup.fixture';

test('TC-NNN — GET /api/programs returns array', { tag: '@api-contract' }, async ({ request }) => {
  const token = process.env.DIDAXIS_API_TOKEN;
  test.skip(!token, 'DIDAXIS_API_TOKEN required for contract check');

  const res = await request.get('/api/programs', {
    headers: { Authorization: `Bearer ${token}` },
  });

  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(Array.isArray(body.data)).toBe(true);
});
```

For auth when no env token: follow the same login flow as
`fixtures/cleanup.fixture.ts` (`POST /api/auth/login`) — do not duplicate
credential handling differently across specs.

## API login (speed path)

From `auth-strategy.md` — use when `storageState` is stale or for one-off
scripts:

1. `POST /api/auth/login` with `{ email, password }`
2. Extract token from response body
3. Pass `Authorization: Bearer ${token}` on subsequent requests

Do **not** replace `storageState` UI tests with API login unless the test plan
explicitly targets API-only setup.

## Rules

- **Setup/teardown** — API; **AC under test** — UI via POMs when the story is UI-facing
- Never delete UUIDs the test did not create
- Never use manual `afterAll` for program cleanup — use `trackProgram`
- Contract tests: one `{ tag: '@api-contract' }` per test
- Base URL comes from `DIDAXIS_URL` / config `baseURL` — no hardcoded hosts in specs

## When reviewing

- [ ] Creates use `trackProgram`, not manual DELETE in `afterAll`
- [ ] No hardcoded Bearer tokens
- [ ] Contract assertions use `{ request }`, UI assertions use `{ page }` + POMs
- [ ] API login only where auth-strategy allows (bulk/stale session)
