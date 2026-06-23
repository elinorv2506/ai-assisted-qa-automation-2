# DS-4 — Delete Program with Confirmation

## Ticket Summary

**Feature:** Delete program with confirmation  
**Role:** Admin  
**Entry point:** Programs page → delete icon on a program row  
**Depends on:** DS-1 (Create New Academic Program), DS-2 (Edit Existing Program Details), DS-3 (Program Name Validation and Duplicate Prevention)

---

## Acceptance Criteria

### Scenario: Delete program with confirmation

```gherkin
Given a program "Test Program" exists
When I click the delete icon for "Test Program"
Then I see a confirmation dialog
When I confirm deletion
Then "Test Program" is removed from the program list
```

### Scenario: Cancel program deletion

```gherkin
Given I click the delete icon for a program
When I see the confirmation dialog
And I click Cancel
Then the program still exists in the list
```

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | Only logged-in admin users can access the Programs page and delete programs |
| FR-02 | Each program row on the Programs page exposes a **delete icon** that initiates deletion |
| FR-03 | Clicking the delete icon opens a **confirmation dialog** before any program is removed |
| FR-04 | The program remains in the list while the confirmation dialog is open (no immediate deletion) |
| FR-05 | Confirmation dialog includes a destructive confirm action and a **Cancel** action |
| FR-06 | Confirming deletion removes the selected program from the program list **immediately** |
| FR-07 | Clicking **Cancel** closes the dialog without deleting; the program remains in the list |
| FR-08 | Deleting a program affects only the selected program; other programs in the list are unchanged |
| FR-09 | Example program for deletion: Program Name = `Test Program`, Description = `Sample program for deletion testing` |
| FR-10 | Example sibling program: Program Name = `Web Development 2026`, Description = `Full-stack web development program` |

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
| Action (per row) | Delete icon |
| Action (per row) | Edit icon |
| List columns | Program Name, Description (see DS-1) |
| Confirmation dialog | Modal overlay with confirm and cancel actions |
| Confirm button | Delete (destructive confirm — confirm label with product) |
| Cancel button | Cancel |
| Create action | + New Program (DS-1) |
| Create form fields | Program Name, Description |
| Create submit | Create |

---

## Out of Scope (Not in AC — clarify with product)

- Exact confirmation dialog title, body copy, and whether Program Name appears in the message
- Confirm button label (`Delete` vs `Confirm` vs `Yes`)
- Success toast / confirmation message after successful delete
- Persistence verification after page refresh
- Empty list state when the last program is deleted
- Non-admin role restrictions (implied but not explicit)
- Error handling on API/network failure during delete
- Soft delete vs hard delete / archive / recovery
- Cascade delete of linked courses, enrollments, or other dependent data
- Modal dismiss via Escape key, overlay click, or close (X) button
- Double-submit / loading state while delete request is in flight
- Concurrent modals (delete while create or edit modal is open)
- List sort order after deletion
- Whether a deleted Program Name can be reused on create (see DS-3 duplicate rules)
- Accessibility (keyboard navigation, focus trap, screen reader)
- Audit log / activity history for deletions
- XSS / sanitization in confirmation dialog when Program Name contains special characters
