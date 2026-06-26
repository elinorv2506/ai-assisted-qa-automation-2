# TodoMVC — Test Plan

**Feature:** Todo list management  
**Application under test:** https://demo.playwright.dev/todomvc/  
**Primary UI elements:** `What needs to be done?` input, todo list items, item checkbox, delete control (`×`), footer item count, filter links (`All`, `Active`, `Completed`)

---

## Positive Flows

### TC-001 — Single todo appears in the list after submission

**Title:** Entering text in `What needs to be done?` and pressing Enter adds one item to the todo list

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list is empty (no items visible)

**Steps:**
1. Click the `What needs to be done?` input field
2. Type `Buy milk`
3. Press Enter

**Expected result:**
- One todo item labeled `Buy milk` appears in the list
- The item is shown as active (not completed/strikethrough)
- Footer displays `1 item left`
- The `What needs to be done?` input is cleared and ready for another entry

---

### TC-002 — Multiple todos can be added sequentially

**Title:** Each submitted entry is appended to the list in order

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list is empty

**Steps:**
1. Type `Buy milk` in `What needs to be done?` and press Enter
2. Type `Walk the dog` in `What needs to be done?` and press Enter
3. Type `Pay electric bill` in `What needs to be done?` and press Enter

**Expected result:**
- The list shows three items in order: `Buy milk`, `Walk the dog`, `Pay electric bill`
- Footer displays `3 items left`
- All three items are active (unchecked)

---

### TC-003 — Todo item is marked completed when its checkbox is checked

**Title:** Checking an item's checkbox marks it as completed

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list contains one active item: `Buy milk`

**Steps:**
1. Click the checkbox to the left of `Buy milk`

**Expected result:**
- `Buy milk` is visually marked as completed (strikethrough / completed styling)
- Footer displays `0 items left`
- The item remains in the list (not removed)

---

### TC-004 — Completed todo can be toggled back to active

**Title:** Unchecking a completed item's checkbox restores it to active state

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list contains one completed item: `Buy milk`

**Steps:**
1. Click the checkbox to the left of completed `Buy milk`

**Expected result:**
- `Buy milk` is no longer styled as completed
- Footer displays `1 item left`
- Item text remains `Buy milk`

---

### TC-005 — Only the selected item is completed when multiple todos exist

**Title:** Completing one item does not affect other active items

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list contains three active items: `Buy milk`, `Walk the dog`, `Pay electric bill`

**Steps:**
1. Click the checkbox next to `Walk the dog`

**Expected result:**
- Only `Walk the dog` is marked completed
- `Buy milk` and `Pay electric bill` remain active
- Footer displays `2 items left`

---

### TC-006 — Active todo is removed from the list when deleted

**Title:** Using the delete control removes an active item from the list

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list contains two active items: `Buy milk`, `Walk the dog`

**Steps:**
1. Hover over the `Buy milk` row to reveal the delete control (`×`)
2. Click the delete control (`×`) on `Buy milk`

**Expected result:**
- `Buy milk` is no longer visible in the list
- `Walk the dog` remains in the list as active
- Footer displays `1 item left`

---

### TC-007 — Completed todo is removed from the list when deleted

**Title:** Using the delete control removes a completed item from the list

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list contains one completed item: `Buy milk`

**Steps:**
1. Hover over the completed `Buy milk` row
2. Click the delete control (`×`)

**Expected result:**
- `Buy milk` is no longer visible in the list
- Footer and filter controls are hidden (empty list state)
- `What needs to be done?` input remains visible

---

### TC-008 — Last remaining todo can be deleted to return to empty state

**Title:** Deleting the only item clears the list and hides footer controls

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list contains one active item: `Buy milk`

**Steps:**
1. Hover over `Buy milk`
2. Click the delete control (`×`)

**Expected result:**
- No todo items are visible
- Footer (item count and filters) is not shown
- Page title/header still shows `todos`
- User can add a new item via `What needs to be done?`

---

## Negative Flows

### TC-009 — Empty submission does not create a todo

**Title:** Pressing Enter with no text in `What needs to be done?` does not add an item

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list is empty

**Steps:**
1. Click `What needs to be done?`
2. Press Enter without typing any text

**Expected result:**
- No todo item is added
- Footer remains hidden
- Input stays focused and empty

---

### TC-010 — Whitespace-only submission does not create a todo

**Title:** Submitting only spaces in `What needs to be done?` does not add an item

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list is empty

**Steps:**
1. Click `What needs to be done?`
2. Type three spaces (`   `)
3. Press Enter

**Expected result:**
- No todo item is added
- List remains empty
- Footer remains hidden

---

### TC-011 — Completing a todo does not remove it from the list

**Title:** Marking an item complete must not delete it

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list contains one active item: `Buy milk`

**Steps:**
1. Click the checkbox next to `Buy milk`
2. Observe the list

**Expected result:**
- `Buy milk` remains visible in the list as a completed item
- Item is not removed unless delete is explicitly used

---

### TC-012 — Deleting a todo does not mark sibling items as completed

**Title:** Removing one item must not change completion state of remaining items

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list contains `Buy milk` (active) and `Walk the dog` (completed)

**Steps:**
1. Hover over `Buy milk`
2. Click delete (`×`) on `Buy milk`
3. Observe `Walk the dog`

**Expected result:**
- `Buy milk` is removed
- `Walk the dog` remains completed
- Footer shows `0 items left` (one completed item remains)

---

### TC-013 — Adding a todo does not auto-complete it

**Title:** Newly added items must start in active (unchecked) state

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list is empty

**Steps:**
1. Type `Buy milk` and press Enter
2. Observe checkbox state and item styling

**Expected result:**
- `Buy milk` checkbox is unchecked
- Item is not styled as completed
- Footer shows `1 item left`

---

### TC-014 — Blurring the input without Enter does not create a todo

**Title:** Typing text and clicking away without submitting does not add an item

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list is empty

**Steps:**
1. Click `What needs to be done?`
2. Type `Buy milk`
3. Click the page header (`todos`) without pressing Enter

**Expected result:**
- No todo item is added to the list
- Footer remains hidden
- Text in `What needs to be done?` may remain or clear per app behavior; list must stay empty

---

## Edge Cases

### TC-015 — Duplicate todo text is allowed as separate entries

**Title:** Two items with identical text `Buy milk` both appear as distinct list entries

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list is empty

**Steps:**
1. Type `Buy milk` and press Enter
2. Type `Buy milk` and press Enter

**Expected result:**
- List shows two separate `Buy milk` entries
- Footer displays `2 items left`
- Completing or deleting one entry does not automatically affect the other

---

### TC-016 — Todo with special characters is stored and displayed correctly

**Title:** Text containing symbols and punctuation is preserved in the list

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list is empty

**Steps:**
1. Type `Pay rent: $1,200 (due 6/30!)` in `What needs to be done?`
2. Press Enter

**Expected result:**
- One item appears with exact text `Pay rent: $1,200 (due 6/30!)`
- Item can be completed and deleted without corruption of displayed text

---

### TC-017 — Todo with leading and trailing spaces is trimmed or preserved consistently

**Title:** Submission with padded text behaves consistently (trim on save or exact display)

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list is empty

**Steps:**
1. Type `  Buy milk  ` (leading and trailing spaces)
2. Press Enter
3. Observe displayed item text

**Expected result:**
- Either the item displays as `Buy milk` (trimmed) or `  Buy milk  ` (exact)—behavior is consistent
- Exactly one item is added
- No blank or whitespace-only duplicate entries appear

---

### TC-018 — Very long todo text is accepted and displayed

**Title:** A long single-line todo (200 characters) can be added, completed, and deleted

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list is empty

**Steps:**
1. Type a 200-character string: `Plan quarterly roadmap review meeting with engineering design product and leadership teams to align on priorities dependencies resourcing risks and milestone dates for Q3 deliverables including migration cutover`
2. Press Enter
3. Complete the item via checkbox
4. Delete the item via `×`

**Expected result:**
- Full text is stored and visible (may wrap visually in UI)
- Item can be marked completed and removed without error
- No truncation that prevents identifying the item in the list

---

### TC-019 — Unicode and emoji characters are supported in todo text

**Title:** Non-ASCII characters render correctly in added todos

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list is empty

**Steps:**
1. Type `Buy café supplies ☕ 日本語`
2. Press Enter

**Expected result:**
- Item displays exactly as `Buy café supplies ☕ 日本語`
- Item can be completed and deleted successfully

---

### TC-020 — Rapid sequential additions create distinct items

**Title:** Quickly adding multiple todos does not drop or merge entries

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list is empty

**Steps:**
1. Quickly type and submit five items in succession: `Task 1`, `Task 2`, `Task 3`, `Task 4`, `Task 5` (Enter after each)

**Expected result:**
- All five items appear in the list in submission order
- Footer displays `5 items left`

---

### TC-021 — Item count updates correctly after mixed complete and delete actions

**Title:** Footer count reflects active items after complete and delete operations

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list contains `Buy milk`, `Walk the dog`, `Pay electric bill` (all active)

**Steps:**
1. Complete `Walk the dog`
2. Delete `Buy milk`
3. Observe footer count

**Expected result:**
- Footer displays `1 item left` (only `Pay electric bill` is active)
- Completed `Walk the dog` remains until explicitly deleted or cleared

---

### TC-022 — Page refresh persists todos (local storage behavior)

**Title:** Added todos survive browser refresh on the demo app

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/
- Todo list contains `Buy milk` (active) and `Walk the dog` (completed)

**Steps:**
1. Refresh the page (F5 or browser reload)
2. Observe the todo list and item states

**Expected result:**
- Both items reappear with prior text and completion states preserved
- Footer count matches persisted active items

---

## Ambiguities and Gaps in Acceptance Criteria

1. **Submission method not specified** — AC says "add a todo" but does not define whether Enter is required, or if blur/submit button exists. TodoMVC uses Enter-only submission; blur behavior should be confirmed (TC-014).

2. **Whitespace handling undefined** — No AC states whether leading/trailing spaces are trimmed, or whether whitespace-only input is rejected (TC-009, TC-010, TC-017).

3. **Duplicate items not addressed** — AC does not say whether identical todo text should create one entry or multiple; TodoMVC allows duplicates (TC-015).

4. **Complete vs. delete interaction unclear** — AC treats complete and delete separately but does not specify whether completed items remain in the list, appear in filters, or can be bulk-cleared (`Clear completed` control exists in TodoMVC but is out of AC scope).

5. **Persistence not in AC** — ACs do not require data to survive refresh; TodoMVC demo uses local storage (TC-022 is recommended but not AC-mandatory).

6. **Delete affordance not specified** — AC says "delete item" but not how (hover `×`, keyboard, swipe, etc.). Plan assumes standard TodoMVC destroy button on hover.

7. **Max length not defined** — No AC limits todo text length; acceptable maximum and overflow display are unspecified (TC-018).

8. **Empty list UX not covered** — ACs do not define expected UI when all items are deleted (footer visibility, filter links).

9. **Accessibility / keyboard-only flows omitted** — ACs do not require keyboard navigation for add, complete, or delete; additional cases may be needed for a11y compliance.

10. **Filter views out of scope** — TodoMVC includes `All`, `Active`, and `Completed` filters and `Clear completed`; these are not in ACs and are excluded from mandatory coverage unless scope expands.
