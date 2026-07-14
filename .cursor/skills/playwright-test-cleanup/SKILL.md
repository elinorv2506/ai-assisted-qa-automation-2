---
name: playwright-test-cleanup
description: Ensures Playwright tests clean up the data they create. Use whenever generating or reviewing tests that create programs (or any persistent records) in Didaxis, so test data does not accumulate. Apply this to every test that creates data — even if cleanup isn't explicitly requested.
---

# Playwright Test Data Cleanup

## API Cleanup for Test Data

Tests that create data must remove it. Leftover data slows the app and
makes test runs unreliable. Every test that creates a program must track
its UUID and delete it via the API afterwards.

## Steps

1. Use the shared cleanup fixture in `fixtures/cleanup.fixture.ts`.
   Import `test` from there, not from `@playwright/test`.

2. When a test creates a program, capture the program's UUID from the POST
   response (`response.data.id`) and call `trackProgram(uuid)` immediately.

3. Do not write manual `afterAll` blocks for cleanup — the fixture
   handles teardown for every test that uses it.

4. Cleanup uses the DELETE API, not the UI:
   `DELETE /api/programs/<uuid>` with a Bearer token. The fixture uses
   `DIDAXIS_API_TOKEN` when valid; otherwise it logs in via
   `POST /api/auth/login` using `DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD`.

5. Never hardcode the token. Never delete data the test did not create.

## Reference

- Endpoint: DELETE https://didaxis.studio/api/programs/<uuid>
- Auth: Authorization: Bearer ${DIDAXIS_API_TOKEN}

## When generating tests

- Import `test` and `trackProgram` from `fixtures/cleanup.fixture.ts`.
- After any create (UI flow with intercepted POST, or direct API call), call `trackProgram(uuid)` before assertions that depend on the record existing.
- If a test only reads existing seed data, do not track or delete anything.

## When reviewing tests

Flag any test that:

- Imports `test` from `@playwright/test` instead of the cleanup fixture
- Creates programs (or other persistent records) without `trackProgram`
- Uses manual `afterAll` / `afterEach` cleanup instead of the fixture
- Deletes via the UI instead of the DELETE API
- Hardcodes API tokens or deletes UUIDs the test did not create

## Additional resources

- For worked examples, see [examples.md](examples.md)
