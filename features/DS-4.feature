Feature: Delete program with confirmation
  DS-4 — Admin deletes a program from the Programs page with a confirmation dialog

  # Happy paths

  @TC-001 @AC-DeleteWithConfirmation
  Scenario: Delete program with confirmation — dialog appears
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists with Description "Sample program for deletion testing"
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
    And "Test Program" is still visible in the program list

  @TC-002 @AC-DeleteWithConfirmation
  Scenario: Delete program with confirmation — successful deletion
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists with Description "Sample program for deletion testing"
    When I click the delete icon for "Test Program"
    And I see a confirmation dialog
    And I confirm deletion
    Then "Test Program" is removed from the program list

  @TC-003 @AC-CancelDeletion
  Scenario: Cancel program deletion
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Development 2026" exists with Description "Full-stack web development program"
    When I click the delete icon for "Web Development 2026"
    And I see the confirmation dialog
    And I click Cancel
    Then "Web Development 2026" still exists in the program list
    And the program Description is "Full-stack web development program"

  @TC-004
  Scenario: Confirmation dialog shows target program name
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Informatique & IA - Niveau 2" exists with Description "Programme avancé en informatique et intelligence artificielle"
    When I click the delete icon for "Informatique & IA - Niveau 2"
    Then I see a confirmation dialog
    And the dialog text references "Informatique & IA - Niveau 2"

  @TC-005
  Scenario: Delete affects only the selected program
    Given I am logged in as admin
    And I am on the Programs page
    And programs "Test Program", "Web Development 2026", and "Cloud Engineering 2026" exist
    When I click the delete icon for "Test Program"
    And I confirm deletion
    Then "Test Program" is removed from the program list
    And "Web Development 2026" remains in the program list
    And "Cloud Engineering 2026" remains in the program list

  @TC-006
  Scenario: Deleted program stays removed after refresh
    Given I am logged in as admin
    And I have deleted the program "Test Program"
    When I refresh the Programs page
    Then "Test Program" is not in the program list

  @TC-007
  Scenario: Delete program with special characters in name
    Given I am logged in as admin
    And I am on the Programs page
    And a program "C++ & C# Dev (2026) — \"Advanced\"" exists with Description "Covers C++, C#, and related tooling"
    When I click the delete icon for "C++ & C# Dev (2026) — \"Advanced\""
    And I confirm deletion
    Then the program is removed from the program list

  @TC-008
  Scenario: Recreate program after deletion
    Given I am logged in as admin
    And the program "Web Development 2026" was previously deleted
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the program list shows "Web Development 2026"

  # Negative

  @TC-009
  Scenario: No deletion without explicit confirmation
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Cloud Engineering 2026" exists
    When I click the delete icon for "Cloud Engineering 2026"
    And I do not confirm deletion
    Then "Cloud Engineering 2026" is still in the program list

  @TC-010
  Scenario: Multiple cancel actions do not delete
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I click Cancel
    And I click the delete icon for "Test Program" again
    And I click Cancel
    Then "Test Program" still exists in the program list

  @TC-011
  Scenario: Edit does not trigger delete
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Development 2026" exists
    When I click the edit icon on "Web Development 2026"
    Then I see the edit form for "Web Development 2026"
    And I do not see a delete confirmation dialog
    And "Web Development 2026" remains in the program list

  @TC-012
  Scenario: Delete confirmation targets the clicked row only
    Given I am logged in as admin
    And I am on the Programs page
    And programs "Test Program" and "Web Development 2026" exist
    When I click the delete icon for "Test Program"
    And I confirm deletion
    Then "Test Program" is removed from the program list
    And "Web Development 2026" is not removed from the program list

  @TC-013
  Scenario: Failed delete preserves program in list
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    And the delete API will fail
    When I click the delete icon for "Test Program"
    And I confirm deletion
    Then I see an error indicating deletion failed
    And "Test Program" remains in the program list

  @TC-014
  Scenario: Non-admin cannot delete programs
    Given I am logged in as instructor
    And a program "Test Program" exists
    When I view the Programs page
    Then I do not see a delete icon for "Test Program"
    And I cannot complete program deletion

  # Edge cases

  @TC-015
  Scenario: Delete the only program in the list
    Given I am logged in as admin
    And I am on the Programs page
    And only the program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I confirm deletion
    Then "Test Program" is removed from the program list
    And the Programs page shows an empty state or zero programs

  @TC-016
  Scenario: Delete program with max-length name
    Given I am logged in as admin
    And I am on the Programs page
    And a program with a 255-character Program Name exists
    When I click the delete icon for that program
    And I confirm deletion
    Then that program is removed from the program list

  @TC-017
  Scenario: Delete program with single-character name
    Given I am logged in as admin
    And I am on the Programs page
    And a program "X" exists with Description "Single character name"
    When I click the delete icon for "X"
    And I confirm deletion
    Then "X" is removed from the program list

  @TC-018
  Scenario: Delete program with Unicode and emoji name
    Given I am logged in as admin
    And I am on the Programs page
    And a program "日本語プログラム 🎓" exists with Description "Unicode and emoji test"
    When I click the delete icon for "日本語プログラム 🎓"
    And I confirm deletion
    Then "日本語プログラム 🎓" is removed from the program list

  @TC-019
  Scenario: Double-click confirm does not break delete flow
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    And the delete confirmation dialog is open for "Test Program"
    When I double-click Delete
    Then "Test Program" is removed from the program list
    And no duplicate-delete error is shown to the user

  @TC-020
  Scenario: Double-click delete icon opens single dialog
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Development 2026" exists
    When I double-click the delete icon for "Web Development 2026"
    Then I see exactly one confirmation dialog
    And "Web Development 2026" remains in the program list

  @TC-021
  Scenario: Delete while edit modal is open
    Given I am logged in as admin
    And I am editing "Web Development 2026"
    When I attempt to delete a program
    Then either the edit modal blocks delete until closed
    Or delete confirmation replaces edit modal without deleting unintentionally
    And "Web Development 2026" remains in the list unless explicitly confirmed deleted

  @TC-022
  Scenario: Delete program with long description
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Long Description Program" with a 2000-character Description exists
    When I click the delete icon for "Long Description Program"
    And I confirm deletion
    Then "Long Description Program" is removed from the program list

  @TC-023
  Scenario: Dismiss dialog without confirming does not delete
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    And the delete confirmation dialog is open
    When I dismiss the dialog without clicking Delete
    Then "Test Program" remains in the program list

  # Ambiguities and gaps
  # - Confirmation dialog copy — title, body text, and whether Program Name must appear not specified
  # - Confirm button label — AC says "I confirm deletion" without specifying Delete vs Confirm vs Yes
  # - Cancel AC precondition — omits login, page context, and which program; concrete example used in TC-003
  # - Success feedback — no AC for toast, snackbar, or silent removal after successful delete
  # - Persistence — AC verifies immediate list update only; refresh persistence recommended (TC-006) but not in AC
  # - Empty list state — no AC for UX when the last program is deleted (TC-015)
  # - Role-based access — admin-only restriction implied but not stated (TC-014)
  # - Error handling — no AC for API failure or network timeout during delete (TC-013)
  # - Dismiss behavior — Cancel specified; Escape key, overlay click, and close (X) undefined (TC-023)
  # - Associated data — unclear whether delete cascades to courses, enrollments, or linked entities
  # - Soft delete vs hard delete — permanent removal vs archive/recovery not specified
  # - Delete during edit — no AC for concurrent create/edit modals (TC-021)
  # - Loading and double-submit — no AC for disabled buttons or loading state during delete (TC-019, TC-020)
  # - List sort order after deletion — not specified
  # - Uniqueness after delete — whether deleted name can be reused not in AC; TC-008 aligns with DS-3
  # - Accessibility — keyboard navigation, focus trap, screen reader announcements not specified
  # - Audit / activity log — no requirement to record who deleted which program and when
