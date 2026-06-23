# DS-2 — Edit Existing Program Details

## Ticket Summary

**Feature:** Edit existing program details  
**Role:** Admin  
**Entry point:** Programs page → edit icon on a program row

---

## Acceptance Criteria

### Scenario: Open program for editing

```gherkin
Given I am on the Programs page
And a program "Web Development 2026" exists
When I click the edit icon on "Web Development 2026"
Then I see the edit form pre-populated with the program's current data
```

### Scenario: Successfully edit a program name

```gherkin
Given I am editing "Web Development 2026"
When I change the Name to "Web Development 2026 - Updated"
And I click Save
Then the modal closes
And the program list immediately shows "Web Development 2026 - Updated"
```

### Scenario: Edit preserves unchanged fields

```gherkin
Given I am editing a program
When I only change the Description
And I click Save
Then the Name and other fields remain unchanged
```

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | Only logged-in admin users can access the Programs page and edit programs |
| FR-02 | Each program row on the Programs page exposes an **edit icon** that opens an edit form (modal) |
| FR-03 | Edit form includes **Program Name** and **Description** fields |
| FR-04 | Edit form is **pre-populated** with the selected program's current Program Name and Description |
| FR-05 | Form includes a **Save** button to submit changes |
| FR-06 | On successful save, the modal closes and the program list **immediately** reflects the updated data |
| FR-07 | When only some fields are changed, **unchanged fields retain their original values** |
| FR-08 | Example program: Program Name = `Web Development 2026`, Description = `Full-stack web development program` |

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
| Action (per row) | Edit icon |
| Field 1 | Program Name |
| Field 2 | Description |
| Submit button | Save |

---

## Out of Scope (Not in AC — clarify with product)

- Program Name validation on edit (empty name, whitespace-only)
- Description required vs optional on edit
- Max length for Program Name and Description
- Duplicate program name policy when renaming
- Whitespace trimming rules
- Modal cancel / dismiss behavior
- Non-admin role restrictions (implied but not explicit)
- Success toast / confirmation message
- Error handling on API/network failure
- XSS / input sanitization
- Double-submit / loading state during Save
- Concurrent edit by multiple admins
- Additional read-only fields on edit form (ID, created date, status)
- List sort order after edit
- Persistence verification after page refresh
