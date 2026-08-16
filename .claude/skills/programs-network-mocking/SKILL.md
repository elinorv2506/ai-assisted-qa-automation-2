---
name: programs-network-mocking
description: Deterministic edge-case tests for the Didaxis programs flow using
  page.route. Apply when writing or reviewing network-failure, empty-list,
  or malformed-payload scenarios for GET/POST/PUT/PATCH/DELETE /api/programs.
---

# Programs Flow — Network Mocking

Use `page.route` for deterministic edge cases in the programs flow.
Route all UI interactions through existing POMs in `pages/` — never inline
locators or direct DOM clicks in the spec.

## Before you assert — read the real UI

1. Open the live page with **cursor-ide-browser MCP** or Playwright (stored
   session from `auth.setup.ts`). Navigate to `/programs` on
   `DIDAXIS_URL` / `https://test.didaxis.studio`.
2. Reproduce or simulate the scenario manually if needed, then **read the
   actual copy** the app renders for error and empty states.
3. Add or reuse POM locators for those strings — do **not** invent message
   text in assertions.
4. If the app renders **nothing** for a failure case, document that in the
   test comment and assert observable behavior only (e.g. modal stays open,
   list unchanged) — do not guess a toast or banner.

**Known from existing specs (verify live before relying on them):**

| Scenario | Observed UI (as of repo audit) |
|----------|--------------------------------|
| POST save failure (500 mocked) | Modal stays open; field values preserved; no new row — **no error message asserted** (`ds1-create-program.spec.ts` TC-011) |
| DELETE failure (500 mocked) | Row remains in list — **app may not surface delete errors** (`ds4-delete-program.spec.ts` TC-013) |
| GET empty list (real zero programs) | POM `emptyStateMessage` matches `/no programs have been created\|no programs yet\|no programs found/i` — **confirm exact string live** |
| GET load failure | TC-012 skipped; error vs empty-state copy **not yet captured** |
| GET timeout / abort | Not yet implemented — must not show fake empty state; **read live copy** |

## Rules

- **Never mock the endpoint the test is verifying.** Mock only supporting
  calls. Example: testing create UX → mock POST; testing list load → mock GET.
- **One tag per test** — e.g. `{ tag: '@network-503-save' }`. Use `@network-*`
  prefix so mocked tests are filterable.
- Register `page.route` **before** the navigation or action that triggers the
  request. Call `route.continue()` for all non-mocked traffic.
- Prefer URL-specific routes over `**/*`:

```typescript
await page.route('**/api/programs**', async (route) => {
  const { method, url } = route.request();
  if (method === 'GET' && !url.match(/\/api\/programs\/[^/]+$/)) {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    return;
  }
  await route.continue();
});
```

## Scenario catalog

Mock `**/api/programs**` (adjust method/path per row). Assert via POM +
web-first `expect`. Discover copy on the real page first.

| Tag | Method | Status / body | Assert |
|-----|--------|---------------|--------|
| `@network-503-save` | POST | 503 | UI error state on save — **read live copy**; modal/list per AC |
| `@network-empty-list` | GET (collection) | 200 `{ data: [] }` | `programsPage.emptyStateMessage` visible; `+ New Program` still available |
| `@network-malformed-list` | GET (collection) | 200 invalid JSON or `{ data: null }` | Page heading/shell visible; no uncaught crash (no white screen) |
| `@network-401-list` | GET (collection) | 401 | Auth error or redirect — **read live**; must not show fake empty state |
| `@network-403-list` | GET (collection) | 403 | Forbidden message — **read live** |
| `@network-404-program` | GET (single) | 404 | Not-found handling — **read live** or note if unhandled |
| `@network-500-list` | GET (collection) | 500 | Error/retry UI — **not** TC-002 empty state (`ds5` TC-012) |
| `@network-timeout-list` | GET (collection) | `route.abort()` or never fulfilled | Loading/error UI — **not** empty state; **read live copy** |
| `@network-502-list` | GET (collection) | 502 | Same as load failure; distinguish from genuine empty |
| `@network-501-save` | POST | 501 | Save failure UX — same discovery as 503 save |
| `@network-503-edit` | PUT/PATCH | 503 | Edit modal stays open; list unchanged (see `ds2-edit-program` TC-012) |
| `@network-500-delete` | DELETE | 500 | Row preserved; surface error only if live UI shows one |
| `@network-300-list` | GET (collection) | 300 + Location | Redirect handled gracefully or login prompt — **read live** |

## Existing patterns in this repo

- Create failure: `ds1-create-program.spec.ts` — POST + `/program/i` → 500
- Edit failure: `ds2-edit-program.spec.ts` — PUT/PATCH → 500
- Delete failure: `ds4-delete-program.spec.ts` — DELETE `/api/programs/` → 500
- Skipped load failure: `ds5-program-list-display.spec.ts` TC-012

When adding new mocked tests, tighten URL/method matchers to the rows above
instead of broad `**/*` catches.

### Timeout example

```typescript
await page.route('**/api/programs**', async (route) => {
  if (route.request().method() === 'GET') {
    await route.abort('timedout');
    return;
  }
  await route.continue();
});
```

Alternatively, never call `fulfill`/`continue` to simulate a hung request.
Assert loading spinner, error banner, or stale content — never the empty-state
message meant for a genuine zero-program list.

## POM gaps

If error or empty-state copy needs a new locator, note it in the handoff —
test-writer does not edit `pages/`. Coordinator or human adds the POM field.
