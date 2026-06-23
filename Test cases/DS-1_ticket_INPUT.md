# DS-1 — Create New Academic Program

## Ticket Summary

**Feature:** Create new academic program  
**Role:** Admin  
**Entry point:** Programs page → `+ New Program`

---

## Acceptance Criteria

### Scenario: Navigate to program creation form

```gherkin
Given I am logged in as admin
When I navigate to the Programs page
And I click "+ New Program"
Then I see the program creation form with fields: Program Name, Description
```

### Scenario: Successfully create a program

```gherkin
Given I am on the program creation form
When I fill in Program Name with "Web Development 2026"
And I fill in Description with "Full-stack web development program"
And I click Create
Then the modal closes
And the program list shows "Web Development 2026"
```

### Scenario: Validation prevents empty program name

```gherkin
Given I am on the program creation form
When I leave the Program Name field empty
Then the Create button is disabled
```

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | Only logged-in admin users can access the Programs page and create programs |
| FR-02 | Programs page exposes a `+ New Program` action that opens a program creation form (modal) |
| FR-03 | Program creation form includes **Program Name** and **Description** fields |
| FR-04 | Form includes a **Create** button to submit the new program |
| FR-05 | On successful create, the modal closes and the new program appears in the program list |
| FR-06 | **Program Name** is required; when empty, the **Create** button is disabled |
| FR-07 | Example valid input: Program Name = `Web Development 2026`, Description = `Full-stack web development program` |

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

- Description required vs optional
- Max length for Program Name and Description
- Duplicate program name policy
- Whitespace trimming rules
- Modal cancel / dismiss behavior
- Non-admin role restrictions (implied but not explicit)
- List sort order after creation
- Success toast / confirmation message
- Error handling on API/network failure
- XSS / input sanitization
- Double-submit / loading state
