# DS-5 — Test Plan: Program List Filtering and Display

**Feature:** Program list filtering and display  
**Scope:** Programs page — program list rendering and empty state  
**Field names:** Program Name, Description  
**List columns:** Program Name, Description  
**Primary actions:** `+ New Program`, Edit icon (per row), Delete icon (per row)  
**Sample programs:** `Web Development 2026`, `Cloud Engineering 2026`, `Mobile App Development 2025`, `Informatique & IA - Niveau 2`

---

## Positive Flows

### TC-001 — Program list displays Program Name and Description for each program

**Title:** Each existing program is shown in the list with its Program Name and Description

**Preconditions:**
- User is logged in as admin
- Programs exist in the system:
  - Program Name: `Web Development 2026`, Description: `Full-stack web development program`
  - Program Name: `Cloud Engineering 2026`, Description: `AWS and Azure fundamentals`

**Steps:**
1. Navigate to the Programs page
2. Observe the program list
3. Locate the row for `Web Development 2026`
4. Locate the row for `Cloud Engineering 2026`

**Gherkin:**
```gherkin
Scenario: Display program list with key details
  Given programs exist in the system
  And a program "Web Development 2026" exists with Description "Full-stack web development program"
  And a program "Cloud Engineering 2026" exists with Description "AWS and Azure fundamentals"
  When I navigate to the Programs page
  Then I see a list showing each program's name and description
  And the list shows Program Name "Web Development 2026" and Description "Full-stack web development program"
  And the list shows Program Name "Cloud Engineering 2026" and Description "AWS and Azure fundamentals"
```

**Expected result:**
- Programs page loads without error
- List displays column headers or labels for **Program Name** and **Description**
- Each program row shows the correct Program Name and Description
- Both programs are visible simultaneously
- Edit and delete icons are available on each row (per DS-2 / DS-4)

**Priority:** High

---

### TC-002 — Empty state is shown when no programs exist

**Title:** Programs page shows an empty-state message and create prompt when the list has zero programs

**Preconditions:**
- User is logged in as admin
- No programs exist in the system (fresh tenant or all programs deleted)

**Steps:**
1. Navigate to the Programs page
2. Observe the main content area
3. Look for a call-to-action to create a program

**Gherkin:**
```gherkin
Scenario: Empty state when no programs exist
  Given no programs exist
  When I navigate to the Programs page
  Then I see a message indicating no programs have been created
  And I see a prompt to create the first program
```

**Expected result:**
- No program rows are displayed
- Empty-state message is visible (e.g. “No programs have been created yet” or equivalent)
- User is prompted to create the first program (e.g. via `+ New Program` button or inline link)
- Page layout is intact; no broken table or orphan row actions

**Priority:** High

---

### TC-003 — `+ New Program` is available on the Programs page with existing programs

**Title:** Create action remains accessible when the program list is populated

**Preconditions:**
- User is logged in as admin
- At least one program exists (e.g. `Mobile App Development 2025`)

**Steps:**
1. Navigate to the Programs page
2. Verify the program list is visible
3. Locate the `+ New Program` action

**Gherkin:**
```gherkin
Scenario: Create action is available on populated Programs page
  Given I am logged in as admin
  And a program "Mobile App Development 2025" exists
  When I navigate to the Programs page
  Then I see the program list
  And I see the "+ New Program" action
```

**Expected result:**
- `+ New Program` is visible and clickable
- List and create action coexist without layout overlap

**Priority:** Medium

---

### TC-004 — `+ New Program` from empty state opens the creation form

**Title:** Empty-state create prompt leads to the program creation form

**Preconditions:**
- User is logged in as admin
- No programs exist

**Steps:**
1. Navigate to the Programs page
2. Confirm empty state is shown
3. Click `+ New Program` (or the empty-state create prompt, if separate)
4. Observe the opened form

**Gherkin:**
```gherkin
Scenario: Empty state create prompt opens program creation form
  Given no programs exist
  And I am on the Programs page
  When I click "+ New Program"
  Then I see the program creation form with fields: Program Name, Description
```

**Expected result:**
- Program creation modal/form opens
- Fields **Program Name** and **Description** are present
- **Create** button is visible

**Priority:** High

---

### TC-005 — Program list persists after page refresh

**Title:** Displayed programs remain visible after reloading the Programs page

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` exists with Description `Full-stack web development program`

**Steps:**
1. Navigate to the Programs page
2. Confirm `Web Development 2026` and its Description are shown
3. Refresh the page
4. Re-check the list

**Gherkin:**
```gherkin
Scenario: Program list data persists after refresh
  Given a program "Web Development 2026" exists with Description "Full-stack web development program"
  And I am on the Programs page
  When I refresh the Programs page
  Then the list shows Program Name "Web Development 2026"
  And the list shows Description "Full-stack web development program"
```

**Expected result:**
- Same Program Name and Description appear after refresh
- No duplicate rows for the same program

**Priority:** Medium

---

### TC-006 — Program with empty Description still appears in the list

**Title:** Programs without a Description are listed with Program Name and an empty or placeholder Description cell

**Preconditions:**
- User is logged in as admin
- Program `Data Science Fundamentals` exists with an empty Description (per DS-1 optional Description rule)

**Steps:**
1. Navigate to the Programs page
2. Locate `Data Science Fundamentals` in the list
3. Observe the Description column for that row

**Gherkin:**
```gherkin
Scenario: Program with empty description appears in list
  Given a program "Data Science Fundamentals" exists with an empty Description
  When I navigate to the Programs page
  Then the list shows Program Name "Data Science Fundamentals"
  And the Description is empty or shows an appropriate placeholder
```

**Expected result:**
- Row is present with Program Name `Data Science Fundamentals`
- Description cell is blank, em dash, or “—” — not missing or misaligned
- Row is not hidden because Description is empty

**Priority:** Medium

---

## Negative Flows

### TC-007 — Populated list is not shown when no programs exist

**Title:** Empty state replaces the program list; no phantom rows appear

**Preconditions:**
- User is logged in as admin
- No programs exist

**Steps:**
1. Navigate to the Programs page
2. Inspect the list area for rows, column headers with data, or edit/delete icons

**Gherkin:**
```gherkin
Scenario: No program rows when list is empty
  Given no programs exist
  When I navigate to the Programs page
  Then I do not see any program rows
  And I do not see edit icons or delete icons without a program row
```

**Expected result:**
- Empty state is shown (TC-002)
- No program rows, no orphan edit/delete icons
- No loading spinner stuck indefinitely
- No sample/demo program data

**Priority:** High

---

### TC-008 — Empty state is not shown when programs exist

**Title:** Programs list replaces empty state once at least one program exists

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` exists

**Steps:**
1. Navigate to the Programs page
2. Verify the program list is visible
3. Search the page for empty-state messaging

**Gherkin:**
```gherkin
Scenario: Empty state hidden when programs exist
  Given a program "Web Development 2026" exists
  When I navigate to the Programs page
  Then I see a list showing "Web Development 2026"
  And I do not see a message indicating no programs have been created
```

**Expected result:**
- Program list is displayed
- Empty-state message is not shown alongside populated rows
- `+ New Program` remains available

**Priority:** High

---

### TC-009 — Program Name and Description are not swapped in the list

**Title:** List columns map correctly to Program Name and Description fields

**Preconditions:**
- User is logged in as admin
- Program exists with distinct values:
  - Program Name: `Cybersecurity 2026`
  - Description: `Network security and ethical hacking fundamentals`

**Steps:**
1. Navigate to the Programs page
2. Find the row for `Cybersecurity 2026`
3. Compare Program Name and Description column values to stored data

**Gherkin:**
```gherkin
Scenario: Program name and description are not swapped in list
  Given a program "Cybersecurity 2026" exists with Description "Network security and ethical hacking fundamentals"
  When I navigate to the Programs page
  Then the Program Name column shows "Cybersecurity 2026"
  And the Description column shows "Network security and ethical hacking fundamentals"
  And the Description column does not show "Cybersecurity 2026"
```

**Expected result:**
- Values appear under the correct columns
- No cross-column duplication unless Description intentionally equals Name

**Priority:** High

---

### TC-010 — Deleted programs do not remain visible in the list

**Title:** Removed programs are not displayed after deletion (list display stays in sync)

**Preconditions:**
- User is logged in as admin
- Programs `Test Program` and `Web Development 2026` exist
- User is on the Programs page

**Steps:**
1. Delete `Test Program` via delete icon and confirm
2. Observe the list
3. Confirm `Web Development 2026` still appears

**Gherkin:**
```gherkin
Scenario: Deleted program is not shown in list
  Given programs "Test Program" and "Web Development 2026" exist
  And I am on the Programs page
  When I delete "Test Program" and confirm deletion
  Then "Test Program" is not shown in the program list
  And "Web Development 2026" remains in the program list
```

**Expected result:**
- `Test Program` row disappears immediately
- `Web Development 2026` unchanged
- List count decreases by one; empty state does not appear unless it was the last program

**Priority:** Medium

---

### TC-011 — Non-admin user does not see admin program list inappropriately

**Title:** Unauthorized users cannot view or interact with the admin Programs list per access rules

**Preconditions:**
- User is logged in as a non-admin role (e.g. student or instructor)
- Programs exist in the system

**Steps:**
1. Attempt to navigate to the Programs page (direct URL or navigation menu)
2. Observe access result

**Gherkin:**
```gherkin
Scenario: Non-admin cannot access Programs page program list
  Given I am logged in as a non-admin user
  And programs exist in the system
  When I attempt to navigate to the Programs page
  Then I do not see the admin program list with edit and delete actions
  Or I am redirected or shown an access denied message
```

**Expected result:**
- Non-admin does not see the full admin list with row actions
- Behavior matches product RBAC (redirect, 403, or hidden nav item)

**Priority:** Medium

---

### TC-012 — API or load failure does not show a false empty state with create prompt

**Title:** Failed data load is distinguished from a genuine zero-program empty state

**Preconditions:**
- User is logged in as admin
- Programs exist in the system
- Network/API failure can be simulated (devtools offline or mocked 500)

**Steps:**
1. Simulate API failure for the programs list request
2. Navigate to or refresh the Programs page
3. Observe messaging and available actions

**Gherkin:**
```gherkin
Scenario: Load failure is not shown as successful empty state
  Given programs exist in the system
  And the programs list API request fails
  When I navigate to the Programs page
  Then I do not see a success empty state claiming no programs have been created
  And I see an error or retry indication
```

**Expected result:**
- User is not misled into thinking no programs exist
- Error/retry UI shown instead of TC-002 empty state (exact copy TBD with product)

**Priority:** Medium

---

## Edge Cases

### TC-013 — Single program displays correctly in a one-row list

**Title:** List with exactly one program renders one complete row

**Preconditions:**
- User is logged in as admin
- Only `Mobile App Development 2025` exists with Description `iOS and Android development track`

**Steps:**
1. Navigate to the Programs page
2. Count visible program rows
3. Verify row content

**Gherkin:**
```gherkin
Scenario: Single program in list
  Given only the program "Mobile App Development 2025" exists with Description "iOS and Android development track"
  When I navigate to the Programs page
  Then I see exactly one program row
  And the list shows Program Name "Mobile App Development 2025"
  And the list shows Description "iOS and Android development track"
```

**Expected result:**
- Exactly one row; not empty state
- Row actions (edit, delete) present

**Priority:** Medium

---

### TC-014 — Special characters in Program Name and Description render correctly

**Title:** Punctuation, symbols, and accented characters display safely in the list

**Preconditions:**
- User is logged in as admin
- Program exists:
  - Program Name: `Informatique & IA - Niveau 2`
  - Description: `Programme avancé en informatique et intelligence artificielle`

**Steps:**
1. Navigate to the Programs page
2. Inspect the row for `Informatique & IA - Niveau 2`

**Gherkin:**
```gherkin
Scenario: Special characters display correctly in program list
  Given a program "Informatique & IA - Niveau 2" exists with Description "Programme avancé en informatique et intelligence artificielle"
  When I navigate to the Programs page
  Then the list shows Program Name "Informatique & IA - Niveau 2"
  And the list shows Description "Programme avancé en informatique et intelligence artificielle"
```

**Expected result:**
- `&`, `-`, and accented characters render correctly
- No HTML entity corruption (`&amp;` visible as text) or broken layout

**Priority:** High

---

### TC-015 — Unicode and emoji in Program Name and Description display correctly

**Title:** Non-ASCII text and emoji in list fields render without corruption

**Preconditions:**
- User is logged in as admin
- Program exists:
  - Program Name: `תוכנית פיתוח אתרים 2026 🎓`
  - Description: `Full-stack track with modern frameworks`

**Steps:**
1. Navigate to the Programs page
2. Verify Hebrew RTL text and emoji in the Program Name column
3. Verify Description column

**Gherkin:**
```gherkin
Scenario: Unicode and emoji in program list
  Given a program "תוכנית פיתוח אתרים 2026 🎓" exists with Description "Full-stack track with modern frameworks"
  When I navigate to the Programs page
  Then the list shows the full Program Name including emoji
  And the list shows Description "Full-stack track with modern frameworks"
```

**Expected result:**
- RTL and emoji display correctly (direction may follow product i18n rules)
- No tofu boxes or truncated surrogate pairs

**Priority:** Medium

---

### TC-016 — Maximum-length Program Name displays in the list without breaking layout

**Title:** 255-character Program Name is shown in the list with acceptable truncation or wrapping

**Preconditions:**
- User is logged in as admin
- Program exists with Program Name of 255 characters (`W` repeated 255 times) and Description `Max length display test`

**Steps:**
1. Navigate to the Programs page
2. Locate the max-length program row
3. Inspect Program Name cell for truncation, tooltip, or overflow handling

**Gherkin:**
```gherkin
Scenario: Max-length program name in list
  Given a program with a 255-character Program Name exists
  When I navigate to the Programs page
  Then the program appears in the list
  And the Program Name is displayed without breaking the table layout
```

**Expected result:**
- Row renders; layout does not overflow horizontally off-screen
- Full name available via tooltip/expand if truncated (per product UX)

**Priority:** Medium

---

### TC-017 — Long Description displays with truncation or wrapping per design

**Title:** Very long Description text does not break list layout

**Preconditions:**
- User is logged in as admin
- Program `Long Description Program` exists with Description of 2000+ characters

**Steps:**
1. Navigate to the Programs page
2. Observe the Description cell for `Long Description Program`

**Gherkin:**
```gherkin
Scenario: Long description in program list
  Given a program "Long Description Program" exists with a Description of 2000 characters
  When I navigate to the Programs page
  Then the list shows Program Name "Long Description Program"
  And the Description is displayed with truncation or wrapping without breaking the row layout
```

**Expected result:**
- Row height/width remain usable
- Full text accessible if truncated (tooltip, expand, or detail view — TBD)

**Priority:** Low

---

### TC-018 — Minimum-length Program Name (single character) displays in list

**Title:** Single-character Program Name renders correctly in the list

**Preconditions:**
- User is logged in as admin
- Program `X` exists with Description `Single character name boundary test`

**Steps:**
1. Navigate to the Programs page
2. Locate program row with Program Name `X`

**Gherkin:**
```gherkin
Scenario: Single-character program name in list
  Given a program "X" exists with Description "Single character name boundary test"
  When I navigate to the Programs page
  Then the list shows Program Name "X"
  And the list shows Description "Single character name boundary test"
```

**Expected result:**
- Single character is visible; not treated as empty row
- Column alignment remains correct

**Priority:** Low

---

### TC-019 — Multiple programs all appear without missing entries

**Title:** List shows every program when several exist (no silent omission)

**Preconditions:**
- User is logged in as admin
- Programs exist:
  - `Web Development 2026`
  - `Cloud Engineering 2026`
  - `Data Science Fundamentals`
  - `Mobile App Development 2025`

**Steps:**
1. Navigate to the Programs page
2. Verify each program name appears exactly once

**Gherkin:**
```gherkin
Scenario: All programs appear in list
  Given programs "Web Development 2026", "Cloud Engineering 2026", "Data Science Fundamentals", and "Mobile App Development 2025" exist
  When I navigate to the Programs page
  Then the list shows "Web Development 2026"
  And the list shows "Cloud Engineering 2026"
  And the list shows "Data Science Fundamentals"
  And the list shows "Mobile App Development 2025"
```

**Expected result:**
- All four programs visible (or pagination documented if list exceeds page size)
- No duplicate rows for the same Program Name

**Priority:** Medium

---

### TC-020 — Newly created program appears in the list immediately

**Title:** List updates after create without manual refresh

**Preconditions:**
- User is logged in as admin
- User is on the Programs page
- Program creation form is open via `+ New Program`

**Steps:**
1. Enter Program Name `Quantum Computing Intro 2026` and Description `Introduction to qubits and algorithms`
2. Click **Create**
3. Observe the Programs list

**Gherkin:**
```gherkin
Scenario: New program appears in list after create
  Given I am on the Programs page
  And I am on the program creation form
  When I fill in Program Name with "Quantum Computing Intro 2026"
  And I fill in Description with "Introduction to qubits and algorithms"
  And I click Create
  Then the program list shows "Quantum Computing Intro 2026"
  And the list shows Description "Introduction to qubits and algorithms"
```

**Expected result:**
- New row appears immediately after modal closes
- Existing rows unchanged

**Priority:** High

---

### TC-021 — Edited program details update in the list immediately

**Title:** List reflects updated Program Name and Description after save

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` exists
- User is on the Programs page

**Steps:**
1. Click edit icon on `Web Development 2026`
2. Change Program Name to `Web Development 2026 - Updated`
3. Change Description to `Updated full-stack curriculum`
4. Click **Save**
5. Observe the list

**Gherkin:**
```gherkin
Scenario: List updates after program edit
  Given a program "Web Development 2026" exists
  And I am on the Programs page
  When I edit the program and change Program Name to "Web Development 2026 - Updated"
  And I change Description to "Updated full-stack curriculum"
  And I save the changes
  Then the program list shows "Web Development 2026 - Updated"
  And the list shows Description "Updated full-stack curriculum"
  And the program list does not show "Web Development 2026"
```

**Expected result:**
- List shows updated values immediately
- Old Program Name no longer appears as a separate row

**Priority:** High

---

### TC-022 — HTML in Description is sanitized in list display

**Title:** Script tags in Description are rendered as text, not executed

**Preconditions:**
- User is logged in as admin
- Program `Secure Coding 2026` exists with Description containing `<script>alert('xss')</script>`

**Steps:**
1. Navigate to the Programs page
2. Observe the Description cell
3. Confirm no script alert executes

**Gherkin:**
```gherkin
Scenario: XSS payload in description is sanitized in list
  Given a program "Secure Coding 2026" exists with Description "<script>alert('xss')</script>"
  When I navigate to the Programs page
  Then the list shows "Secure Coding 2026"
  And no script is executed on the Programs page
  And the Description does not render executable HTML
```

**Expected result:**
- No alert/dialog from injected script
- Description shown as plain text or safely escaped

**Priority:** Medium

---

### TC-023 — Empty state after deleting the last program

**Title:** Deleting the only program transitions the list to the empty state with create prompt

**Preconditions:**
- User is logged in as admin
- Only `Test Program` exists
- User is on the Programs page

**Steps:**
1. Delete `Test Program` and confirm
2. Observe the Programs page content

**Gherkin:**
```gherkin
Scenario: Empty state after last program deleted
  Given only the program "Test Program" exists
  And I am on the Programs page
  When I delete "Test Program" and confirm deletion
  Then I see a message indicating no programs have been created
  And I see a prompt to create the first program
```

**Expected result:**
- Empty state matches TC-002
- `+ New Program` available
- No orphan edit/delete icons

**Priority:** Medium

---

### TC-024 — Leading/trailing whitespace in stored Program Name displays consistently

**Title:** Trimmed or stored whitespace in Program Name does not cause duplicate-looking rows in display

**Preconditions:**
- User is logged in as admin
- Program stored as `Web Development 2026` (trimmed per DS-3 rules)
- No second program with spaced variant `  Web Development 2026  `

**Steps:**
1. Navigate to the Programs page
2. Search list for `Web Development 2026`
3. Confirm single matching row

**Gherkin:**
```gherkin
Scenario: No duplicate-looking rows from whitespace variants
  Given a program "Web Development 2026" exists
  And no program named "  Web Development 2026  " exists
  When I navigate to the Programs page
  Then the program list contains exactly one row for "Web Development 2026"
```

**Expected result:**
- One row for the program
- Display matches stored canonical name

**Priority:** Low

---

## AC Coverage Matrix

| Acceptance Criteria | Test Case(s) |
|---------------------|--------------|
| Display program list with key details (name and description) | TC-001, TC-006, TC-009, TC-013, TC-014, TC-015, TC-016, TC-017, TC-018, TC-019 |
| Empty state when no programs exist (message + create prompt) | TC-002, TC-004, TC-007, TC-023 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **“Filtering” in feature title vs ACs** — The feature is named “Program list filtering and display,” but the ACs only cover **display** and **empty state**. No search box, filter controls, sort, or filter-by-criteria behavior is specified. Filtering tests cannot be written from these ACs alone; confirm whether filtering is in scope or deferred.
2. **Exact empty-state copy** — AC requires “a message” and “a prompt” but does not define exact text (e.g. “No programs have been created yet” vs “Get started by creating your first program”). TC-002 assumes `+ New Program` satisfies the create prompt; confirm if a separate inline link is required.
3. **List structure** — AC does not specify table vs cards, column headers, row actions (edit/delete), or whether Description is optional in display when empty (TC-006).
4. **Sort order** — Not defined (alphabetical, created date, manual). TC-019 does not assert order, only completeness.
5. **Pagination / virtual scroll** — Unclear at what program count the list paginates; TC-019 may need pagination cases once threshold is known.
6. **Non-admin access** — AC does not mention role restrictions; other DS tickets imply admin-only (TC-011).
7. **Loading state** — No AC for skeleton/spinner while programs load; TC-012 addresses error vs empty conflation.
8. **Persistence** — AC does not require refresh verification; TC-005 is recommended follow-up.
9. **Max length / truncation UX** — Display rules for long Program Name and Description not specified (TC-016, TC-017 use assumed 255-char name and 2000-char description).
10. **Accessibility** — Screen reader labels for list, empty state, and `+ New Program` not mentioned.
11. **Internationalization** — RTL and locale-specific empty-state strings not specified (TC-015).
12. **Relationship to create/edit/delete** — List display after create (TC-020), edit (TC-021), and delete (TC-010, TC-023) is implied by related DS tickets but not in these ACs.
13. **Duplicate Program Names** — DS-3 enforces unique names on create; list display with duplicates is out of scope unless policy changes.
14. **Network resilience** — Retry behavior and offline handling not in AC (TC-012).
