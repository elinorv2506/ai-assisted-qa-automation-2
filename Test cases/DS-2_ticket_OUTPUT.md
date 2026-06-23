# DS-2 — Test Plan: Edit Existing Program Details

**Feature:** Edit existing academic program  
**Scope:** Edit program modal/form from the Programs page  
**Field names:** Program Name, Description  
**Primary actions:** Edit icon (per program row), `Save`  
**Sample program:** `Web Development 2026` — Description: `Full-stack web development program`

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
- Edit modal opens
- `Program Name` field contains `Web Development 2026`
- `Description` field contains `Full-stack web development program`
- `Save` button is visible and enabled (name is non-empty)

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

### TC-010 — Non-admin cannot edit programs

**Title:** Non-admin users do not see or cannot use the edit icon

**Preconditions:**
- User is logged in as instructor (or student)
- Program `Web Development 2026` exists on Programs page

**Steps:**
1. Navigate to Programs page
2. Look for edit icon on `Web Development 2026`
3. If hidden, attempt direct API/URL edit access

**Gherkin:**
```gherkin
Scenario: Non-admin cannot edit programs
  Given I am logged in as instructor
  And I am on the Programs page
  And a program "Web Development 2026" exists
  Then I do not see an edit icon on "Web Development 2026"
  And I cannot access the program edit form
```

**Expected result:**
- Edit icon hidden or disabled
- Direct edit access rejected (403/redirect)
- Program data unchanged

**Priority:** High

---

### TC-011 — Renaming to an existing program name is rejected or handled per policy

**Title:** Duplicate Program Name on edit does not silently overwrite another program

**Preconditions:**
- User is logged in as admin
- Programs `Web Development 2026` and `Cloud Engineering 2026` both exist
- User edits `Cloud Engineering 2026`

**Steps:**
1. Change Program Name to `Web Development 2026`
2. Click `Save`
3. Observe error handling and both program rows

**Gherkin:**
```gherkin
Scenario: Duplicate program name on edit is handled
  Given I am editing "Cloud Engineering 2026"
  And a program "Web Development 2026" already exists
  When I change the Program Name to "Web Development 2026"
  And I click Save
  Then the save is rejected with a clear validation error
  And the program list still shows both "Web Development 2026" and "Cloud Engineering 2026"
  And "Cloud Engineering 2026" is not renamed
```

**Expected result:**
- Validation error displayed (or silent dedupe per product rule — must be defined)
- No data loss on either program
- Modal remains open for correction

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
- Max length for Program Name is defined (e.g. 255 characters — adjust to spec)
- User is editing `Web Development 2026`

**Steps:**
1. Replace Program Name with a 255-character string (e.g. `W` repeated 255 times)
2. Click `Save`
3. Verify list display and re-open edit form

**Gherkin:**
```gherkin
Scenario: Program name at max length is saved
  Given I am editing "Web Development 2026"
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

**Priority:** Medium

---

### TC-015 — Program Name exceeding max length is rejected

**Title:** Program Name one character over max length cannot be saved

**Preconditions:**
- User is logged in as admin
- Max length = 255 characters (example)
- User is editing `Web Development 2026`

**Steps:**
1. Enter 256-character Program Name
2. Attempt Save

**Gherkin:**
```gherkin
Scenario: Program name over max length is rejected
  Given I am editing "Web Development 2026"
  And the maximum Program Name length is 255 characters
  When I change the Program Name to a 256-character string
  Then the Save button is disabled or a max-length validation error is shown
  And the program is not updated
```

**Expected result:**
- Input blocked at field level and/or validation on submit
- Original name preserved

**Priority:** Medium

---

### TC-016 — Description at maximum allowed length saves successfully

**Title:** Description at max length boundary persists after edit

**Preconditions:**
- User is logged in as admin
- Max Description length defined (e.g. 2000 characters)
- User is editing `Web Development 2026`

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

## AC Coverage Matrix

| Acceptance Criteria | Test Case(s) |
|---------------------|--------------|
| Open program for editing (pre-populated form) | TC-001 |
| Successfully edit program name | TC-002 |
| Edit preserves unchanged fields | TC-003 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Submit button label** — AC says `Save`; create flow uses `Create`. Confirm the edit modal button is labeled `Save` (not `Update` or `Submit`).
2. **Field inventory** — ACs only mention Name and Description implicitly. Confirm no additional read-only fields (ID, created date, status) appear on the edit form.
3. **Program Name validation on edit** — Create AC disables `Create` when name is empty (DS-1 FR-06). Edit ACs do not state whether the same rule applies to `Save`; assumed parity with create (TC-007, TC-008).
4. **Description required vs optional** — Not specified for edit. Create flow treats Description as optional; edit should follow the same rule (TC-020).
5. **Max length** — No limits documented for Program Name or Description. Boundary tests (TC-014–TC-016) need product-defined values.
6. **Duplicate name policy** — ACs silent on renaming to an existing name. TC-011 needs a defined rule (reject, allow, merge).
7. **Whitespace trimming** — Not specified. Leading/trailing spaces on rename could create near-duplicates (TC-019).
8. **Cancel / dismiss behavior** — ACs do not cover Cancel, X, Esc, or click-outside. TC-009 assumes standard modal dismiss.
9. **Non-admin access** — Implied by create FR-01 but not in edit ACs. Edit icon visibility and API authorization should be confirmed (TC-010).
10. **List update mechanism** — AC says list updates "immediately"; unclear if this is optimistic UI, refetch, or websocket. Persistence after refresh not specified.
11. **Success feedback** — No toast or confirmation message mentioned after save.
12. **Error handling** — No AC for API/network failure, validation messages, or loading/disabled state during save (TC-012).
13. **"Other fields" scope** — AC-3 says "Name and other fields remain unchanged" but only Name and Description are known. Clarify what "other fields" includes (metadata, sort order, linked courses).
14. **Edit entry point** — AC references "edit icon" only. No AC for keyboard access, row click, or context menu alternatives.
15. **Renaming to same name with changed Description** — Covered by TC-003; ACs do not explicitly call out this subset of "unchanged fields."
16. **Concurrent editing** — Not in scope of ACs; may matter for multi-admin environments (TC-024).
17. **Security** — XSS/sanitization for Description not in AC (TC-023).
18. **Double-submit / loading state** — Not in AC (TC-013).
