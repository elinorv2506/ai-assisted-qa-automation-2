# DS-4 — Test Plan: Delete Program with Confirmation

**Feature:** Delete program with confirmation  
**Scope:** Programs page — delete action per program row and confirmation dialog  
**Field names:** Program Name, Description  
**Primary actions:** Delete icon (per program row), confirmation dialog `Delete` and `Cancel`  
**Sample programs:** `Test Program`, `Web Development 2026`, `Informatique & IA - Niveau 2`

---

## Positive Flows

### TC-001 — Confirmation dialog appears when delete icon is clicked

**Title:** Delete action opens a confirmation dialog before any program is removed

**Preconditions:**
- User is logged in as admin
- User is on the Programs page
- Program `Test Program` exists with Description `Sample program for deletion testing`

**Steps:**
1. Locate `Test Program` in the program list
2. Click the delete icon on the `Test Program` row
3. Observe the UI

**Gherkin:**
```gherkin
Scenario: Delete program with confirmation — dialog appears
  Given I am logged in as admin
  And I am on the Programs page
  And a program "Test Program" exists
  When I click the delete icon for "Test Program"
  Then I see a confirmation dialog
  And "Test Program" is still visible in the program list
```

**Expected result:**
- Confirmation dialog is displayed (modal overlay)
- `Test Program` remains in the list; no row is removed yet
- Programs page behind the dialog is not interactable for list actions (modal behavior)
- Dialog presents a destructive confirm action (`Delete`) and a `Cancel` action

**Priority:** High

---

### TC-002 — Program is removed from the list after confirming deletion

**Title:** Confirmed deletion removes the target program from the Programs list immediately

**Preconditions:**
- User is logged in as admin
- User is on the Programs page
- Program `Test Program` exists with Description `Sample program for deletion testing`
- Confirmation dialog is open for `Test Program` (delete icon was clicked)

**Steps:**
1. Review the confirmation dialog content
2. Click `Delete` in the confirmation dialog
3. Observe the dialog and Programs list
4. Search or scan the list for `Test Program`

**Gherkin:**
```gherkin
Scenario: Delete program with confirmation — successful deletion
  Given I am logged in as admin
  And I am on the Programs page
  And a program "Test Program" exists
  When I click the delete icon for "Test Program"
  And I see a confirmation dialog
  And I confirm deletion
  Then "Test Program" is removed from the program list
```

**Expected result:**
- Confirmation dialog closes
- `Test Program` no longer appears anywhere in the program list
- No error message is shown
- List count decreases by one
- Other programs (if any) remain unchanged

**Priority:** High

---

### TC-003 — Program remains in the list when deletion is canceled

**Title:** Canceling the confirmation dialog preserves the program without side effects

**Preconditions:**
- User is logged in as admin
- User is on the Programs page
- Program `Web Development 2026` exists with Description `Full-stack web development program`
- Confirmation dialog is open for `Web Development 2026`

**Steps:**
1. Click `Cancel` in the confirmation dialog
2. Observe the dialog and Programs list
3. Verify `Web Development 2026` row data (Program Name and Description)

**Gherkin:**
```gherkin
Scenario: Cancel program deletion
  Given I am logged in as admin
  And I am on the Programs page
  And I click the delete icon for a program
  And I see the confirmation dialog
  When I click Cancel
  Then the program still exists in the list
```

**Expected result:**
- Confirmation dialog closes
- `Web Development 2026` remains in the list with Program Name `Web Development 2026` and Description `Full-stack web development program`
- Edit and delete icons remain available on that row
- No success or error toast related to deletion is shown

**Priority:** High

---

### TC-004 — Confirmation dialog references the program being deleted

**Title:** Confirmation message identifies the correct Program Name to prevent accidental deletion

**Preconditions:**
- User is logged in as admin
- User is on the Programs page
- Program `Informatique & IA - Niveau 2` exists with Description `Programme avancé en informatique et intelligence artificielle`

**Steps:**
1. Click the delete icon on `Informatique & IA - Niveau 2`
2. Read the confirmation dialog title and body text

**Gherkin:**
```gherkin
Scenario: Confirmation dialog shows target program name
  Given I am logged in as admin
  And I am on the Programs page
  And a program "Informatique & IA - Niveau 2" exists
  When I click the delete icon for "Informatique & IA - Niveau 2"
  Then I see a confirmation dialog
  And the dialog text references "Informatique & IA - Niveau 2"
```

**Expected result:**
- Dialog clearly references `Informatique & IA - Niveau 2` (title or body)
- Special characters (`&`, `-`, accented letters) display correctly in the dialog
- Dialog does not reference a different program name

**Priority:** High

---

### TC-005 — Deleting one program does not remove other programs

**Title:** Only the confirmed target program is removed; sibling programs remain intact

**Preconditions:**
- User is logged in as admin
- User is on the Programs page
- Programs exist:
  - `Test Program` — Description `Sample program for deletion testing`
  - `Web Development 2026` — Description `Full-stack web development program`
  - `Cloud Engineering 2026` — Description `AWS and Azure fundamentals`

**Steps:**
1. Click the delete icon on `Test Program`
2. Click `Delete` in the confirmation dialog
3. Verify the Programs list contents

**Gherkin:**
```gherkin
Scenario: Delete affects only the selected program
  Given I am logged in as admin
  And I am on the Programs page
  And programs "Test Program", "Web Development 2026", and "Cloud Engineering 2026" exist
  When I click the delete icon for "Test Program"
  And I confirm deletion
  Then "Test Program" is removed from the program list
  And "Web Development 2026" remains in the program list
  And "Cloud Engineering 2026" remains in the program list
```

**Expected result:**
- Only `Test Program` is removed
- `Web Development 2026` and `Cloud Engineering 2026` remain with original names and descriptions
- Row order for remaining programs is stable (no unintended reordering beyond removal)

**Priority:** High

---

### TC-006 — Deleted program does not reappear after page refresh

**Title:** Program deletion persists after reload of the Programs page

**Preconditions:**
- User is logged in as admin
- Program `Test Program` exists
- User has successfully deleted `Test Program` (confirmation dialog → `Delete`)

**Steps:**
1. Confirm `Test Program` is absent from the list
2. Refresh the browser page (or navigate away and return to Programs)
3. Review the Programs list again

**Gherkin:**
```gherkin
Scenario: Deleted program stays removed after refresh
  Given I am logged in as admin
  And I have deleted the program "Test Program"
  When I refresh the Programs page
  Then "Test Program" is not in the program list
```

**Expected result:**
- After refresh, `Test Program` is still absent
- No ghost row, stale cache entry, or error state on load
- Remaining programs load normally

**Priority:** High

---

### TC-007 — Program with special characters in name can be deleted successfully

**Title:** Deletion works for Program Names containing punctuation, symbols, and accented characters

**Preconditions:**
- User is logged in as admin
- User is on the Programs page
- Program `C++ & C# Dev (2026) — "Advanced"` exists with Description `Covers C++, C#, and related tooling`

**Steps:**
1. Click the delete icon on `C++ & C# Dev (2026) — "Advanced"`
2. Confirm the dialog references the full program name
3. Click `Delete`
4. Verify the list

**Gherkin:**
```gherkin
Scenario: Delete program with special characters in name
  Given I am logged in as admin
  And I am on the Programs page
  And a program "C++ & C# Dev (2026) — \"Advanced\"" exists
  When I click the delete icon for that program
  And I confirm deletion
  Then the program is removed from the program list
```

**Expected result:**
- Confirmation and deletion succeed without encoding or parsing errors
- Program row is fully removed
- No HTML/script injection artifacts in dialog or list

**Priority:** Medium

---

### TC-008 — Same Program Name can be created again after deletion

**Title:** Deleting a program frees the name for reuse per duplicate-prevention rules (DS-3)

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` existed and was deleted via confirmed deletion
- User is on the Programs page

**Steps:**
1. Click `+ New Program`
2. Enter `Web Development 2026` in Program Name
3. Enter `Full-stack web development program` in Description
4. Click `Create`
5. Verify the list

**Gherkin:**
```gherkin
Scenario: Recreate program after deletion
  Given I am logged in as admin
  And the program "Web Development 2026" was previously deleted
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the program list shows "Web Development 2026"
```

**Expected result:**
- New program is created without duplicate-name error
- List shows exactly one `Web Development 2026`
- Delete icon is available on the new row

**Priority:** Medium

---

## Negative Flows

### TC-009 — Program is not deleted without opening and confirming the dialog

**Title:** Clicking only the delete icon does not remove the program from the list

**Preconditions:**
- User is logged in as admin
- User is on the Programs page
- Program `Cloud Engineering 2026` exists

**Steps:**
1. Click the delete icon on `Cloud Engineering 2026`
2. Do not click `Delete` or `Cancel`; observe the list behind the dialog
3. Click `Cancel`
4. Confirm program still exists

**Gherkin:**
```gherkin
Scenario: No deletion without explicit confirmation
  Given I am logged in as admin
  And I am on the Programs page
  And a program "Cloud Engineering 2026" exists
  When I click the delete icon for "Cloud Engineering 2026"
  And I do not confirm deletion
  Then "Cloud Engineering 2026" is still in the program list
```

**Expected result:**
- Program remains until explicit `Delete` confirmation
- No partial deletion state (row dimmed, “pending delete,” etc.)

**Priority:** High

---

### TC-010 — Cancel does not delete the program even when clicked multiple times

**Title:** Repeated Cancel actions leave the program unchanged and close the dialog safely

**Preconditions:**
- User is logged in as admin
- User is on the Programs page
- Program `Test Program` exists
- Confirmation dialog is open for `Test Program`

**Steps:**
1. Click `Cancel` once
2. Confirm dialog is closed and `Test Program` exists
3. Open delete confirmation again for `Test Program`
4. Click `Cancel` twice rapidly (if dialog still open)
5. Verify list state

**Gherkin:**
```gherkin
Scenario: Multiple cancel actions do not delete
  Given I am logged in as admin
  And I am on the Programs page
  And a program "Test Program" exists
  When I click the delete icon for "Test Program"
  And I click Cancel
  And I click the delete icon for "Test Program" again
  And I click Cancel
  Then "Test Program" still exists in the list
```

**Expected result:**
- `Test Program` is never removed
- No duplicate dialogs stacked
- No console errors from repeated cancel handling

**Priority:** Medium

---

### TC-011 — Edit action does not delete or open delete confirmation

**Title:** Edit icon opens edit form only; no program is removed and no delete dialog appears

**Preconditions:**
- User is logged in as admin
- User is on the Programs page
- Program `Web Development 2026` exists

**Steps:**
1. Click the edit icon on `Web Development 2026` (not the delete icon)
2. Observe modals and list
3. Close edit form without saving (if applicable)
4. Verify `Web Development 2026` is still in the list

**Gherkin:**
```gherkin
Scenario: Edit does not trigger delete
  Given I am logged in as admin
  And I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form for "Web Development 2026"
  And I do not see a delete confirmation dialog
  And "Web Development 2026" remains in the program list
```

**Expected result:**
- Edit modal opens with pre-filled Program Name and Description
- No delete confirmation dialog
- Program row remains in the list

**Priority:** High

---

### TC-012 — Confirming delete on wrong program is not possible when dialog shows correct name

**Title:** User cannot accidentally delete a different program than the one whose delete icon was clicked

**Preconditions:**
- User is logged in as admin
- User is on the Programs page
- Programs `Test Program` and `Web Development 2026` both exist

**Steps:**
1. Click the delete icon on `Test Program`
2. Verify dialog references `Test Program` only
3. Click `Delete`
4. Verify only `Test Program` was removed and `Web Development 2026` remains

**Gherkin:**
```gherkin
Scenario: Delete confirmation targets the clicked row only
  Given I am logged in as admin
  And programs "Test Program" and "Web Development 2026" exist
  When I click the delete icon for "Test Program"
  And I confirm deletion
  Then "Test Program" is removed from the program list
  And "Web Development 2026" is not removed from the program list
```

**Expected result:**
- `Web Development 2026` is untouched
- No cross-row ID mix-up in delete API call

**Priority:** High

---

### TC-013 — Failed delete does not remove program from the list

**Title:** When server rejects deletion, the program remains visible and user sees an error

**Preconditions:**
- User is logged in as admin
- User is on the Programs page
- Program `Test Program` exists
- Backend delete endpoint is unavailable or returns an error (simulated 500/403)

**Steps:**
1. Click the delete icon on `Test Program`
2. Click `Delete` in the confirmation dialog
3. Observe UI response and list

**Gherkin:**
```gherkin
Scenario: Failed delete preserves program in list
  Given I am logged in as admin
  And a program "Test Program" exists
  And the delete API will fail
  When I click the delete icon for "Test Program"
  And I confirm deletion
  Then I see an error indicating deletion failed
  And "Test Program" remains in the program list
```

**Expected result:**
- Error feedback is shown (toast or inline in dialog)
- `Test Program` remains in the list with original data
- User can retry delete or cancel

**Priority:** High

---

### TC-014 — Non-admin user cannot delete programs (if role restrictions apply)

**Title:** Users without admin role cannot delete programs from the Programs page

**Preconditions:**
- User is logged in as a non-admin role (e.g. viewer/instructor)
- Program `Test Program` exists
- User can or cannot access Programs page per product rules

**Steps:**
1. Navigate to the Programs page (if accessible)
2. Locate `Test Program`
3. Check for delete icon visibility and interactivity
4. If delete is visible, attempt delete and confirm

**Gherkin:**
```gherkin
Scenario: Non-admin cannot delete programs
  Given I am logged in as a non-admin user
  And a program "Test Program" exists
  When I view the Programs page
  Then I do not see a delete icon for "Test Program"
  Or the delete action is disabled and deletion cannot be completed
```

**Expected result:**
- Non-admin cannot successfully delete `Test Program`
- No confirmation dialog leading to removal (preferred: no delete icon)
- If API is called directly, server returns forbidden

**Priority:** Medium

---

## Edge Cases

### TC-015 — Last remaining program in the list can be deleted

**Title:** Deleting the only program leaves an empty list state without UI breakage

**Preconditions:**
- User is logged in as admin
- User is on the Programs page
- Only one program exists: `Test Program`

**Steps:**
1. Click the delete icon on `Test Program`
2. Click `Delete`
3. Observe the empty Programs list

**Gherkin:**
```gherkin
Scenario: Delete the only program in the list
  Given I am logged in as admin
  And only the program "Test Program" exists on the Programs page
  When I click the delete icon for "Test Program"
  And I confirm deletion
  Then "Test Program" is removed from the program list
  And the Programs page shows an empty state or zero programs
```

**Expected result:**
- List is empty (or shows documented empty state message)
- `+ New Program` remains available
- No JavaScript errors or broken layout

**Priority:** Medium

---

### TC-016 — Program with maximum-length Program Name can be deleted

**Title:** Deletion succeeds for a program whose Program Name is at the documented max length

**Preconditions:**
- User is logged in as admin
- Program exists with Program Name of 255 characters: `A` repeated 255 times (adjust if product defines a different max)
- Description: `Max length name delete test`

**Steps:**
1. Click the delete icon on the 255-character program row
2. Verify dialog handles long name (truncation or scroll if needed)
3. Click `Delete`
4. Verify removal

**Gherkin:**
```gherkin
Scenario: Delete program with max-length name
  Given I am logged in as admin
  And a program with a 255-character Program Name exists
  When I click the delete icon for that program
  And I confirm deletion
  Then that program is removed from the program list
```

**Expected result:**
- Deletion completes successfully
- Long name does not break dialog layout or API payload
- Program no longer appears in list

**Priority:** Low

---

### TC-017 — Program with single-character Program Name can be deleted

**Title:** Minimum non-empty Program Name boundary does not block deletion

**Preconditions:**
- User is logged in as admin
- Program `X` exists with Description `Single character name`

**Steps:**
1. Click the delete icon on `X`
2. Click `Delete`
3. Verify list

**Gherkin:**
```gherkin
Scenario: Delete program with single-character name
  Given I am logged in as admin
  And a program "X" exists
  When I click the delete icon for "X"
  And I confirm deletion
  Then "X" is removed from the program list
```

**Expected result:**
- Short name is handled correctly in dialog and API
- Program is removed

**Priority:** Low

---

### TC-018 — Program with Unicode and emoji in Program Name can be deleted

**Title:** International and emoji characters in Program Name do not block deletion flow

**Preconditions:**
- User is logged in as admin
- Program `日本語プログラム 🎓` exists with Description `Unicode and emoji test`

**Steps:**
1. Click the delete icon on `日本語プログラム 🎓`
2. Confirm dialog displays name correctly
3. Click `Delete`

**Gherkin:**
```gherkin
Scenario: Delete program with Unicode and emoji name
  Given I am logged in as admin
  And a program "日本語プログラム 🎓" exists
  When I click the delete icon for "日本語プログラム 🎓"
  And I confirm deletion
  Then "日本語プログラム 🎓" is removed from the program list
```

**Expected result:**
- Dialog and list handle Unicode/emoji without corruption
- Program is fully removed

**Priority:** Low

---

### TC-019 — Double-click on Delete button does not cause duplicate errors

**Title:** Rapid double confirmation submits one delete operation without orphan UI state

**Preconditions:**
- User is logged in as admin
- Program `Test Program` exists
- Confirmation dialog is open for `Test Program`

**Steps:**
1. Double-click `Delete` rapidly
2. Observe network requests (one delete expected)
3. Verify list and any error messages

**Gherkin:**
```gherkin
Scenario: Double-click confirm does not break delete flow
  Given I am logged in as admin
  And a program "Test Program" exists
  And the delete confirmation dialog is open for "Test Program"
  When I double-click Delete
  Then "Test Program" is removed from the program list
  And no duplicate-delete error is shown to the user
```

**Expected result:**
- Single successful deletion
- No second 404/error toast from idempotent handling
- Dialog closes cleanly

**Priority:** Medium

---

### TC-020 — Double-click on delete icon opens one confirmation dialog

**Title:** Rapid delete icon clicks do not open multiple stacked confirmation dialogs

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` exists

**Steps:**
1. Double-click the delete icon on `Web Development 2026` rapidly
2. Count visible confirmation dialogs
3. Click `Cancel`

**Gherkin:**
```gherkin
Scenario: Double-click delete icon opens single dialog
  Given I am logged in as admin
  And a program "Web Development 2026" exists
  When I double-click the delete icon for "Web Development 2026"
  Then I see exactly one confirmation dialog
  And "Web Development 2026" remains in the program list
```

**Expected result:**
- Only one modal instance
- Program not deleted without confirmation
- No UI freeze or duplicate overlays

**Priority:** Medium

---

### TC-021 — Delete confirmation while edit modal is open is handled safely

**Title:** Concurrent modals do not cause accidental deletion or corrupted state

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` exists
- Edit modal is open for `Web Development 2026`

**Steps:**
1. With edit modal open, attempt to click delete icon on the same or another row (if accessible)
2. Observe which modal(s) are shown
3. Close dialogs without deleting
4. Verify program list integrity

**Gherkin:**
```gherkin
Scenario: Delete while edit modal is open
  Given I am logged in as admin
  And I am editing "Web Development 2026"
  When I attempt to delete a program
  Then either the edit modal blocks delete until closed
  Or delete confirmation replaces edit modal without deleting unintentionally
  And "Web Development 2026" remains in the list unless explicitly confirmed deleted
```

**Expected result:**
- No silent deletion
- Clear modal precedence (one active destructive flow at a time)
- Data integrity preserved

**Priority:** Low

---

### TC-022 — Program with very long Description can still be deleted

**Title:** Long Description value does not affect delete confirmation or API success

**Preconditions:**
- User is logged in as admin
- Program `Long Description Program` exists with Description of 2000+ characters

**Steps:**
1. Click delete icon on `Long Description Program`
2. Click `Delete`
3. Verify removal

**Gherkin:**
```gherkin
Scenario: Delete program with long description
  Given I am logged in as admin
  And a program "Long Description Program" with a very long Description exists
  When I click the delete icon for "Long Description Program"
  And I confirm deletion
  Then "Long Description Program" is removed from the program list
```

**Expected result:**
- Description length does not block deletion
- Program row removed completely

**Priority:** Low

---

### TC-023 — Dismiss via Escape or overlay click does not delete (if supported)

**Title:** Non-destructive dismiss paths preserve the program same as Cancel

**Preconditions:**
- User is logged in as admin
- Program `Test Program` exists
- Confirmation dialog is open

**Steps:**
1. Press `Escape` (or click outside modal if overlay dismiss is enabled)
2. Verify dialog closes
3. Confirm `Test Program` remains in list
4. Repeat with `Cancel` for comparison

**Gherkin:**
```gherkin
Scenario: Dismiss dialog without confirming does not delete
  Given I am logged in as admin
  And a program "Test Program" exists
  And the delete confirmation dialog is open
  When I dismiss the dialog without clicking Delete
  Then "Test Program" remains in the program list
```

**Expected result:**
- Program is not deleted on dismiss
- Behavior matches `Cancel` (if dismiss is supported)
- If dismiss is not supported, dialog remains until `Cancel` or `Delete`

**Priority:** Low

---

## AC Coverage Matrix

| Acceptance Criteria | Test Case(s) |
|---------------------|--------------|
| Delete program with confirmation — dialog appears | TC-001, TC-004 |
| Delete program with confirmation — program removed after confirm | TC-002, TC-005, TC-006, TC-007 |
| Cancel program deletion — program remains | TC-003, TC-009, TC-010, TC-023 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Confirmation dialog copy** — ACs require “a confirmation dialog” but do not specify title, body text, or whether the Program Name must appear. TC-004 assumes name is shown for safety; confirm exact copy.
2. **Confirm button label** — AC says “I confirm deletion” without specifying button text (`Delete`, `Confirm`, `Yes`). TCs assume `Delete` + `Cancel`.
3. **Cancel AC precondition** — “Given I click the delete icon” omits login, page context, and which program. TC-003 uses `Web Development 2026` as a concrete example.
4. **Success feedback** — No AC for toast, snackbar, or silent removal after successful delete. Clarify expected user feedback.
5. **Persistence** — AC verifies immediate list update only; no requirement to confirm deletion survives refresh (TC-006 recommended but not in AC).
6. **Empty list state** — No AC for UX when the last program is deleted (TC-015).
7. **Role-based access** — ACs assume delete is available; admin-only restriction is implied by DS-1/DS-2/DS-3 but not stated (TC-014).
8. **Error handling** — No AC for API failure, network timeout, or concurrent modification during delete (TC-013).
9. **Dismiss behavior** — Cancel is specified; Escape key, overlay click, and close (X) behavior are undefined (TC-023).
10. **Associated data** — Unclear whether deleting a program cascades to courses, enrollments, or other linked entities; ACs only mention program list removal.
11. **Soft delete vs hard delete** — ACs do not state whether the program is permanently removed or recoverable from an archive/admin view.
12. **Delete during edit** — No AC for opening delete confirmation while create/edit modals are open (TC-021).
13. **Loading and double-submit** — No AC for disabled buttons or loading state while delete request is in flight (TC-019, TC-020).
14. **List sort order** — No requirement for how remaining programs reorder after deletion.
15. **Uniqueness after delete** — ACs do not mention whether a deleted name can be reused; TC-008 aligns with DS-3 duplicate rules but needs product confirmation.
16. **Accessibility** — No AC for keyboard navigation, focus trap in dialog, or screen reader announcements for destructive action.
17. **Audit / activity log** — No requirement to record who deleted which program and when.
