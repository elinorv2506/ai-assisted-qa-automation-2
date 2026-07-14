---
name: didaxis-bulk-cleanup
description: Deletes Didaxis programs via the REST API on user request. Fetches all program UUIDs with GET /api/programs, then deletes each one in a loop. Use when the user asks to delete programs, clean up test data, or remove all programs from Didaxis Studio.
---

# Didaxis Bulk Program Cleanup

Deletes programs through the REST API — not the UI. Use for one-off cleanup of
accumulated test data in Didaxis Studio.

## Before you start

1. **Confirm scope with the user.** Bulk delete is destructive. If they asked to
   remove *all* programs, proceed. If the request is ambiguous, list programs
   first (dry run) and ask for confirmation.

2. **Load credentials** from project `.env` files (same as tests):
   - `.env`
   - `TODO_MVC/.env`

   Required variables (at least one auth path):
   - `DIDAXIS_URL` — defaults to `https://test.didaxis.studio`
   - `DIDAXIS_API_TOKEN` — preferred; validated with `GET /api/programs`
   - `DIDAXIS_EMAIL` + `DIDAXIS_PASSWORD` — fallback via `POST /api/auth/login`

3. **Never hardcode tokens or passwords.**

## Preferred: run the utility script

From the project root:

```bash
# List programs without deleting
node .cursor/skills/didaxis-bulk-cleanup/scripts/bulk-delete-programs.mjs --dry-run

# Delete all programs
node .cursor/skills/didaxis-bulk-cleanup/scripts/bulk-delete-programs.mjs
```

Report the script summary to the user: total found, deleted, failed.

## Manual workflow (if script is unavailable)

1. Resolve `BASE_URL` from `DIDAXIS_URL` (default `https://test.didaxis.studio`).
2. Resolve Bearer token:
   - If `DIDAXIS_API_TOKEN` is set, probe `GET ${BASE_URL}/api/programs` with
     `Authorization: Bearer <token>`. Use the token if the response is OK.
   - Otherwise `POST ${BASE_URL}/api/auth/login` with
     `{ email, password }` and extract the token from
     `token`, `data.token`, `data.access_token`, `accessToken`, or
     `data.accessToken`.
3. `GET ${BASE_URL}/api/programs` with the Bearer token.
4. Extract UUIDs from the response. Programs use `id` — typically
   `response.data` is an array of `{ id, name, ... }`.
5. For each UUID: `DELETE ${BASE_URL}/api/programs/<uuid>` with the same Bearer
   header. Log success or HTTP status per program.
6. If GET returns zero programs, tell the user the environment is already clean.

## API reference

| Action | Method | Endpoint |
|--------|--------|----------|
| List   | GET    | `/api/programs` |
| Delete | DELETE | `/api/programs/<uuid>` |
| Login  | POST   | `/api/auth/login` |

Auth header: `Authorization: Bearer <token>`

## Safety rules

- Do not delete programs on production (`didaxis.studio`) unless the user
  explicitly names that environment.
- Default target is the test environment (`test.didaxis.studio`).
- Continue deleting remaining programs when one DELETE fails; report failures at
  the end.
- This skill is for **bulk** cleanup. Per-test cleanup belongs in
  `fixtures/cleanup.fixture.ts` (see `playwright-test-cleanup` skill).

## Additional resources

- For usage examples, see [examples.md](examples.md)
