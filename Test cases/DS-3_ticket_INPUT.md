# DS-3 — Program Name Validation and Duplicate Prevention

## Ticket Summary

**Feature:** Program name validation and duplicate prevention  
**Role:** Admin  
**Entry point:** Programs page → `+ New Program`  
**Depends on:** DS-1 (Create New Academic Program)

---

## Acceptance Criteria

### Scenario: Reject program name with only whitespace

```gherkin
Given I am on the program creation form
When I enter "   " as the program name
And I click Create
Then the form is not submitted (name is trimmed, treated as empty)
```

### Scenario: Accept program name with special characters

```gherkin
Given I am on the program creation form
When I enter "Informatique & IA - Niveau 2" as the program name
And I fill other required fields
And I click Create
Then the program is created successfully
```

### Scenario: Reject duplicate program name

```gherkin
Given a program "Web Development 2026" already exists
When I try to create a new program with the same name
Then I see an error indicating the name already exists
```

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | Only logged-in admin users can access the Programs page and create programs |
| FR-02 | Program creation form includes **Program Name** and **Description** fields (see DS-1) |
| FR-03 | **Program Name** is trimmed before validation; whitespace-only values are treated as empty |
| FR-04 | Whitespace-only **Program Name** prevents form submission |
| FR-05 | **Program Name** may contain special characters (e.g. `&`, `-`, accented letters) |
| FR-06 | Valid **Program Name** with special characters creates a program successfully when no duplicate exists |
| FR-07 | **Program Name** must be unique; duplicate names are rejected on create |
| FR-08 | Duplicate rejection displays an error indicating the name already exists |
| FR-09 | Example existing program: Program Name = `Web Development 2026`, Description = `Full-stack web development program` |
| FR-10 | Example special-character name: Program Name = `Informatique & IA - Niveau 2` |

---

## Test Plan Requirements

- All test cases must be written in Gherkin
- Cover every acceptance criterion with at least one test case
- Add edge cases not mentioned in the ACs:
  - Boundary values
  - Empty inputs
  - Special characters
  - Duplicates
  - Max-length
- Add negative test cases (what should **not** happen)
- Structure each test case as:
  - **ID** (TC-001, TC-002, etc.)
  - **Title** (expected behavior, not action)
  - **Preconditions**
  - **Steps** (numbered)
  - **Expected result**
  - **Priority** (High / Medium / Low)
- Group by: **Positive flows**, **Negative flows**, **Edge cases**
- Use real field names and values, not placeholders

---

## Known UI Elements

| Element | Label / Text |
|---------|--------------|
| Page | Programs |
| Action button | + New Program |
| Field 1 | Program Name |
| Field 2 | Description |
| Submit button | Create |

---

## Out of Scope (Not in AC — clarify with product)

- Duplicate name policy on edit (see DS-2)
- Case sensitivity for duplicate detection (`Web Development 2026` vs `web development 2026`)
- Max length for Program Name and Description
- Minimum Program Name length beyond non-empty after trim
- Internal whitespace normalization (e.g. collapsing double spaces)
- Leading/trailing trim behavior on valid names (implied by duplicate/whitespace ACs)
- Description required vs optional
- Exact duplicate error message copy and placement (inline vs toast)
- Modal cancel / dismiss behavior
- Non-admin role restrictions (implied but not explicit)
- Success toast / confirmation message
- Error handling on API/network failure during duplicate check
- XSS / input sanitization
- Double-submit / loading state
- Uniqueness scope (global vs per tenant/org)
- Persistence verification after page refresh
