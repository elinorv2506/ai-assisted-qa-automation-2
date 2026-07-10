Feature: Edit existing program details
  DS-2 — Admin edits a program from the Programs page via the edit icon on a program row

  # Happy paths

  @TC-001 @AC-OpenForEditing
  Scenario: Open program for editing
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Development 2026" exists with Description "Full-stack web development program"
    When I click the edit icon on "Web Development 2026"
    Then I see the edit form pre-populated with Program Name "Web Development 2026"
    And I see the edit form pre-populated with Description "Full-stack web development program"

  @TC-002 @AC-SuccessfulEditName
  Scenario: Successfully edit a program name
    Given I am logged in as admin
    And I am editing "Web Development 2026"
    When I change the Program Name to "Web Development 2026 - Updated"
    And I click Save
    Then the modal closes
    And the program list immediately shows "Web Development 2026 - Updated"
    And the program list does not show "Web Development 2026"

  @TC-003 @AC-PreservesUnchanged
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

  @TC-004
  Scenario: Edit both program name and description
    Given I am logged in as admin
    And I am editing "Mobile App Development 2025"
    When I change the Program Name to "Mobile App Development 2025 - Revised"
    And I change the Description to "Cross-platform mobile development with React Native"
    And I click Save
    Then the modal closes
    And the program list shows "Mobile App Development 2025 - Revised"
    And the program Description is "Cross-platform mobile development with React Native"

  @TC-005
  Scenario: Save without changes keeps program data intact
    Given I am logged in as admin
    And I am editing "Data Science Fundamentals"
    And the program Description is "Introductory statistics and Python"
    When I click Save without changing any fields
    Then the modal closes
    And the program list shows "Data Science Fundamentals"
    And the program Description remains "Introductory statistics and Python"

  @TC-006
  Scenario: Edit affects only the selected program
    Given I am logged in as admin
    And the Programs page shows "Web Development 2026" and "Cloud Engineering 2026"
    And I am editing "Web Development 2026"
    When I change the Description to "Modern full-stack curriculum"
    And I click Save
    Then the program list shows "Cloud Engineering 2026" unchanged
    And only "Web Development 2026" has the updated Description

  # Negative

  @TC-007
  Scenario: Validation prevents empty program name on edit
    Given I am editing "Web Development 2026"
    When I clear the Program Name field
    Then the Save button is disabled
    And the program is not updated
    And the modal remains open

  @TC-008
  Scenario: Whitespace-only program name is rejected on edit
    Given I am editing "Cybersecurity 2026"
    When I change the Program Name to "   "
    Then the Save button is disabled
    And the program list still shows "Cybersecurity 2026"

  @TC-009
  Scenario: Cancel edit does not persist changes
    Given I am editing "UX Design 2026"
    And the program Description is "Human-centered design principles"
    When I change the Program Name to "UX Design 2026 - Draft"
    And I change the Description to "Should not be saved"
    And I close the modal without clicking Save
    Then the modal closes
    And the program list shows "UX Design 2026"
    And the program Description is "Human-centered design principles"

  @TC-010
  Scenario: Viewer cannot edit programs
    Given I am logged in as viewer
    And I am on the Programs page
    And a program "Web Development 2026" exists
    Then I do not see an edit button on "Web Development 2026"
    And I cannot access the Edit Program modal

  @TC-011
  Scenario: Duplicate program name on edit is handled
    Given I am editing "Beta Program"
    And a program "Alpha Program" already exists
    When I change the Program Name to "Alpha Program"
    And I click Save
    Then the system shows a validation or error message
    And "Beta Program" is not renamed

  @TC-012
  Scenario: Save failure does not corrupt program list
    Given I am editing "Web Development 2026"
    And the save API is unavailable
    When I change the Program Name to "Web Development 2026 - Updated"
    And I click Save
    Then an error message is shown
    And the program list still shows "Web Development 2026"
    And the modal remains open with my entered values

  @TC-013
  Scenario: Double Save does not cause duplicate updates
    Given I am editing "Web Development 2026"
    When I change the Description to "Updated description"
    And I double-click Save
    Then the modal closes once
    And exactly one program named "Web Development 2026" exists in the list
    And the Description is "Updated description"

  # Edge cases

  @TC-014
  Scenario: Program name at maximum allowed length is saved
    Given I am editing a test program
    And the maximum Program Name length is 255 characters
    When I change the Program Name to a 255-character valid name
    And I click Save
    Then the modal closes
    And the program list shows the full 255-character name without truncation errors

  @TC-015
  Scenario: Program name exceeding maximum length is rejected
    Given I am editing a test program
    And the maximum Program Name length is 255 characters
    When I change the Program Name to a 256-character string
    Then the Save button is disabled or a max-length validation error is shown
    And the program is not updated

  @TC-016
  Scenario: Description at maximum allowed length is saved
    Given I am editing "Web Development 2026"
    And the maximum Description length is 2000 characters
    When I change the Description to a 2000-character string
    And I click Save
    Then the program Description is stored as the full 2000-character string

  @TC-017
  Scenario: Description exceeding maximum length is rejected on edit
    Given I am editing a test program
    And the maximum Description length is 2000 characters
    When I change the Description to a 2001-character string
    Then the Save button is disabled or a max-length validation error is shown
    And the program is not updated

  @TC-018
  Scenario: Special characters in program fields are preserved
    Given I am editing "Web Development 2026"
    When I change the Program Name to "C++ & C# Development (2026)"
    And I change the Description to "Covers O'Reilly-style topics: <tags>, \"quotes\", & ampersands"
    And I click Save
    Then the program list shows "C++ & C# Development (2026)"
    And the Description is displayed as entered without HTML injection

  @TC-019
  Scenario: Unicode characters in program fields are preserved
    Given I am editing "Web Development 2026"
    When I change the Program Name to "Développement Web 2026 🎓"
    And I change the Description to "Programme bilingue — français/English"
    And I click Save
    Then the program list shows "Développement Web 2026 🎓"
    And the Description matches the entered Unicode text

  @TC-020
  Scenario: Leading and trailing whitespace in program name is normalized
    Given I am editing "Web Development 2026"
    When I change the Program Name to "  Web Development 2026  "
    And I click Save
    Then the program list shows "Web Development 2026" without leading or trailing spaces
    And no duplicate program is created

  @TC-021
  Scenario: Description can be cleared on edit
    Given I am editing "Web Development 2026"
    And the Description is "Full-stack web development program"
    When I clear the Description field
    And I click Save
    Then the modal closes
    And the program list shows "Web Development 2026"
    And the Description is empty

  @TC-022
  Scenario: Single-character program name is accepted
    Given I am editing "QA Boundary Test Program"
    When I change the Program Name to "X"
    And I click Save
    Then the modal closes
    And the program list shows "X"

  @TC-023
  Scenario: No edit actions when program list is empty
    Given I am logged in as admin
    And I am on the Programs page
    And no programs exist
    Then I do not see any edit icons
    And I cannot open a program edit form

  @TC-024
  Scenario: HTML injection in description is sanitized on edit
    Given I am editing "Secure Coding 2026"
    When I change the Description to "<script>alert('xss')</script>"
    And I click Save
    Then the modal closes
    And no script is executed on the Programs page
    And the description is displayed as plain text or safely rendered

  @TC-025
  Scenario: Edit form shows AI Generation Config
    Given I am logged in as admin
    And I am on the Programs page
    When I open the edit form for an existing program
    Then I see the "Show AI Generation Config" section
    And I see Total Program Hours, Default Session Hours, and Default Exam Hours fields
    And I see Target Audience and Focus Areas fields
    And I see the Sync/Async Ratio slider

  @TC-026
  Scenario: Edit button opens modal without row navigation side effect
    Given I am logged in as admin
    And I am on the Programs page
    When I click the edit button on a program row
    Then the Edit Program modal opens
    And the edit action does not cause unexpected page navigation

  @TC-027
  Scenario: X close button discards edit changes
    Given I am editing a program
    When I change fields and click the modal X close button
    Then the Edit Program modal closes
    And the program list shows the original program data

  @TC-028
  Scenario: Concurrent edits handle conflict appropriately
    Given admin A and admin B are both editing "Web Development 2026"
    When admin A saves Description "Version A curriculum"
    And admin B saves Description "Version B curriculum"
    Then the system applies a defined conflict policy
    And the final Description matches the expected winner or shows a conflict error

  # Ambiguities and gaps
  # - Program Name validation on edit (empty/whitespace) — observed: Save disabled (TC-007, TC-008); not explicit in Jira AC
  # - Description required vs optional on edit — observed: optional; empty Description allows Save (TC-021)
  # - Max length for Program Name and Description — assumed 255/2000 per DS-1 parity; edit UI may not enforce (TC-015, TC-017)
  # - Duplicate program name policy when renaming — business rule unclear; tests assert rejection (TC-011)
  # - Whitespace trimming rules — not specified in AC; should match create flow (TC-020)
  # - Modal cancel / dismiss behavior — Cancel and banner X available (TC-009, TC-027); Esc not specified
  # - Non-admin role restrictions — Confluence: Admin + Editor can edit; Viewer read-only (TC-010)
  # - Success toast / confirmation message — not observed after save
  # - Error handling on API/network failure — not in AC (TC-012)
  # - XSS / input sanitization — not in AC (TC-024)
  # - Double-submit / loading state during Save — not in AC (TC-013)
  # - Concurrent edit by multiple admins — not in AC (TC-028)
  # - Additional read-only fields on edit form (ID, created date, status) — not visible in UI
  # - AI Generation Config fields present on edit but not in Jira AC (TC-025)
  # - List sort order after edit — not specified
  # - Persistence verification after page refresh — recommended follow-up, not in AC
