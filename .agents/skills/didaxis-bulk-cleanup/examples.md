# Examples: Didaxis bulk cleanup

## User asks to clean up all test programs

```
User: Delete all programs from Didaxis — test data piled up.

Agent:
1. Run dry-run to show count and names
2. Confirm with user if count is unexpectedly high
3. Run delete script
4. Report: "Deleted 12/12 programs from test.didaxis.studio"
```

```bash
node .cursor/skills/didaxis-bulk-cleanup/scripts/bulk-delete-programs.mjs --dry-run
node .cursor/skills/didaxis-bulk-cleanup/scripts/bulk-delete-programs.mjs
```

## User asks to remove programs after a failed test run

Same workflow. The bulk script removes every program visible to the authenticated
account — not just programs from the last test run.

## User asks to delete a specific program by name

Bulk cleanup deletes **all** programs. For a single program:

1. `GET /api/programs` and find the UUID where `name` matches.
2. `DELETE /api/programs/<uuid>` for that UUID only.
3. Do not run the bulk script.

## Dry run output (example)

```
[bulk-cleanup] Environment: https://test.didaxis.studio
[bulk-cleanup] Dry run — 3 program(s) would be deleted:
  - a1b2c3d4-...  QA Program 1718389200000
  - e5f6g7h8-...  API Program 1718389201000
  - i9j0k1l2-...  Smoke Test Program
```

## Delete output (example)

```
[bulk-cleanup] Environment: https://test.didaxis.studio
[bulk-cleanup] Found 3 program(s)
[bulk-cleanup] Deleted a1b2c3d4-... (QA Program 1718389200000)
[bulk-cleanup] Deleted e5f6g7h8-... (API Program 1718389201000)
[bulk-cleanup] Deleted i9j0k1l2-... (Smoke Test Program)
[bulk-cleanup] Done: 3 deleted, 0 failed
```

## Auth failure

If neither `DIDAXIS_API_TOKEN` nor `DIDAXIS_EMAIL`/`DIDAXIS_PASSWORD` work,
tell the user which variables are missing or invalid. Do not guess credentials.
