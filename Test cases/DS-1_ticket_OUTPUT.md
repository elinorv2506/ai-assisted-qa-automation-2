# DS-1 — Test Plan: Create New Academic Program

**Feature:** Create new academic program  
**Scope:** Program creation modal/form from the Programs page  
**Field names:** Program Name, Description  
**Primary actions:** `+ New Program`, `Create`

---

## Positive Flows

### TC-001 — Program creation form displays required fields

**Title:** Admin sees Program Name and Description on the creation form after opening it from Programs

**Preconditions:**
- User is logged in as admin
- User is on the Programs page

**Steps:**
1. Click `+ New Program`
2. Observe the program creation form/modal

**Gherkin:**
```gherkin
Scenario: Navigate to program creation form
  Given I am logged in as admin
  When I navigate to the Programs page
  And I click "+ New Program"
  Then I see the program creation form with fields: Program Name, Description
```

**Expected result:**
- Program creation form (modal) is visible
- `Program Name` field is present and editable
- `Description` field is present and editable
- `Create` button is visible

**Priority:** High

---

### TC-002 — Program is created and appears in the list

**Title:** Valid Program Name and Description create a program and close the modal

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Enter `Web Development 2026` in Program Name
2. Enter `Full-stack web development program` in Description
3. Click `Create`
4. Observe the modal and Programs list

**Gherkin:**
```gherkin
Scenario: Successfully create a program
  Given I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"
```

**Expected result:**
- Modal closes
- Programs list includes `Web Development 2026`
- No error message is shown
- New program persists after page refresh (recommended follow-up check)

**Priority:** High

---

### TC-003 — Program can be created with Program Name only

**Title:** Create succeeds when Description is empty but Program Name is valid

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Enter `Data Science Fundamentals` in Program Name
2. Leave Description empty
3. Click `Create`

**Gherkin:**
```gherkin
Scenario: Create program with empty description
  Given I am on the program creation form
  When I fill in Program Name with "Data Science Fundamentals"
  And I leave Description empty
  And I click Create
  Then the modal closes
  And the program list shows "Data Science Fundamentals"
```

**Expected result:**
- Modal closes
- `Data Science Fundamentals` appears in the program list
- Description is stored as empty or not shown (per product rules)

**Priority:** Medium

---

### TC-004 — Create button is enabled when Program Name has valid input

**Title:** Create button becomes enabled once Program Name contains non-whitespace text

**Preconditions:**
- User is logged in as admin
- User is on the program creation form
- Program Name is empty (Create disabled per AC)

**Steps:**
1. Enter `Cybersecurity 2026` in Program Name
2. Observe the Create button state

**Gherkin:**
```gherkin
Scenario: Create button enables when program name is provided
  Given I am on the program creation form
  And the Program Name field is empty
  And the Create button is disabled
  When I fill in Program Name with "Cybersecurity 2026"
  Then the Create button is enabled
```

**Expected result:**
- `Create` button is enabled after valid Program Name entry

**Priority:** High

---

### TC-005 — New program appears without disrupting existing list entries

**Title:** Creating a program appends to the list without removing existing programs

**Preconditions:**
- User is logged in as admin
- Programs page already contains at least one program (e.g. `Mobile App Development 2025`)
- User opens the program creation form

**Steps:**
1. Enter `Cloud Engineering 2026` in Program Name
2. Enter `AWS and Azure fundamentals` in Description
3. Click `Create`
4. Review the full program list

**Gherkin:**
```gherkin
Scenario: New program is added alongside existing programs
  Given I am logged in as admin
  And the Programs page shows "Mobile App Development 2025"
  And I am on the program creation form
  When I fill in Program Name with "Cloud Engineering 2026"
  And I fill in Description with "AWS and Azure fundamentals"
  And I click Create
  Then the program list shows "Cloud Engineering 2026"
  And the program list still shows "Mobile App Development 2025"
```

**Expected result:**
- Both programs are visible in the list
- Existing program data is unchanged

**Priority:** Medium

---

## Negative Flows

### TC-006 — Empty Program Name keeps Create disabled

**Title:** Create button remains disabled when Program Name is empty

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Leave Program Name empty
2. Optionally enter text in Description
3. Observe Create button state
4. Attempt to click Create (if clickable via keyboard/devtools)

**Gherkin:**
```gherkin
Scenario: Validation prevents empty program name
  Given I am on the program creation form
  When I leave the Program Name field empty
  Then the Create button is disabled
```

**Expected result:**
- `Create` button is disabled
- No program is created
- Modal remains open
- No new row appears in the program list

**Priority:** High

---

### TC-007 — Whitespace-only Program Name does not enable Create

**Title:** Create stays disabled when Program Name contains only spaces

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Enter `   ` (spaces only) in Program Name
2. Enter `Optional description text` in Description
3. Observe Create button state

**Gherkin:**
```gherkin
Scenario: Whitespace-only program name is treated as empty
  Given I am on the program creation form
  When I fill in Program Name with "   "
  And I fill in Description with "Optional description text"
  Then the Create button is disabled
  And no program is created
```

**Expected result:**
- `Create` remains disabled (or submit is blocked with validation)
- No program is added to the list

**Priority:** High

---

### TC-008 — Non-admin cannot access program creation

**Title:** Non-admin users do not see or cannot use `+ New Program`

**Preconditions:**
- User is logged in as a non-admin role (e.g. instructor or student)
- User navigates to Programs page

**Steps:**
1. Open Programs page
2. Look for `+ New Program`
3. If visible, attempt to open the form and create a program

**Gherkin:**
```gherkin
Scenario: Non-admin cannot create programs
  Given I am logged in as instructor
  When I navigate to the Programs page
  Then I do not see "+ New Program"
  And I cannot access the program creation form
```

**Expected result:**
- `+ New Program` is hidden or disabled
- Direct URL/API access to creation is rejected (403/redirect)
- No program is created

**Priority:** High

---

### TC-009 — Cancel/close does not create a program

**Title:** Dismissing the modal without submitting leaves the list unchanged

**Preconditions:**
- User is logged in as admin
- User is on the program creation form
- Record current program count or list contents

**Steps:**
1. Enter `UX Design 2026` in Program Name
2. Enter `Human-centered design principles` in Description
3. Close modal via Cancel, X, or Esc (whichever the UI supports)
4. Review program list

**Gherkin:**
```gherkin
Scenario: Closing form without submit does not create program
  Given I am on the program creation form
  When I fill in Program Name with "UX Design 2026"
  And I fill in Description with "Human-centered design principles"
  And I close the modal without clicking Create
  Then the modal closes
  And the program list does not show "UX Design 2026"
```

**Expected result:**
- Modal closes
- No new program in list
- Partial input is discarded

**Priority:** Medium

---

### TC-010 — Duplicate program name is rejected or handled per business rules

**Title:** System prevents or clearly handles duplicate Program Name

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` already exists in the list
- User opens program creation form

**Steps:**
1. Enter `Web Development 2026` in Program Name
2. Enter `Duplicate attempt description` in Description
3. Click `Create`
4. Observe UI response and list

**Gherkin:**
```gherkin
Scenario: Duplicate program name is not silently accepted
  Given I am logged in as admin
  And the program list shows "Web Development 2026"
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Duplicate attempt description"
  And I click Create
  Then the system shows a validation or error message
  And the program list contains only one "Web Development 2026"
```

**Expected result:**
- Either creation is blocked with a clear error, or duplicates are allowed by explicit product rule
- User is not left with ambiguous duplicate entries without feedback

**Priority:** High

---

### TC-011 — Create does not succeed on network/server failure

**Title:** Failed submission shows error and keeps user data in the form

**Preconditions:**
- User is logged in as admin
- User is on the program creation form
- Backend/network failure is simulated (offline or 500)

**Steps:**
1. Enter `AI Engineering 2026` in Program Name
2. Enter `Machine learning and NLP` in Description
3. Click `Create` while API is failing
4. Observe modal, fields, and list

**Gherkin:**
```gherkin
Scenario: Server error during create shows error and preserves input
  Given I am on the program creation form
  And the create program API returns an error
  When I fill in Program Name with "AI Engineering 2026"
  And I fill in Description with "Machine learning and NLP"
  And I click Create
  Then an error message is displayed
  And the modal remains open
  And the program list does not show "AI Engineering 2026"
  And the entered values remain in the form fields
```

**Expected result:**
- Clear error message
- Modal stays open with entered values preserved
- No phantom entry in list

**Priority:** Medium

---

## Edge Cases

### TC-012 — Minimum-length Program Name (single character)

**Title:** Single-character Program Name is accepted if within allowed length

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Enter `A` in Program Name
2. Enter `Single letter program name test` in Description
3. Click `Create`

**Gherkin:**
```gherkin
Scenario: Minimum length program name
  Given I am on the program creation form
  When I fill in Program Name with "A"
  And I fill in Description with "Single letter program name test"
  And I click Create
  Then the modal closes
  And the program list shows "A"
```

**Expected result:**
- Program is created, or validation message explains minimum length if restricted

**Priority:** Medium

---

### TC-013 — Maximum-length Program Name boundary

**Title:** Program Name at documented max length is accepted; over max is rejected

**Preconditions:**
- User is logged in as admin
- User is on the program creation form
- Known max length for Program Name (e.g. 255 characters — adjust to spec)

**Steps:**
1. Enter a 255-character Program Name (e.g. `W` repeated 255 times)
2. Click `Create`
3. Repeat with 256 characters

**Gherkin:**
```gherkin
Scenario: Program name at maximum allowed length
  Given I am on the program creation form
  When I fill in Program Name with a string of 255 characters
  And I fill in Description with "Boundary test at max length"
  And I click Create
  Then the modal closes
  And the program list shows the 255-character program name

Scenario: Program name exceeding maximum length is rejected
  Given I am on the program creation form
  When I fill in Program Name with a string of 256 characters
  Then the Create button is disabled or a validation message is shown
  And no program is created
```

**Expected result:**
- At max length: success (or documented behavior)
- Over max: blocked with validation; no truncated silent save

**Priority:** Medium

---

### TC-014 — Maximum-length Description boundary

**Title:** Description at max length succeeds; over max is rejected or truncated per spec

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Enter `Blockchain Basics 2026` in Program Name
2. Enter a description at max allowed length (e.g. 2000 chars)
3. Click `Create`
4. Repeat with length max + 1

**Gherkin:**
```gherkin
Scenario: Description at maximum allowed length
  Given I am on the program creation form
  When I fill in Program Name with "Blockchain Basics 2026"
  And I fill in Description with a string of 2000 characters
  And I click Create
  Then the modal closes
  And the program list shows "Blockchain Basics 2026"

Scenario: Description exceeding maximum length is handled
  Given I am on the program creation form
  When I fill in Program Name with "Blockchain Basics 2026"
  And I fill in Description with a string of 2001 characters
  Then validation prevents submission or input is limited at max length
```

**Expected result:**
- Behavior matches documented max-length rules
- No silent data loss without user feedback

**Priority:** Low

---

### TC-015 — Special characters in Program Name

**Title:** Program Name with allowed special characters is stored and displayed correctly

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Enter `C++ & C# Dev (2026) — "Advanced"` in Program Name
2. Enter `Covers C++, C#, and related tooling` in Description
3. Click `Create`
4. Verify list display and detail view if applicable

**Gherkin:**
```gherkin
Scenario: Special characters in program name
  Given I am on the program creation form
  When I fill in Program Name with "C++ & C# Dev (2026) — \"Advanced\""
  And I fill in Description with "Covers C++, C#, and related tooling"
  And I click Create
  Then the modal closes
  And the program list shows "C++ & C# Dev (2026) — \"Advanced\""
```

**Expected result:**
- Characters render correctly (no HTML/script injection, no encoding corruption)
- Name matches input exactly (unless normalization is documented)

**Priority:** Medium

---

### TC-016 — Unicode and emoji in Program Name and Description

**Title:** Non-ASCII characters are supported end-to-end

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Enter `תוכנית פיתוח אתרים 2026 🎓` in Program Name
2. Enter `תיאור בעברית — full-stack program` in Description
3. Click `Create`

**Gherkin:**
```gherkin
Scenario: Unicode characters in program fields
  Given I am on the program creation form
  When I fill in Program Name with "תוכנית פיתוח אתרים 2026 🎓"
  And I fill in Description with "תיאור בעברית — full-stack program"
  And I click Create
  Then the modal closes
  And the program list shows "תוכנית פיתוח אתרים 2026 🎓"
```

**Expected result:**
- Unicode displays correctly in form and list
- No mojibake or replacement characters

**Priority:** Low

---

### TC-017 — Leading and trailing whitespace in Program Name

**Title:** Leading/trailing spaces are trimmed or preserved consistently

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Enter `  Game Development 2026  ` in Program Name
2. Enter `Unity and Unreal basics` in Description
3. Click `Create`
4. Check stored/displayed name

**Gherkin:**
```gherkin
Scenario: Leading and trailing whitespace in program name
  Given I am on the program creation form
  When I fill in Program Name with "  Game Development 2026  "
  And I fill in Description with "Unity and Unreal basics"
  And I click Create
  Then the program list shows "Game Development 2026"
```

**Expected result:**
- Name is trimmed on save (recommended), or stored exactly as entered with documented behavior
- Duplicate detection uses normalized value if trimming applies

**Priority:** Medium

---

### TC-018 — HTML/script injection in Description

**Title:** Malicious input in Description is sanitized and not executed

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Enter `Secure Coding 2026` in Program Name
2. Enter `<script>alert('xss')</script><img src=x onerror=alert(1)>` in Description
3. Click `Create`
4. View program in list/detail

**Gherkin:**
```gherkin
Scenario: HTML injection in description is sanitized
  Given I am on the program creation form
  When I fill in Program Name with "Secure Coding 2026"
  And I fill in Description with "<script>alert('xss')</script>"
  And I click Create
  Then the modal closes
  And no script is executed on the Programs page
  And the description is displayed as plain text or safely rendered
```

**Expected result:**
- No script execution
- Content stored/displayed safely

**Priority:** High

---

### TC-019 — Rapid double-click on Create

**Title:** Only one program is created when Create is clicked twice quickly

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Enter `DevOps Pipeline 2026` in Program Name
2. Enter `CI/CD and infrastructure as code` in Description
3. Double-click `Create` rapidly
4. Count matching entries in list

**Gherkin:**
```gherkin
Scenario: Double submit creates only one program
  Given I am on the program creation form
  When I fill in Program Name with "DevOps Pipeline 2026"
  And I fill in Description with "CI/CD and infrastructure as code"
  And I double-click Create
  Then exactly one "DevOps Pipeline 2026" appears in the program list
```

**Expected result:**
- Single program created
- Create button disabled during submission (loading state)

**Priority:** Medium

---

### TC-020 — Program list sort/order after creation

**Title:** New program appears in the expected list position

**Preconditions:**
- User is logged in as admin
- Programs page has existing programs
- User creates `Quantum Computing Intro 2026`

**Steps:**
1. Create program with name above
2. Observe position in list (top, bottom, alphabetical)

**Gherkin:**
```gherkin
Scenario: New program appears in expected list order
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Quantum Computing Intro 2026"
  And I fill in Description with "Qubits and algorithms overview"
  And I click Create
  Then the program list shows "Quantum Computing Intro 2026"
  And the new program appears at the top of the list sorted by creation date descending
```

**Expected result:**
- New item appears per documented sort (e.g. newest first or alphabetical)
- Behavior is consistent across refreshes

**Priority:** Low

---

## AC Coverage Matrix

| Acceptance Criteria | Test Case(s) |
|---------------------|--------------|
| Navigate to program creation form | TC-001 |
| Successfully create a program | TC-002, TC-004, TC-005 |
| Validation prevents empty program name | TC-006, TC-007 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Description required or optional?** AC only validates empty Program Name. TC-003 assumes Description is optional; confirm with product.
2. **Max length** for Program Name and Description is not specified (TC-013, TC-014 use assumed limits).
3. **Duplicate Program Name policy** is undefined — block, allow, or warn (TC-010).
4. **Whitespace handling** — whether `"   "` counts as empty and whether leading/trailing spaces are trimmed (TC-007, TC-017).
5. **Modal dismiss behavior** — Cancel button, X, Esc, click-outside not mentioned (TC-009).
6. **Non-admin access** — AC assumes admin only; no explicit RBAC criteria (TC-008).
7. **List behavior after create** — sort order, pagination, search/filter not defined (TC-005, TC-020).
8. **Success feedback** — AC only says modal closes; toast/confirmation message not specified.
9. **Persistence** — AC does not require refresh/navigation to confirm save (recommended in TC-002).
10. **Field types** — single-line vs multiline Description, character counters, placeholders not defined.
11. **Error handling** — network/API failures not in AC (TC-011).
12. **Internationalization** — Unicode/RTL support not mentioned (TC-016).
13. **Security** — XSS/sanitization for Description not in AC (TC-018).
14. **Concurrent creation / double-submit** not covered (TC-019).
15. **Minimum Program Name length** — single character allowed or not (TC-012).
