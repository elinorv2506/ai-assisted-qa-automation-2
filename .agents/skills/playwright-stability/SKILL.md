---
name: playwright-stability
description: Playwright config stability settings and deterministic time handling.
  Apply when writing tests that assert on dates, relative timestamps, or when
  configuring or reviewing playwright.config.ts and CI parity.
---

# Playwright Stability

## Config (playwright.config.ts)

These settings are fixed in `playwright.config.ts` — do not override in specs
unless a test explicitly documents why.

| Setting | Value | Why |
|---------|-------|-----|
| `fullyParallel` | `true` | Maximize throughput |
| `retries` | `process.env.CI ? 2 : 0` | Local fails loudly; CI tolerates one transient blip |
| `use.baseURL` | `process.env.DIDAXIS_URL` | Env-driven target |
| `use.trace` | `'on-first-retry'` | Trace only when CI/local retry runs |
| `use.locale` | `'en-US'` | Pinned — matches Desktop Chrome default |
| `use.timezoneId` | `'UTC'` | Pinned — matches GitHub Actions ubuntu / CI cron |

**Do not** raise `retries` above `2`. **Do not** set `workers: 1`.

The `setup` project + `storageState` dependency on `chromium` must stay intact.

## Isolation

Tests must not share mutable state across parallel workers:

- **Unique data** — `uniqueName(base)` or `` `${base} ${Date.now()}` `` for every created record
- **Cleanup** — `trackProgram(uuid)` so teardown runs per test, not per file
- **No static names** — hardcoded program names collide under `fullyParallel: true`
- **Independent setup** — each test creates what it needs; do not rely on execution order

## Frozen time with page.clock.install()

When a test asserts on `Date.now()`, relative timestamps, or date text rendered
by the app, freeze time **before** navigation or any action that reads the clock.

Call `page.clock.install()` at the start of the test (or in `beforeEach` for a
describe block). One `{ tag: '@clock' }` per test that uses a fake clock.

### Example — unique program name with a stable timestamp

```typescript
import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';

test('TC-NNN — created program name includes frozen timestamp', { tag: '@clock' }, async ({
  page,
  trackProgram,
}) => {
  const frozen = new Date('2026-08-08T16:00:00.000Z');
  await page.clock.install({ time: frozen });

  const programsPage = new ProgramsPage(page);
  await programsPage.goto();

  const programName = `Web Development 2026 ${Date.now()}`;
  await programsPage.openNewProgramForm();
  await programsPage.createProgram(programName, trackProgram, {
    description: 'Frozen-clock stability example',
  });

  await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
});
```

With the clock installed, `Date.now()` always returns `frozen.getTime()`, so the
name is identical on every run and between local and CI.

### Rules

- Install the clock **before** `goto()` or any code path that calls `Date.now()`.
- Prefer frozen time over `uniqueName()` when the test asserts on the timestamp
  string itself; keep `uniqueName()` when you only need collision avoidance.
- Do not mix real time and fake time in the same test without pausing/resuming
  the clock intentionally.
- Route UI through POMs; no inline locators.

## When reviewing

- [ ] No `workers: 1` or `retries > 2` added to config or spec-level overrides
- [ ] Timestamp assertions use `page.clock.install()` or accept config-pinned locale/timezone
- [ ] `setup` project and `storageState` dependency unchanged
