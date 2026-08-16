# Example: DS-1 → `features/DS-1.feature`

Derived from [DS-1 — Create new academic program](https://legionqaschool.atlassian.net/browse/DS-1).

Jira ACs are the minimum happy-path coverage. Negative and edge scenarios extend gaps noted in the ticket's out-of-scope list.

```gherkin
Feature: Create new academic program
  DS-1 — Admin creates a program from the Programs page via + New Program

  # Happy paths

  @TC-001 @AC-NavigateToForm
  Scenario: Navigate to program creation form
    Given I am logged in as admin
    When I navigate to the Programs page
    And I click "+ New Program"
    Then I see the program creation form with fields: Program Name, Description

  @TC-002 @AC-SuccessfulCreate
  Scenario: Successfully create a program
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  @TC-003
  Scenario: Create program with empty description
    Given I am on the program creation form
    When I fill in Program Name with "Data Science Fundamentals"
    And I leave Description empty
    And I click Create
    Then the modal closes
    And the program list shows "Data Science Fundamentals"

  @TC-004
  Scenario: Create button enables when program name is provided
    Given I am on the program creation form
    And the Program Name field is empty
    And the Create button is disabled
    When I fill in Program Name with "Cybersecurity 2026"
    Then the Create button is enabled

  # Negative

  @TC-006 @AC-EmptyNameValidation
  Scenario: Validation prevents empty program name
    Given I am on the program creation form
    When I leave the Program Name field empty
    Then the Create button is disabled

  @TC-007
  Scenario: Whitespace-only program name is treated as empty
    Given I am on the program creation form
    When I fill in Program Name with "   "
    And I fill in Description with "Optional description text"
    Then the Create button is disabled
    And no program is created

  @TC-008
  Scenario: Non-admin cannot create programs
    Given I am logged in as instructor
    When I navigate to the Programs page
    Then I do not see "+ New Program"
    And I cannot access the program creation form

  @TC-009
  Scenario: Closing form without submit does not create program
    Given I am on the program creation form
    When I fill in Program Name with "UX Design 2026"
    And I fill in Description with "Human-centered design principles"
    And I close the modal without clicking Create
    Then the modal closes
    And the program list does not show "UX Design 2026"

  @TC-010
  Scenario: Duplicate program name is not silently accepted
    Given I am logged in as admin
    And the program list shows "Web Development 2026"
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Duplicate attempt description"
    And I click Create
    Then the system shows a validation or error message
    And the program list contains only one "Web Development 2026"

  # Edge cases

  @TC-012
  Scenario: Minimum length program name
    Given I am on the program creation form
    When I fill in Program Name with "A"
    And I fill in Description with "Single letter program name test"
    And I click Create
    Then the modal closes
    And the program list shows "A"

  @TC-013
  Scenario: Program name at maximum allowed length
    Given I am on the program creation form
    When I fill in Program Name with a 255-character string
    And I click Create
    Then the modal closes
    And the program list shows the 255-character program name

  @TC-014
  Scenario: Program name exceeding maximum length is rejected
    Given I am on the program creation form
    When I fill in Program Name with a 256-character string
    Then the Create button is disabled or a validation error is shown
    And no program is created

  @TC-015
  Scenario: Special characters in program name are accepted
    Given I am on the program creation form
    When I fill in Program Name with "C++ & Cloud-Native (2026)"
    And I fill in Description with "Systems programming and distributed systems"
    And I click Create
    Then the modal closes
    And the program list shows "C++ & Cloud-Native (2026)"

  @TC-016
  Scenario: Double-click Create creates only one program
    Given I am on the program creation form
    When I fill in Program Name with "DevOps 2026"
    And I fill in Description with "CI/CD and infrastructure automation"
    And I double-click Create
    Then the program list contains exactly one "DevOps 2026"

  # Ambiguities and gaps
  # - Description required vs optional (AC uses example with description; empty-description behavior unspecified)
  # - Max length for Program Name and Description (not in AC; edge cases assume 255/2000)
  # - Duplicate program name policy (not in AC; business rule unclear)
  # - Whitespace trimming rules (leading/trailing spaces in Program Name)
  # - Modal cancel / dismiss behavior (Cancel, X, Esc not specified)
  # - Non-admin role restrictions (implied by admin role in AC but not explicit)
  # - List sort order after creation
  # - Success toast / confirmation message
  # - Error handling on API/network failure
  # - Double-submit / loading state during Create
```
