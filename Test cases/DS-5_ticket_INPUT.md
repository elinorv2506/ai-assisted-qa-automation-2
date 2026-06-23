# DS-5 — Program List Filtering and Display

## Ticket Summary

**Feature:** Program list filtering and display  
**Role:** Admin  
**Entry point:** Programs page (navigation menu or direct URL)  
**Depends on:** DS-1 (Create New Academic Program), DS-2 (Edit Existing Program Details), DS-3 (Program Name Validation and Duplicate Prevention), DS-4 (Delete Program with Confirmation)

---

## Acceptance Criteria

### Scenario: Display program list with key details

```gherkin
Given programs exist in the system
When I navigate to the Programs page
Then I see a list showing each program's name and description
```

### Scenario: Empty state when no programs exist

```gherkin
Given no programs exist
When I navigate to the Programs page
Then I see a message indicating no programs have been created
And I see a prompt to create the first program
```

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | Only logged-in admin users can access the Programs page and view the program list |
| FR-02 | The Programs page displays a **program list** when one or more programs exist |
| FR-03 | Each program row shows **Program Name** and **Description** (see DS-1 list columns) |
| FR-04 | When no programs exist, the Programs page shows an **empty state** instead of a data list |
| FR-05 | Empty state includes a message indicating **no programs have been created** |
| FR-06 | Empty state includes a **prompt to create the first program** (e.g. `+ New Program` or equivalent CTA) |
| FR-07 | The **`+ New Program`** action remains available on the Programs page (populated and empty states) |
| FR-08 | Example program: Program Name = `Web Development 2026`, Description = `Full-stack web development program` |
| FR-09 | Example sibling program: Program Name = `Cloud Engineering 2026`, Description = `AWS and Azure fundamentals` |
| FR-10 | Example empty-description program: Program Name = `Data Science Fundamentals`, Description = empty (optional field per DS-1) |

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
| List columns | Program Name, Description (see DS-1) |
| Action (per row) | Edit icon (DS-2) |
| Action (per row) | Delete icon (DS-4) |
| Create action | + New Program (DS-1) |
| Create form fields | Program Name, Description |
| Create submit | Create |
| Empty state | Message indicating no programs have been created |
| Empty state CTA | Prompt to create the first program (e.g. `+ New Program`) |

---

## Out of Scope (Not in AC — clarify with product)

- **Filtering / search / sort** — Feature title mentions “filtering” but ACs only cover list display and empty state; no filter controls, search box, or sort order specified
- Exact empty-state message and CTA copy
- List layout (table vs cards) and column header labels
- Pagination, virtual scroll, and maximum visible row count
- Loading skeleton / spinner while programs load
- Error state when list API fails (vs genuine empty state)
- Non-admin role restrictions (implied by DS-1 but not explicit in these ACs)
- Persistence verification after page refresh
- List update behavior after create, edit, or delete (covered in DS-1–DS-4 but not in these ACs)
- Truncation / tooltip UX for long Program Name or Description
- Accessibility (screen reader labels, keyboard navigation for list and empty state)
- Internationalization of empty-state strings and RTL layout
- XSS / sanitization in list display for Description
- Duplicate Program Name display (DS-3 enforces uniqueness on create)
