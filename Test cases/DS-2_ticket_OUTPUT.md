# DS-2 — Test Plan: Edit Existing Program Details

**Jira:** [DS-2 — Edit existing program details](https://legionqaschool.atlassian.net/browse/DS-2)  
**Feature:** Edit existing academic program  
**Scope:** Edit program modal/form from the Programs page (`/programs`)  
**Field names:** Program Name (required), Description (optional), plus AI Generation Config fields  
**Primary actions:** Edit icon (per program row — accessible name `Edit {ProgramName}`), `Save`, `Cancel`  
**Sample program:** `Web Development 2026` — Description: `Full-stack web development program`

## Jira Acceptance Criteria

```gherkin
Scenario: Open program for editing
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with the program's current data

Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"

Scenario: Edit preserves unchanged fields
  Given I am editing a program
  When I only change the Description
  And I click Save
  Then the Name and other fields remain unchanged
```

## Confluence Context (Atlassian MCP)

**Architecture Overview** — Didaxis Studio uses a three-layer model (Session Templates → Scheduled Sessions → Assignments). Programs are the top-level container for semesters, courses, and session templates. Calendar is the live data source; validation runs after every mutation (debounced 500ms).

**Program Setup — Overview** — Edit flow: Programs page → click ✏️ icon on program row → **Edit Program** modal → modify fields → **Save**. Modal closes; list immediately reflects updated data. Target users: **Admin** (full CRUD), **Editor** (create/edit), **Viewer** (read-only).

## App Observations (Playwright MCP — test.didaxis.studio)

| Area | Observed behavior | Test expectation | Notes |
|------|-------------------|------------------|-------|
| Edit modal title | Dialog named `Edit Program` | Pre-populated edit form opens | Confirmed |
| Edit button | `getByRole('button', { name: 'Edit {ProgramName}' })` | Click edit icon on row | Not a generic icon-only button |
| Save / Cancel | `Save` and `Cancel` buttons in modal footer; X in banner | Per Jira AC | Confirmed |
| Empty name | `Save` disabled when Program Name cleared | Validation blocks save | Confirmed |
| Whitespace-only name | `Save` disabled for `"   "` | Same as create (DS-1) | Confirmed |
| Empty description | `Save` enabled when Description cleared | Description optional | Confirmed |
| AI Generation Config | Collapsible section with Total Program Hours, Default Session/Exam Hours, Target Audience, Focus Areas, Sync/Async slider | Present but not in Jira AC | TC-025 |
| Max name length (256+) | `Save` remains enabled at 256 chars | Disabled or validation error (255 max, per DS-1) | [DS-142](https://legionqaschool.atlassian.net/browse/DS-142) |
| Max description (2001+) | `Save` remains enabled at 2001 chars | Disabled or validation error (2000 max) | [DS-144](https://legionqaschool.atlassian.net/browse/DS-144) |
| Duplicate names on edit | Renaming blocked in latest run (TC-011 passes) | Reject duplicate with error | — (passes) |
| Whitespace trim on edit | Padded name saved as-is | Trimmed on save (DS-1 parity) | [DS-143](https://legionqaschool.atlassian.net/browse/DS-143) |
| List layout | Table with `Program` column; name + description as two `<p>` elements per row | Immediate list update after save | Confirmed |
| Semester panel | Right panel: "Select a program to manage semesters"; row click selects program | Edit button should not trigger row navigation | TC-026 |

---

## Positive Flows

### TC-001 — Edit form opens with current program data pre-filled

**Title:** Edit modal displays existing Program Name and Description when opened from the program list

**Preconditions:**
- User is logged in as admin
- User is on the Programs page
- Program `Web Development 2026` exists with Description `Full-stack web development program`

**Steps:**
1. Locate `Web Development 2026` in the program list
2. Click the edit icon on `Web Development 2026`
3. Observe the edit form/modal fields

**Gherkin:**
```gherkin
Scenario: Open program for editing
  Given I am logged in as admin
  And I am on the Programs page
  And a program "Web Development 2026" exists with Description "Full-stack web development program"
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with Program Name "Web Development 2026"
  And I see the edit form pre-populated with Description "Full-stack web development program"
```

**Expected result:**
- **Edit Program** modal opens (`role="dialog"`, name `Edit Program`)
- `Program Name` field contains `Web Development 2026`
- `Description` field contains `Full-stack web development program`
- `Save` button is visible and enabled (name is non-empty)
- `Cancel` button and banner X close button are visible

**Priority:** High

---

### TC-002 — Program name update is saved and reflected in the list immediately

**Title:** Renamed program appears in the list and modal closes after Save

**Preconditions:**
- User is logged in as admin
- User is editing `Web Development 2026` (edit form is open and pre-populated)

**Steps:**
1. Change Program Name to `Web Development 2026 - Updated`
2. Leave Description unchanged
3. Click `Save`
4. Observe the modal and Programs list

**Gherkin:**
```gherkin
Scenario: Successfully edit a program name
  Given I am logged in as admin
  And I am editing "Web Development 2026"
  When I change the Program Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"
  And the program list does not show "Web Development 2026"
```

**Expected result:**
- Modal closes without error
- List row shows `Web Development 2026 - Updated`
- Old name `Web Development 2026` is no longer displayed
- Change persists after page refresh (recommended follow-up check)

**Priority:** High

---

### TC-003 — Unchanged fields remain intact when only Description is edited

**Title:** Program Name and other attributes are preserved when only Description is modified

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` exists with Description `Full-stack web development program`
- User is editing that program

**Steps:**
1. Confirm Program Name still shows `Web Development 2026`
2. Change Description to `Full-stack web development program — updated curriculum`
3. Click `Save`
4. Re-open edit form for `Web Development 2026` (or inspect list/detail view)

**Gherkin:**
```gherkin
Scenario: Edit preserves unchanged fields
  Given I am logged in as admin
  And I am editing a program with Program Name "Web Development 2026"
  And the program Description is "Full-stack web development program"
  When I change the Description to "Full-stack web development program — updated curriculum"
  And I leave the Program Name unchanged
  And I click Save
  Then the program list shows "Web Development 2026"
  And the program Description is "Full-stack web development program — updated curriculum"
  And the Program Name is still "Web Development 2026"
```

**Expected result:**
- Program Name remains `Web Development 2026`
- Description updates to the new value
- No unintended changes to program ID, created date, or other list metadata
- Other programs in the list are unaffected

**Priority:** High

---

### TC-004 — Both Program Name and Description can be updated in one save

**Title:** Simultaneous edits to both fields persist correctly

**Preconditions:**
- User is logged in as admin
- Program `Mobile App Development 2025` exists with Description `iOS and Android development track`
- User opens edit form for that program

**Steps:**
1. Change Program Name to `Mobile App Development 2025 - Revised`
2. Change Description to `Cross-platform mobile development with React Native`
3. Click `Save`
4. Re-open the edit form for the updated program

**Gherkin:**
```gherkin
Scenario: Edit both program name and description
  Given I am logged in as admin
  And I am editing "Mobile App Development 2025"
  When I change the Program Name to "Mobile App Development 2025 - Revised"
  And I change the Description to "Cross-platform mobile development with React Native"
  And I click Save
  Then the modal closes
  And the program list shows "Mobile App Development 2025 - Revised"
  And the program Description is "Cross-platform mobile development with React Native"
```

**Expected result:**
- Both fields save together
- List reflects new name
- Re-opened form shows both updated values

**Priority:** Medium

---

### TC-005 — Save with no field changes closes modal without side effects

**Title:** Opening edit form and saving without modifications does not corrupt program data

**Preconditions:**
- User is logged in as admin
- Program `Data Science Fundamentals` exists with Description `Introductory statistics and Python`
- User opens edit form for that program

**Steps:**
1. Do not modify any field
2. Click `Save`
3. Observe modal and program list
4. Re-open edit form

**Gherkin:**
```gherkin
Scenario: Save without changes keeps program data intact
  Given I am logged in as admin
  And I am editing "Data Science Fundamentals"
  And the program Description is "Introductory statistics and Python"
  When I click Save without changing any fields
  Then the modal closes
  And the program list shows "Data Science Fundamentals"
  And the program Description remains "Introductory statistics and Python"
```

**Expected result:**
- Modal closes
- Program data unchanged
- No duplicate row created
- No error toast shown (unless product requires "no changes" warning)

**Priority:** Medium

---

### TC-006 — Editing one program does not alter other programs

**Title:** List entries for other programs remain unchanged after a single-program edit

**Preconditions:**
- User is logged in as admin
- Programs page shows `Web Development 2026` and `Cloud Engineering 2026`
- User edits `Web Development 2026` only

**Steps:**
1. Change `Web Development 2026` Description to `Modern full-stack curriculum`
2. Click `Save`
3. Review both program rows in the list

**Gherkin:**
```gherkin
Scenario: Edit affects only the selected program
  Given I am logged in as admin
  And the Programs page shows "Web Development 2026" and "Cloud Engineering 2026"
  And I am editing "Web Development 2026"
  When I change the Description to "Modern full-stack curriculum"
  And I click Save
  Then the program list shows "Cloud Engineering 2026" unchanged
  And only "Web Development 2026" has the updated Description
```

**Expected result:**
- `Cloud Engineering 2026` name and description unchanged
- Only the edited program reflects new data

**Priority:** Medium

---

## Negative Flows

### TC-007 — Empty Program Name prevents save

**Title:** Save remains disabled or blocked when Program Name is cleared

**Preconditions:**
- User is logged in as admin
- User is editing `Web Development 2026`

**Steps:**
1. Clear the Program Name field entirely
2. Leave Description as-is or enter any value
3. Observe `Save` button state
4. Attempt to submit (click or keyboard)

**Gherkin:**
```gherkin
Scenario: Validation prevents empty program name on edit
  Given I am editing "Web Development 2026"
  When I clear the Program Name field
  Then the Save button is disabled
  And the program is not updated
  And the modal remains open
```

**Expected result:**
- `Save` is disabled (or validation error shown on submit attempt)
- Original program `Web Development 2026` remains in the list unchanged
- Modal stays open until user fixes input or cancels

**Priority:** High

---

### TC-008 — Whitespace-only Program Name does not save

**Title:** Program Name containing only spaces is treated as invalid on edit

**Preconditions:**
- User is logged in as admin
- User is editing `Cybersecurity 2026`

**Steps:**
1. Replace Program Name with `   ` (spaces only)
2. Click `Save` or observe button state

**Gherkin:**
```gherkin
Scenario: Whitespace-only program name is rejected on edit
  Given I am editing "Cybersecurity 2026"
  When I change the Program Name to "   "
  Then the Save button is disabled
  And the program list still shows "Cybersecurity 2026"
```

**Expected result:**
- Save blocked same as create flow (FR-06 parity from DS-1)
- Original name preserved in list

**Priority:** High

---

### TC-009 — Canceling edit discards unsaved changes

**Title:** Closing the edit modal without Save reverts to original program data

**Preconditions:**
- User is logged in as admin
- Program `UX Design 2026` exists with Description `Human-centered design principles`
- User opens edit form for that program

**Steps:**
1. Change Program Name to `UX Design 2026 - Draft`
2. Change Description to `Should not be saved`
3. Close modal via Cancel, X, or Esc (whichever UI supports)
4. Check program list and re-open edit form

**Gherkin:**
```gherkin
Scenario: Cancel edit does not persist changes
  Given I am editing "UX Design 2026"
  When I change the Program Name to "UX Design 2026 - Draft"
  And I change the Description to "Should not be saved"
  And I close the modal without clicking Save
  Then the modal closes
  And the program list shows "UX Design 2026"
  And the program Description is "Human-centered design principles"
```

**Expected result:**
- No changes persisted
- Re-opened form shows original values
- List unchanged

**Priority:** High

---

### TC-010 — Viewer role cannot edit programs

**Title:** Read-only users do not see or cannot use the edit icon

**Preconditions:**
- User is logged in as **Viewer** (per Confluence Program Setup — Overview)
- Program `Web Development 2026` exists on Programs page

**Steps:**
1. Navigate to Programs page
2. Look for edit button (`Edit Web Development 2026`) on the program row
3. If hidden, attempt direct API/URL edit access

**Gherkin:**
```gherkin
Scenario: Viewer cannot edit programs
  Given I am logged in as viewer
  And I am on the Programs page
  And a program "Web Development 2026" exists
  Then I do not see an edit button on "Web Development 2026"
  And I cannot access the Edit Program modal
```

**Expected result:**
- Edit button hidden or disabled for Viewer role
- Editor and Admin roles **can** edit (per Confluence)
- Direct edit access rejected for unauthorized roles (403/redirect)
- Program data unchanged

**Priority:** High

---

### TC-011 — Renaming to an existing program name is handled per business rules

**Title:** Duplicate Program Name on edit follows same policy as create (DS-1)

**Preconditions:**
- User is logged in as admin
- Programs `Alpha Program {unique}` and `Beta Program {unique}` both exist
- User edits `Beta Program {unique}`

**Steps:**
1. Change Program Name to match `Alpha Program {unique}` exactly
2. Click `Save`
3. Observe error handling and both program rows

**Gherkin:**
```gherkin
Scenario: Duplicate program name on edit is handled
  Given I am editing "Beta Program"
  And a program "Alpha Program" already exists
  When I change the Program Name to "Alpha Program"
  And I click Save
  Then duplicate names are rejected with a clear validation error
  And "Beta Program" is not renamed
```

**Expected result (requirement):**
- Validation error displayed; duplicate names must not be silently accepted
- No data loss on either program
- Modal remains open for correction

**Observed (MCP):** Create flow allows duplicate names (DS-1 bug DS-137); edit likely shares the same backend. Automated tests assert the requirement, not the current bug.

**Priority:** High

---

### TC-012 — Failed save does not update the list optimistically

**Title:** Network or server error on Save leaves original program data visible

**Preconditions:**
- User is logged in as admin
- User is editing `Web Development 2026`
- Simulate API failure (offline, 500, timeout)

**Steps:**
1. Change Program Name to `Web Development 2026 - Updated`
2. Click `Save` while API is unavailable
3. Observe UI feedback and list state

**Gherkin:**
```gherkin
Scenario: Save failure does not corrupt program list
  Given I am editing "Web Development 2026"
  And the save API is unavailable
  When I change the Program Name to "Web Development 2026 - Updated"
  And I click Save
  Then an error message is shown
  And the program list still shows "Web Development 2026"
  And the modal remains open with my entered values
```

**Expected result:**
- User-visible error message
- List shows original name (no false success)
- User can retry or cancel

**Priority:** Medium

---

### TC-013 — Rapid double-click on Save does not create duplicates or corrupt data

**Title:** Double submit on Save results in a single consistent program record

**Preconditions:**
- User is logged in as admin
- User is editing `Web Development 2026`

**Steps:**
1. Change Description to `Updated description`
2. Double-click `Save` quickly
3. Inspect list for duplicate rows or inconsistent state

**Gherkin:**
```gherkin
Scenario: Double Save does not cause duplicate updates
  Given I am editing "Web Development 2026"
  When I change the Description to "Updated description"
  And I double-click Save
  Then the modal closes once
  And exactly one program named "Web Development 2026" exists in the list
  And the Description is "Updated description"
```

**Expected result:**
- Single update applied
- No duplicate programs
- Save button disabled during in-flight request (recommended)

**Priority:** Medium

---

## Edge Cases

### TC-014 — Program Name at maximum allowed length saves successfully

**Title:** Program Name at documented max length is accepted and displayed correctly

**Preconditions:**
- User is logged in as admin
- Maximum Program Name length is **255 characters** (same as DS-1 create flow)
- User is editing a seeded test program

**Steps:**
1. Replace Program Name with a 255-character string (e.g. `W` repeated 255 times)
2. Click `Save`
3. Verify list display and re-open edit form

**Gherkin:**
```gherkin
Scenario: Program name at max length is saved
  Given I am editing a test program
  And the maximum Program Name length is 255 characters
  When I change the Program Name to a 255-character valid name
  And I click Save
  Then the modal closes
  And the program list shows the full 255-character name without truncation errors
```

**Expected result:**
- Save succeeds at boundary
- Full value stored and retrievable
- UI handles display truncation gracefully if list column is narrow

**Observed (MCP):** 256-character name does not disable `Save` in the edit modal (same gap as DS-1 DS-138).

**Priority:** Medium

---

### TC-015 — Program Name exceeding max length is rejected

**Title:** Program Name one character over max length cannot be saved

**Preconditions:**
- User is logged in as admin
- Max length = **255 characters** (same as DS-1)
- User is editing a seeded test program

**Steps:**
1. Enter 256-character Program Name
2. Observe `Save` button state and attempt Save

**Gherkin:**
```gherkin
Scenario: Program name over max length is rejected
  Given I am editing a test program
  And the maximum Program Name length is 255 characters
  When I change the Program Name to a 256-character string
  Then the Save button is disabled or a max-length validation error is shown
  And the program is not updated
```

**Expected result:**
- Input blocked at field level and/or validation on submit
- Original name preserved

**Observed (MCP):** `Save` stays enabled at 256 characters.

**Bug logged:** [DS-142](https://legionqaschool.atlassian.net/browse/DS-142) — failing assertion line **383** in `tests/ds2-edit-program.spec.ts`

**Priority:** Medium

---

### TC-016 — Description at maximum allowed length saves successfully

**Title:** Description at max length boundary persists after edit

**Preconditions:**
- User is logged in as admin
- Max Description length = **2000 characters** (same as DS-1)
- User is editing a seeded test program

**Steps:**
1. Enter a 2000-character Description
2. Click `Save`
3. Re-open edit form

**Gherkin:**
```gherkin
Scenario: Description at max length is saved
  Given I am editing "Web Development 2026"
  And the maximum Description length is 2000 characters
  When I change the Description to a 2000-character string
  And I click Save
  Then the program Description is stored as the full 2000-character string
```

**Expected result:**
- Full description saved without truncation
- Re-opened form shows complete text

**Priority:** Low

---

### TC-016b — Description exceeding max length is rejected on edit

**Title:** Description one character over max length cannot be saved on edit

**Preconditions:**
- User is logged in as admin
- Max Description length = **2000 characters**
- User is editing a seeded test program

**Gherkin:**
```gherkin
Scenario: Description over max length is rejected on edit
  Given I am editing a test program
  And the maximum Description length is 2000 characters
  When I change the Description to a 2001-character string
  Then the Save button is disabled or a max-length validation error is shown
  And the program is not updated
```

**Bug logged:** [DS-144](https://legionqaschool.atlassian.net/browse/DS-144) — failing assertion line **409** in `tests/ds2-edit-program.spec.ts`

**Priority:** Medium

---

### TC-017 — Special characters in Program Name and Description are handled safely

**Title:** Names and descriptions with punctuation, symbols, and HTML-like text save and display correctly

**Preconditions:**
- User is logged in as admin
- User is editing `Web Development 2026`

**Steps:**
1. Set Program Name to `C++ & C# Development (2026)`
2. Set Description to `Covers O'Reilly-style topics: <tags>, "quotes", & ampersands`
3. Click `Save`
4. Verify list and re-opened form

**Gherkin:**
```gherkin
Scenario: Special characters in program fields are preserved
  Given I am editing "Web Development 2026"
  When I change the Program Name to "C++ & C# Development (2026)"
  And I change the Description to "Covers O'Reilly-style topics: <tags>, \"quotes\", & ampersands"
  And I click Save
  Then the program list shows "C++ & C# Development (2026)"
  And the Description is displayed as entered without HTML injection
```

**Expected result:**
- Characters stored and rendered literally (escaped, not executed)
- No XSS in list or modal
- No broken layout from `<` or `"` characters

**Priority:** Medium

---

### TC-018 — Unicode and emoji in fields are supported

**Title:** Non-ASCII characters in Program Name and Description persist correctly

**Preconditions:**
- User is logged in as admin
- User is editing `Web Development 2026`

**Steps:**
1. Set Program Name to `Développement Web 2026 🎓`
2. Set Description to `Programme bilingue — français/English`
3. Click `Save`

**Gherkin:**
```gherkin
Scenario: Unicode characters in program fields are preserved
  Given I am editing "Web Development 2026"
  When I change the Program Name to "Développement Web 2026 🎓"
  And I change the Description to "Programme bilingue — français/English"
  And I click Save
  Then the program list shows "Développement Web 2026 🎓"
  And the Description matches the entered Unicode text
```

**Expected result:**
- UTF-8 encoding preserved end-to-end
- No mojibake or replacement characters

**Priority:** Low

---

### TC-019 — Leading and trailing whitespace is trimmed or rejected consistently

**Title:** Program Name with leading/trailing spaces does not create misleading duplicates

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` exists
- User is editing that program

**Steps:**
1. Change Program Name to `  Web Development 2026  ` (spaces around)
2. Click `Save`
3. Compare stored value with existing `Web Development 2026`

**Gherkin:**
```gherkin
Scenario: Leading and trailing whitespace in program name is normalized
  Given I am editing "Web Development 2026"
  When I change the Program Name to "  Web Development 2026  "
  And I click Save
  Then the program list shows "Web Development 2026" without leading or trailing spaces
  And no duplicate program is created
```

**Expected result:**
- Trim on save (recommended, aligned with create flow) OR validation error — behavior must match create
- List shows normalized name

**Bug logged:** [DS-143](https://legionqaschool.atlassian.net/browse/DS-143) — failing assertion line **458** in `tests/ds2-edit-program.spec.ts`

**Priority:** Medium

---

### TC-020 — Description can be cleared to empty on edit

**Title:** Optional Description can be removed while Program Name remains valid

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` has Description `Full-stack web development program`
- User opens edit form

**Steps:**
1. Clear Description entirely
2. Keep Program Name as `Web Development 2026`
3. Click `Save`
4. Re-open edit form

**Gherkin:**
```gherkin
Scenario: Description can be cleared on edit
  Given I am editing "Web Development 2026"
  And the Description is "Full-stack web development program"
  When I clear the Description field
  And I click Save
  Then the modal closes
  And the program list shows "Web Development 2026"
  And the Description is empty
```

**Expected result:**
- Save succeeds (Description optional, per create flow)
- Empty description stored/displayed consistently

**Priority:** Medium

---

### TC-021 — Minimum-length Program Name (single character) saves if allowed

**Title:** Single-character Program Name at lower boundary is accepted

**Preconditions:**
- User is logged in as admin
- User is editing a test program `QA Boundary Test Program`

**Steps:**
1. Change Program Name to `X`
2. Click `Save`

**Gherkin:**
```gherkin
Scenario: Single-character program name is accepted
  Given I am editing "QA Boundary Test Program"
  When I change the Program Name to "X"
  And I click Save
  Then the modal closes
  And the program list shows "X"
```

**Expected result:**
- Save succeeds if no minimum length beyond non-empty
- List displays single character correctly

**Priority:** Low

---

### TC-022 — Edit icon is only available for existing programs, not empty list state

**Title:** Programs page with no programs does not show orphan edit actions

**Preconditions:**
- User is logged in as admin
- Programs page has zero programs (fresh tenant or filtered empty state)

**Steps:**
1. Navigate to Programs page
2. Observe list and available actions

**Gherkin:**
```gherkin
Scenario: No edit actions when program list is empty
  Given I am logged in as admin
  And I am on the Programs page
  And no programs exist
  Then I do not see any edit icons
  And I cannot open a program edit form
```

**Expected result:**
- Empty state message shown (if designed)
- No edit UI without a program row

**Priority:** Low

---

### TC-023 — HTML/script injection in Description is sanitized

**Title:** Malicious input in Description is sanitized and not executed on edit

**Preconditions:**
- User is logged in as admin
- User is editing `Secure Coding 2026`

**Steps:**
1. Keep Program Name as `Secure Coding 2026`
2. Change Description to `<script>alert('xss')</script><img src=x onerror=alert(1)>`
3. Click `Save`
4. View program in list

**Gherkin:**
```gherkin
Scenario: HTML injection in description is sanitized on edit
  Given I am editing "Secure Coding 2026"
  When I change the Description to "<script>alert('xss')</script>"
  And I click Save
  Then the modal closes
  And no script is executed on the Programs page
  And the description is displayed as plain text or safely rendered
```

**Expected result:**
- No script execution
- Content stored/displayed safely

**Priority:** High

---

### TC-024 — Concurrent edit by two admins last-write-wins or conflict is handled

**Title:** Simultaneous edits to the same program do not silently lose data without notice

**Preconditions:**
- Admin A and Admin B both open edit form for `Web Development 2026`
- Admin A saves Description change first
- Admin B saves different Description second

**Steps:**
1. Admin A: set Description to `Version A curriculum`
2. Admin A: Save
3. Admin B: set Description to `Version B curriculum` (without refreshing)
4. Admin B: Save

**Gherkin:**
```gherkin
Scenario: Concurrent edits handle conflict appropriately
  Given admin A and admin B are both editing "Web Development 2026"
  When admin A saves Description "Version A curriculum"
  And admin B saves Description "Version B curriculum"
  Then the system applies a defined conflict policy
  And the final Description matches the expected winner or shows a conflict error
```

**Expected result:**
- Defined behavior: last-write-wins, optimistic locking error, or stale-data warning
- No corrupted record or split state

**Priority:** Low

---

### TC-025 — Edit modal includes AI Generation Config section

**Title:** Edit Program modal exposes the same AI Generation Config fields as create

**Preconditions:**
- User is logged in as admin
- User opens edit form for any existing program

**Steps:**
1. Click edit on a program row
2. Observe fields below Description separator
3. Expand `▸ Show AI Generation Config` if collapsed

**Gherkin:**
```gherkin
Scenario: Edit form shows AI Generation Config
  Given I am on the Programs page
  When I open the edit form for an existing program
  Then I see the "Show AI Generation Config" section
  And I see Total Program Hours, Default Session Hours, and Default Exam Hours fields
  And I see Target Audience and Focus Areas fields
  And I see the Sync/Async Ratio slider
```

**Expected result:**
- AI config fields visible in edit modal (defaults: Session Hours `4`, Exam Hours `3`, ratio 70/30)
- Fields are editable without affecting Name/Description unless explicitly changed

**Priority:** Medium

---

### TC-026 — Clicking edit button does not trigger row selection

**Title:** Edit icon click opens modal without navigating semester panel

**Preconditions:**
- User is logged in as admin
- Programs page shows at least one program

**Steps:**
1. Note right panel shows "Select a program to manage semesters"
2. Click `Edit {ProgramName}` button (not the row body)
3. Observe modal opens and semester panel state

**Gherkin:**
```gherkin
Scenario: Edit button opens modal without row navigation side effect
  Given I am on the Programs page
  When I click the edit button on a program row
  Then the Edit Program modal opens
  And the edit action does not cause unexpected page navigation
```

**Expected result:**
- Edit modal opens
- Row click (separate action) selects program for semester management; edit button is isolated

**Priority:** Low

---

### TC-027 — Modal dismiss via X close button discards changes

**Title:** Banner X button closes edit modal without saving

**Preconditions:**
- User is logged in as admin
- User opens edit form for a program

**Steps:**
1. Modify Program Name and Description
2. Click the X button in the modal banner (not Cancel)
3. Verify list unchanged

**Gherkin:**
```gherkin
Scenario: X close button discards edit changes
  Given I am editing a program
  When I change fields and click the modal X close button
  Then the Edit Program modal closes
  And the program list shows the original program data
```

**Expected result:**
- Same behavior as Cancel (TC-009)
- No changes persisted

**Priority:** Medium

---

## AC Coverage Matrix

| Acceptance Criteria | Test Case(s) |
|---------------------|--------------|
| Open program for editing (pre-populated form) | TC-001, TC-025 |
| Successfully edit program name | TC-002 |
| Edit preserves unchanged fields | TC-003, TC-004, TC-005, TC-006 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Submit button label** — **Resolved (MCP):** Edit modal uses `Save`; create uses `Create`.
2. **Field inventory** — **Resolved (MCP):** Edit form shows Program Name, Description, and AI Generation Config (not in AC). No read-only ID/date fields visible.
3. **Program Name validation on edit** — **Resolved (MCP):** `Save` disabled when name empty or whitespace-only (TC-007, TC-008).
4. **Description required vs optional** — **Resolved (MCP):** Description optional; empty Description allows Save (TC-020).
5. **Max length** — **Partially resolved:** Same 255 / 2000 limits as DS-1; edit modal may not enforce in UI (DS-138, DS-139).
6. **Duplicate name policy** — **Observed:** App allows duplicates on create (DS-137); edit likely same. Tests assert rejection (TC-011).
7. **Whitespace trimming** — Not observed on create (DS-140); edit should match (TC-019).
8. **Cancel / dismiss behavior** — **Resolved (MCP):** Cancel and banner X both available (TC-009, TC-027).
9. **Role-based access** — **Resolved (Confluence):** Admin + Editor can edit; Viewer read-only (TC-010).
10. **List update mechanism** — AC says "immediately"; MCP confirms in-place list update after Save.
11. **Success feedback** — No toast observed after save.
12. **Error handling** — No AC for API/network failure (TC-012).
13. **"Other fields" scope** — AC-3 "other fields" includes AI Generation Config defaults if not modified (TC-025).
14. **Edit entry point** — **Resolved (MCP):** Button accessible name `Edit {ProgramName}`; row click selects program for semesters, not edit.
15. **Renaming to same name with changed Description** — Covered by TC-003.
16. **Concurrent editing** — Not in AC (TC-024).
17. **Security** — XSS not in AC (TC-023).
18. **Double-submit / loading state** — Not in AC (TC-013).
