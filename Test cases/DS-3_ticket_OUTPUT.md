# DS-3 — Test Plan: Program Name Validation and Duplicate Prevention

**Feature:** Program name validation and duplicate prevention  
**Scope:** Program creation form (modal) on the Programs page  
**Field names:** Program Name, Description  
**Primary actions:** `+ New Program`, `Create`

---

## Positive Flows

### TC-001 — Program with special characters in name is created successfully

**Title:** Valid Program Name containing ampersands, hyphens, and accented characters is accepted

**Preconditions:**
- User is logged in as admin
- User is on the program creation form (Programs page → `+ New Program`)
- No existing program named `Informatique & IA - Niveau 2`

**Steps:**
1. Enter `Informatique & IA - Niveau 2` in Program Name
2. Enter `Programme avancé en informatique et intelligence artificielle` in Description
3. Click `Create`
4. Observe the modal and Programs list

**Gherkin:**
```gherkin
Scenario: Accept program name with special characters
  Given I am on the program creation form
  When I enter "Informatique & IA - Niveau 2" as the program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully
```

**Expected result:**
- Modal closes
- Programs list shows `Informatique & IA - Niveau 2` exactly as entered
- No validation error is displayed
- Only one new row appears for this program

**Priority:** High

---

### TC-002 — Standard valid Program Name creates program without duplicate conflict

**Title:** New unique Program Name is accepted when no duplicate exists

**Preconditions:**
- User is logged in as admin
- User is on the program creation form
- Program `Web Development 2026` does not already exist (or use a different unique name)

**Steps:**
1. Enter `Web Development 2026` in Program Name
2. Enter `Full-stack web development program` in Description
3. Click `Create`

**Gherkin:**
```gherkin
Scenario: Successfully create a program with a unique name
  Given I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"
```

**Expected result:**
- Program is created successfully
- No duplicate-name error appears
- List contains exactly one `Web Development 2026`

**Priority:** High

---

### TC-003 — Program Name with leading and trailing spaces is trimmed and saved

**Title:** Valid name with surrounding whitespace is normalized and created as trimmed value

**Preconditions:**
- User is logged in as admin
- User is on the program creation form
- No program named `Cloud Engineering 2026` exists

**Steps:**
1. Enter `  Cloud Engineering 2026  ` in Program Name
2. Enter `AWS and Azure fundamentals` in Description
3. Click `Create`
4. Verify displayed name in the list

**Gherkin:**
```gherkin
Scenario: Leading and trailing whitespace is trimmed on create
  Given I am on the program creation form
  When I fill in Program Name with "  Cloud Engineering 2026  "
  And I fill in Description with "AWS and Azure fundamentals"
  And I click Create
  Then the modal closes
  And the program list shows "Cloud Engineering 2026"
```

**Expected result:**
- Program is created with trimmed name `Cloud Engineering 2026`
- Stored/displayed value does not include leading or trailing spaces
- Duplicate check uses the trimmed value

**Priority:** Medium

---

### TC-004 — Additional allowed special characters are preserved end-to-end

**Title:** Program Name with punctuation and symbols renders correctly in the list

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Enter `C++ & C# Dev (2026) — "Advanced"` in Program Name
2. Enter `Covers C++, C#, and related tooling` in Description
3. Click `Create`
4. Review the Programs list display

**Gherkin:**
```gherkin
Scenario: Extended special characters in program name are accepted
  Given I am on the program creation form
  When I fill in Program Name with "C++ & C# Dev (2026) — \"Advanced\""
  And I fill in Description with "Covers C++, C#, and related tooling"
  And I click Create
  Then the modal closes
  And the program list shows "C++ & C# Dev (2026) — \"Advanced\""
```

**Expected result:**
- Program is created successfully
- Special characters display correctly (no HTML encoding issues, no script execution)
- Name matches input exactly (after any documented trimming rules)

**Priority:** Medium

---

### TC-005 — Unicode characters in Program Name are accepted

**Title:** Non-ASCII Program Name is stored and displayed correctly

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Enter `תוכנית פיתוח אתרים 2026` in Program Name
2. Enter `תיאור בעברית — full-stack program` in Description
3. Click `Create`

**Gherkin:**
```gherkin
Scenario: Unicode program name is accepted
  Given I am on the program creation form
  When I fill in Program Name with "תוכנית פיתוח אתרים 2026"
  And I fill in Description with "תיאור בעברית — full-stack program"
  And I click Create
  Then the modal closes
  And the program list shows "תוכנית פיתוח אתרים 2026"
```

**Expected result:**
- Program is created successfully
- Unicode displays correctly in the list (no mojibake)

**Priority:** Low

---

## Negative Flows

### TC-006 — Whitespace-only Program Name is rejected and form is not submitted

**Title:** Program Name containing only spaces is trimmed to empty and creation is blocked

**Preconditions:**
- User is logged in as admin
- User is on the program creation form
- Record current program count

**Steps:**
1. Enter `   ` (three spaces) in Program Name
2. Enter `Optional description text` in Description
3. Click `Create` (or attempt to if disabled)
4. Observe modal, validation state, and Programs list

**Gherkin:**
```gherkin
Scenario: Reject program name with only whitespace
  Given I am on the program creation form
  When I enter "   " as the program name
  And I click Create
  Then the form is not submitted (name is trimmed, treated as empty)
```

**Expected result:**
- Form is not submitted
- No new program is added to the list
- Modal remains open
- Either the `Create` button is disabled while name is whitespace-only, or clicking `Create` shows inline validation (e.g. "Program Name is required") and blocks submit
- Entered Description value is preserved in the form

**Priority:** High

---

### TC-007 — Duplicate Program Name is rejected with a clear error

**Title:** Creating a program with an existing name shows an error and does not add a duplicate row

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` already exists in the Programs list
- User opens the program creation form

**Steps:**
1. Enter `Web Development 2026` in Program Name
2. Enter `Second attempt — different description` in Description
3. Click `Create`
4. Observe error message and Programs list

**Gherkin:**
```gherkin
Scenario: Reject duplicate program name
  Given a program "Web Development 2026" already exists
  When I try to create a new program with the same name
  Then I see an error indicating the name already exists
```

**Expected result:**
- Error message is displayed (e.g. "A program with this name already exists" or equivalent)
- Modal remains open
- Programs list contains exactly one `Web Development 2026`
- No silent duplicate row is created

**Priority:** High

---

### TC-008 — Empty Program Name prevents submission

**Title:** Blank Program Name is treated as invalid and blocks program creation

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Leave Program Name empty
2. Enter `Description without a name` in Description
3. Attempt to click `Create`

**Gherkin:**
```gherkin
Scenario: Empty program name is not submitted
  Given I am on the program creation form
  When I leave the Program Name field empty
  And I fill in Description with "Description without a name"
  Then the Create button is disabled
  And no program is created
```

**Expected result:**
- `Create` button is disabled (consistent with DS-1 FR-06)
- Form is not submitted
- No new program appears in the list

**Priority:** High

---

### TC-009 — Duplicate attempt does not modify the existing program

**Title:** Failed duplicate create leaves the original program unchanged

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` exists with Description `Full-stack web development program`
- User is on the program creation form

**Steps:**
1. Enter `Web Development 2026` in Program Name
2. Enter `Malicious overwrite attempt` in Description
3. Click `Create`
4. Inspect the existing `Web Development 2026` row

**Gherkin:**
```gherkin
Scenario: Duplicate create does not overwrite existing program
  Given a program "Web Development 2026" already exists with description "Full-stack web development program"
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Malicious overwrite attempt"
  And I click Create
  Then I see an error indicating the name already exists
  And the existing program still has description "Full-stack web development program"
  And the program list contains only one "Web Development 2026"
```

**Expected result:**
- Existing program data is unchanged
- No overwrite, merge, or update occurs on duplicate submit

**Priority:** High

---

### TC-010 — Whitespace-padded duplicate name is rejected after trimming

**Title:** Name that differs only by leading/trailing spaces is treated as duplicate

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` already exists
- User is on the program creation form

**Steps:**
1. Enter `  Web Development 2026  ` in Program Name
2. Enter `Padded duplicate attempt` in Description
3. Click `Create`

**Gherkin:**
```gherkin
Scenario: Trimmed duplicate name is rejected
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "  Web Development 2026  "
  And I fill in Description with "Padded duplicate attempt"
  And I click Create
  Then I see an error indicating the name already exists
  And no second program is created
```

**Expected result:**
- Duplicate error is shown (trimmed value matches existing name)
- List still contains only one `Web Development 2026`

**Priority:** High

---

### TC-011 — Duplicate error preserves user input for correction

**Title:** After duplicate rejection, user can edit the name without losing other field values

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` already exists
- User is on the program creation form

**Steps:**
1. Enter `Web Development 2026` in Program Name
2. Enter `Advanced React and Node.js` in Description
3. Click `Create` and observe error
4. Change Program Name to `Web Development 2026 - Advanced`
5. Click `Create` again

**Gherkin:**
```gherkin
Scenario: User can recover from duplicate name error
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Advanced React and Node.js"
  And I click Create
  Then I see an error indicating the name already exists
  When I change Program Name to "Web Development 2026 - Advanced"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026 - Advanced"
```

**Expected result:**
- After first submit: error shown, Description remains `Advanced React and Node.js`
- After rename: program is created successfully
- Original `Web Development 2026` is unchanged

**Priority:** Medium

---

### TC-012 — Valid name is not rejected when a similar but different name exists

**Title:** Names that are similar but not identical are allowed

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` already exists
- User is on the program creation form

**Steps:**
1. Enter `Web Development 2026 - Updated` in Program Name
2. Enter `Extended curriculum` in Description
3. Click `Create`

**Gherkin:**
```gherkin
Scenario: Similar but distinct program name is accepted
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026 - Updated"
  And I fill in Description with "Extended curriculum"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"
  And the program list shows "Web Development 2026 - Updated"
```

**Expected result:**
- Both programs exist in the list
- No duplicate-name error

**Priority:** Medium

---

## Edge Cases

### TC-013 — Tabs and newline characters in whitespace-only name are rejected

**Title:** Non-space whitespace characters are trimmed and treated as empty

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Enter `\t\t` or a newline-only value in Program Name (if the field accepts it)
2. Enter `Test description` in Description
3. Attempt to click `Create`

**Gherkin:**
```gherkin
Scenario: Tab and newline only program name is rejected
  Given I am on the program creation form
  When I fill in Program Name with a tab-only or newline-only string
  And I fill in Description with "Test description"
  And I click Create
  Then the form is not submitted
  And no program is created
```

**Expected result:**
- Treated the same as space-only input (trimmed to empty)
- Form is not submitted

**Priority:** Medium

---

### TC-014 — Minimum-length Program Name (single character) is accepted

**Title:** One non-whitespace character satisfies Program Name validation

**Preconditions:**
- User is logged in as admin
- User is on the program creation form
- No program named `A` exists

**Steps:**
1. Enter `A` in Program Name
2. Enter `Single character name boundary test` in Description
3. Click `Create`

**Gherkin:**
```gherkin
Scenario: Single character program name is accepted
  Given I am on the program creation form
  When I fill in Program Name with "A"
  And I fill in Description with "Single character name boundary test"
  And I click Create
  Then the modal closes
  And the program list shows "A"
```

**Expected result:**
- Program is created unless a documented minimum length > 1 exists
- No false duplicate or whitespace validation error

**Priority:** Medium

---

### TC-015 — Program Name at maximum allowed length is accepted

**Title:** Name at documented max length succeeds; exceeding max is blocked

**Preconditions:**
- User is logged in as admin
- User is on the program creation form
- Documented max length for Program Name (assume 255 characters unless spec differs)

**Steps:**
1. Enter a 255-character string (e.g. `W` repeated 255 times) in Program Name
2. Enter `Boundary test at max length` in Description
3. Click `Create`
4. Repeat with a 256-character Program Name

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
- At max: created successfully (if within limit)
- Over max: submission blocked with clear validation; no silent truncation

**Priority:** Medium

---

### TC-016 — Duplicate detection is case-sensitive (or per documented rule)

**Title:** Program names differing only by letter case are handled per uniqueness rules

**Preconditions:**
- User is logged in as admin
- Program `Web Development 2026` already exists
- User is on the program creation form

**Steps:**
1. Enter `web development 2026` in Program Name
2. Enter `Lowercase duplicate test` in Description
3. Click `Create`
4. Document actual behavior

**Gherkin:**
```gherkin
Scenario: Case variant of existing program name
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "web development 2026"
  And I fill in Description with "Lowercase duplicate test"
  And I click Create
  Then either I see an error indicating the name already exists
  Or the program is created as a distinct entry per case-sensitive policy
```

**Expected result:**
- Behavior matches documented case-sensitivity rule
- No ambiguous silent duplicate if case-insensitive uniqueness is intended

**Priority:** Medium

---

### TC-017 — Internal multiple spaces in valid name are preserved

**Title:** Consecutive spaces within a valid name are not incorrectly collapsed unless specified

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Enter `Data  Science  2026` (double spaces between words) in Program Name
2. Enter `Internal spacing test` in Description
3. Click `Create`

**Gherkin:**
```gherkin
Scenario: Internal multiple spaces in program name
  Given I am on the program creation form
  When I fill in Program Name with "Data  Science  2026"
  And I fill in Description with "Internal spacing test"
  And I click Create
  Then the program is created successfully
  And the displayed name matches the stored normalization rules
```

**Expected result:**
- Program is created (internal spaces are valid content)
- Display/storage behavior is consistent (preserve or normalize per spec)

**Priority:** Low

---

### TC-018 — Rapid double-click on Create does not bypass duplicate validation

**Title:** Double submit does not create duplicate programs or bypass duplicate error

**Preconditions:**
- User is logged in as admin
- Program `Mobile App Development 2025` already exists
- User is on the program creation form

**Steps:**
1. Enter `Mobile App Development 2025` in Program Name
2. Enter `Duplicate double-click test` in Description
3. Double-click `Create` quickly
4. Inspect list and network requests if available

**Gherkin:**
```gherkin
Scenario: Double Create click on duplicate name
  Given a program "Mobile App Development 2025" already exists
  And I am on the program creation form
  When I fill in Program Name with "Mobile App Development 2025"
  And I fill in Description with "Duplicate double-click test"
  And I double-click Create
  Then I see an error indicating the name already exists
  And the program list contains only one "Mobile App Development 2025"
```

**Expected result:**
- At most one submit is processed
- No duplicate row created
- Duplicate error shown once (or idempotent handling)

**Priority:** Medium

---

### TC-019 — Special characters in name do not bypass duplicate check

**Title:** Duplicate detection applies to names with special characters

**Preconditions:**
- User is logged in as admin
- Program `Informatique & IA - Niveau 2` already exists
- User is on the program creation form

**Steps:**
1. Enter `Informatique & IA - Niveau 2` in Program Name
2. Enter `Duplicate special char test` in Description
3. Click `Create`

**Gherkin:**
```gherkin
Scenario: Duplicate name with special characters is rejected
  Given a program "Informatique & IA - Niveau 2" already exists
  And I am on the program creation form
  When I fill in Program Name with "Informatique & IA - Niveau 2"
  And I fill in Description with "Duplicate special char test"
  And I click Create
  Then I see an error indicating the name already exists
  And the program list contains only one "Informatique & IA - Niveau 2"
```

**Expected result:**
- Duplicate error is shown
- Special characters do not break uniqueness comparison

**Priority:** High

---

### TC-020 — Whitespace-only name with filled Description does not create a program

**Title:** Required-field validation on name cannot be bypassed via Description content

**Preconditions:**
- User is logged in as admin
- User is on the program creation form

**Steps:**
1. Enter `     ` in Program Name
2. Enter `Full-stack web development program` in Description
3. Click `Create`

**Gherkin:**
```gherkin
Scenario: Whitespace name with valid description is still rejected
  Given I am on the program creation form
  When I fill in Program Name with "     "
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the form is not submitted
  And no program is created
```

**Expected result:**
- Form is not submitted despite valid Description
- No program row appears using Description as a fallback identifier

**Priority:** High

---

## AC Coverage Matrix

| Acceptance Criteria | Test Case(s) |
|---------------------|--------------|
| Reject program name with only whitespace | TC-006, TC-013, TC-020 |
| Accept program name with special characters | TC-001, TC-004, TC-019 |
| Reject duplicate program name | TC-007, TC-009, TC-010, TC-011, TC-018, TC-019 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Whitespace-only UX** — AC says "I click Create" and "form is not submitted," but DS-1 FR-06 states `Create` is disabled when Program Name is empty. Unclear whether whitespace-only input disables `Create` proactively or allows click with submit-time validation.
2. **Exact duplicate error message** — AC requires "an error indicating the name already exists" but does not specify copy, placement (inline vs toast), or whether the modal stays open.
3. **Case sensitivity** — No rule for `Web Development 2026` vs `web development 2026`. TC-016 needs a product decision.
4. **Max length** — ACs do not define maximum Program Name length. TC-015 assumes 255 characters as a placeholder.
5. **Minimum length** — No minimum beyond "non-empty after trim." TC-014 assumes single character is valid.
6. **Trim scope** — AC confirms trim for whitespace-only rejection but does not explicitly require leading/trailing trim on valid names (TC-003, TC-010 infer it for duplicate logic).
7. **Internal whitespace normalization** — ACs silent on collapsing multiple internal spaces (TC-017).
8. **Description requiredness** — AC says "fill other required fields" but DS-1 treats Description as optional. Clarify whether Description is required for the special-character scenario.
9. **Duplicate scope on edit (DS-2)** — This feature's ACs cover create only. Rename-to-duplicate behavior on the edit form is out of scope here but may need aligned rules.
10. **Non-admin access** — ACs assume access to the creation form; admin-only restriction is implied (DS-1 FR-01) but not stated in these ACs.
11. **Allowed special character set** — AC gives one French example; unclear if all Unicode, emoji, quotes, or HTML-like input are in scope (TC-004, TC-005).
12. **Persistence after refresh** — ACs verify creation/list display in-session; no requirement to confirm duplicate prevention or trimmed storage after page reload.
13. **API/network failure during duplicate check** — No AC for server errors during uniqueness validation (distinct from duplicate rejection).
14. **Uniqueness scope** — Unclear whether names must be globally unique or unique per tenant/org/campus if multi-tenant.
