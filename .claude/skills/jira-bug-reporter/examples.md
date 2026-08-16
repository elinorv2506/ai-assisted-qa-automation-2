# Example: DS-2 TC-002 failure → Jira sub-task

Hypothetical failure from `tests/ds2-edit-program.spec.ts` while verifying program name updates appear in the list immediately.

## 1. Playwright failure output

```
  1) [chromium] › tests/ds2-edit-program.spec.ts:145:3 › Positive Flows › TC-002 — Program name update is saved and reflected in the list immediately

    Error: expect(locator).toHaveText(expected)

    Locator: getByRole('row').filter({ hasText: 'Web Development 2026 1710000000000' }).getByRole('cell').first()
    Expected string: "Web Development 2027 1710000000000"
    Received string: "Web Development 2026 1710000000000"

      158 |     await saveButton(page).click();
      159 |     await expect(editProgramModal(page)).toBeHidden();
    > 160 |     await expect(programRow(page, updatedName).getByRole('cell').first()).toHaveText(updatedName);
          |                                                                           ^
      161 |   });

    attachment #1: screenshot (image/png) ─────────────────────────────────────
    test-results/ds2-edit-program-Positive--a1b2c3/test-failed-1.png
```

## 2. Root cause check

- Test logic is correct: it saves a renamed program and asserts the list row updates.
- Failure indicates the UI list still shows the old name after a successful save — likely an app bug (stale list state), not a test bug.
- Parent story: `features/DS-2.feature` → **DS-2**.

## 3. Reproduce

```bash
npx playwright test tests/ds2-edit-program.spec.ts -g "TC-002" --workers=1
npx playwright test tests/ds2-edit-program.spec.ts -g "TC-002" --workers=1
node scripts/collect-failure-screenshots.mjs --latest
```

Expected output path:

```
test-results/ds2-edit-program-Positive--a1b2c3/test-failed-1.png
```

## 4. Duplicate check

```jql
parent = DS-2 AND issuetype = Sub-task AND text ~ "stale data" AND status != Done
```

No matches → create a new sub-task.

## 5. Draft bug report (Jira description body)

```markdown
**Severity:** High
**Priority:** High

**Playwright Error:**
```
Error: expect(locator).toHaveText(expected)
Expected string: "Web Development 2027 1710000000000"
Received string: "Web Development 2026 1710000000000"
```

**Steps to Reproduce:**
1. Log in as admin at https://test.didaxis.studio/login
2. Navigate to Programs page
3. Create a program named "Web Development 2026 1710000000000"
4. Open Edit for that program
5. Change Program Name to "Web Development 2027 1710000000000"
6. Click Save
7. Observe the program list row

**Expected Result:** The list row shows the updated name immediately after save (per DS-2 AC / TC-002).

**Actual Result:** The list row still displays the original program name after the edit modal closes.

**Environment:**
- URL: https://test.didaxis.studio
- Browser: Chromium (Playwright)
- Account: admin@didaxis.studio (from DIDAXIS_EMAIL)

**Evidence:**
- Screenshot: test-results/ds2-edit-program-Positive--a1b2c3/test-failed-1.png (attached)
- Test: tests/ds2-edit-program.spec.ts — TC-002

**Linked Story:** DS-2
```

## 6. Create Jira sub-task (MCP)

```json
{
  "projectKey": "DS",
  "issueTypeName": "Sub-task",
  "parent": "DS-2",
  "summary": "[Composer] Program list shows stale data after editing program name",
  "description": "<markdown body from step 5>",
  "additional_fields": {
    "priority": { "name": "High" }
  }
}
```

Confirm with `getJiraIssue` → e.g. **DS-173**.

## 7. Attach screenshots (required)

```bash
node scripts/jira-attach-screenshots.mjs DS-173 $(node scripts/collect-failure-screenshots.mjs --latest)
```

Verify exit code 0. Workflow is complete only after upload succeeds.

## 8. Return to user

```
Created DS-173: [Composer] Program list shows stale data after editing program name
https://legionqaschool.atlassian.net/browse/DS-173
Screenshot attached: test-failed-1.png
Parent story: DS-2
```

## Duplicate-found variant

If JQL returns an open sub-task **DS-160** with the same defect:

1. Do **not** create a new ticket.
2. Re-run the test to capture fresh screenshots.
3. Attach to the existing issue:

```bash
node scripts/jira-attach-screenshots.mjs DS-160 $(node scripts/collect-failure-screenshots.mjs --latest)
```

4. Add a comment on DS-160 noting the reproduction date and Playwright error.
