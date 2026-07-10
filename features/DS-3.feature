Feature: Program name validation and duplicate prevention
  DS-3 — Admin validation rules for Program Name on create (trim, special characters, uniqueness)

  # Happy paths

  @TC-001 @AC-AcceptSpecialCharacters
  Scenario: Accept program name with special characters
    Given I am logged in as admin
    And I am on the program creation form
    And no program named "Informatique & IA - Niveau 2" exists
    When I fill in Program Name with "Informatique & IA - Niveau 2"
    And I fill in Description with "Programme avancé en informatique et intelligence artificielle"
    And I click Create
    Then the modal closes
    And the program list shows "Informatique & IA - Niveau 2"

  @TC-002
  Scenario: Successfully create a program with a unique name
    Given I am logged in as admin
    And I am on the program creation form
    And no program named "Web Development 2026" exists
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  @TC-003
  Scenario: Leading and trailing whitespace is trimmed on create
    Given I am logged in as admin
    And I am on the program creation form
    And no program named "Cloud Engineering 2026" exists
    When I fill in Program Name with "  Cloud Engineering 2026  "
    And I fill in Description with "AWS and Azure fundamentals"
    And I click Create
    Then the modal closes
    And the program list shows "Cloud Engineering 2026"

  @TC-004
  Scenario: Extended special characters in program name are accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "C++ & C# Dev (2026) — \"Advanced\""
    And I fill in Description with "Covers C++, C#, and related tooling"
    And I click Create
    Then the modal closes
    And the program list shows "C++ & C# Dev (2026) — \"Advanced\""

  @TC-005
  Scenario: Unicode program name is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "תוכנית פיתוח אתרים 2026"
    And I fill in Description with "תיאור בעברית — full-stack program"
    And I click Create
    Then the modal closes
    And the program list shows "תוכנית פיתוח אתרים 2026"

  # Negative

  @TC-006 @AC-RejectWhitespaceOnly
  Scenario: Reject program name with only whitespace
    Given I am logged in as admin
    And I am on the program creation form
    When I enter "   " as the program name
    And I fill in Description with "Optional description text"
    And I click Create
    Then the form is not submitted
    And the modal remains open
    And no program is created

  @TC-007 @AC-RejectDuplicate
  Scenario: Reject duplicate program name
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Second attempt — different description"
    And I click Create
    Then I see an error indicating the name already exists
    And the modal remains open
    And the program list contains only one "Web Development 2026"

  @TC-008
  Scenario: Empty program name is not submitted
    Given I am logged in as admin
    And I am on the program creation form
    When I leave the Program Name field empty
    And I fill in Description with "Description without a name"
    Then the Create button is disabled
    And no program is created

  @TC-009
  Scenario: Duplicate create does not overwrite existing program
    Given I am logged in as admin
    And a program "Web Development 2026" already exists with description "Full-stack web development program"
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Malicious overwrite attempt"
    And I click Create
    Then I see an error indicating the name already exists
    And the existing program still has description "Full-stack web development program"
    And the program list contains only one "Web Development 2026"

  @TC-010
  Scenario: Trimmed duplicate name is rejected
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "  Web Development 2026  "
    And I fill in Description with "Padded duplicate attempt"
    And I click Create
    Then I see an error indicating the name already exists
    And no second program is created

  @TC-011
  Scenario: User can recover from duplicate name error
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Advanced React and Node.js"
    And I click Create
    Then I see an error indicating the name already exists
    When I change Program Name to "Web Development 2026 - Advanced"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026 - Advanced"

  @TC-012
  Scenario: Similar but distinct program name is accepted
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026 - Updated"
    And I fill in Description with "Extended curriculum"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"
    And the program list shows "Web Development 2026 - Updated"

  @TC-013
  Scenario: Non-admin cannot create programs with validated names
    Given I am logged in as instructor
    When I navigate to the Programs page
    Then I do not see "+ New Program"
    And I cannot access the program creation form

  # Edge cases

  @TC-014
  Scenario: Tab and newline only program name is rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with a tab-only or newline-only string
    And I fill in Description with "Test description"
    And I click Create
    Then the form is not submitted
    And no program is created

  @TC-015
  Scenario: Single character program name is accepted
    Given I am logged in as admin
    And I am on the program creation form
    And no program named "A" exists
    When I fill in Program Name with "A"
    And I fill in Description with "Single character name boundary test"
    And I click Create
    Then the modal closes
    And the program list shows "A"

  @TC-016
  Scenario: Program name at maximum allowed length
    Given I am logged in as admin
    And I am on the program creation form
    And the maximum Program Name length is 255 characters
    When I fill in Program Name with a string of 255 characters
    And I fill in Description with "Boundary test at max length"
    And I click Create
    Then the modal closes
    And the program list shows the 255-character program name

  @TC-017
  Scenario: Program name exceeding maximum length is rejected
    Given I am logged in as admin
    And I am on the program creation form
    And the maximum Program Name length is 255 characters
    When I fill in Program Name with a string of 256 characters
    Then the Create button is disabled or a validation message is shown
    And no program is created

  @TC-018
  Scenario: Case variant of existing program name
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "web development 2026"
    And I fill in Description with "Lowercase duplicate test"
    And I click Create
    Then either I see an error indicating the name already exists
    Or the program is created as a distinct entry per case-sensitive policy

  @TC-019
  Scenario: Internal multiple spaces in program name
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Data  Science  2026"
    And I fill in Description with "Internal spacing test"
    And I click Create
    Then the program is created successfully
    And the displayed name matches the stored normalization rules

  @TC-020
  Scenario: Double Create click on duplicate name
    Given I am logged in as admin
    And a program "Mobile App Development 2025" already exists
    And I am on the program creation form
    When I fill in Program Name with "Mobile App Development 2025"
    And I fill in Description with "Duplicate double-click test"
    And I double-click Create
    Then I see an error indicating the name already exists
    And the program list contains only one "Mobile App Development 2025"

  @TC-021
  Scenario: Duplicate name with special characters is rejected
    Given I am logged in as admin
    And a program "Informatique & IA - Niveau 2" already exists
    And I am on the program creation form
    When I fill in Program Name with "Informatique & IA - Niveau 2"
    And I fill in Description with "Duplicate special char test"
    And I click Create
    Then I see an error indicating the name already exists
    And the program list contains only one "Informatique & IA - Niveau 2"

  @TC-022
  Scenario: Whitespace name with valid description is still rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "     "
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the form is not submitted
    And no program is created

  # Ambiguities and gaps
  # - Whitespace-only UX: AC says "I click Create" but DS-1 disables Create when name is empty — unclear if proactive disable or submit-time validation
  # - Exact duplicate error message copy and placement (inline vs toast) not specified
  # - Case sensitivity for duplicate detection (Web Development 2026 vs web development 2026) — product decision needed
  # - Max length for Program Name and Description — assumed 255 characters; not in AC
  # - Minimum length beyond non-empty after trim — single character assumed valid
  # - Leading/trailing trim on valid names — implied by duplicate/whitespace ACs but not explicit
  # - Internal whitespace normalization (e.g. collapsing double spaces) — not specified
  # - Description required vs optional — AC says "fill other required fields" but DS-1 treats Description as optional
  # - Duplicate name policy on edit (DS-2) — create-only scope here; rename rules may need alignment
  # - Non-admin role restrictions — implied by admin role but not explicit in these ACs
  # - Allowed special character set — AC gives one French example; full Unicode/emoji/HTML scope unclear
  # - Persistence after page refresh — not required in AC
  # - API/network failure during duplicate check — not in AC
  # - Uniqueness scope — global vs per tenant/org not specified
