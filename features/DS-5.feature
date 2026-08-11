Feature: Program list filtering and display
  DS-5 — Admin views all programs in a list with name and description, or sees an empty state with create prompt

  # Happy paths

  @TC-001 @AC-DisplayProgramList
  Scenario: Display program list with key details
    Given I am logged in as admin
    And a program "Web Development 2026" exists with Description "Full-stack web development program"
    And a program "Cloud Engineering 2026" exists with Description "AWS and Azure fundamentals"
    When I navigate to the Programs page
    Then I see a list showing each program's name and description
    And the list shows Program Name "Web Development 2026" and Description "Full-stack web development program"
    And the list shows Program Name "Cloud Engineering 2026" and Description "AWS and Azure fundamentals"

  @TC-002 @AC-EmptyState @network-empty-list
  Scenario: Empty state when no programs exist
    Given I am logged in as admin
    And the programs list API returns an empty collection
    When I navigate to the Programs page
    Then I see "No programs yet. Create your first program to get started."
    And I see a "Create Program" prompt
    And I see the "+ New Program" action

  @TC-003
  Scenario: Create action is available on populated Programs page
    Given I am logged in as admin
    And a program "Mobile App Development 2025" exists
    When I navigate to the Programs page
    Then I see the program list
    And I see the "+ New Program" action

  @TC-004 @network-empty-list
  Scenario: Empty state create prompt opens program creation form
    Given I am logged in as admin
    And the programs list API returns an empty collection
    And I am on the Programs page
    When I click "+ New Program"
    Then I see the program creation form with fields: Program Name, Description

  @TC-005
  Scenario: Program list data persists after refresh
    Given I am logged in as admin
    And a program "Web Development 2026" exists with Description "Full-stack web development program"
    And I am on the Programs page
    When I refresh the Programs page
    Then the list shows Program Name "Web Development 2026"
    And the list shows Description "Full-stack web development program"

  @TC-006
  Scenario: Program with empty description appears in list
    Given I am logged in as admin
    And a program "Data Science Fundamentals" exists with an empty Description
    When I navigate to the Programs page
    Then the list shows Program Name "Data Science Fundamentals"
    And the Description is empty or shows an appropriate placeholder

  # Negative

  @TC-007 @network-empty-list
  Scenario: No program rows when list is empty
    Given I am logged in as admin
    And the programs list API returns an empty collection
    When I navigate to the Programs page
    Then I do not see any program rows
    And I do not see edit icons or delete icons without a program row

  @TC-008
  Scenario: Empty state hidden when programs exist
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    When I navigate to the Programs page
    Then I see a list showing "Web Development 2026"
    And I do not see a message indicating no programs have been created

  @TC-009
  Scenario: Program name and description are not swapped in list
    Given I am logged in as admin
    And a program "Cybersecurity 2026" exists with Description "Network security and ethical hacking fundamentals"
    When I navigate to the Programs page
    Then the Program Name column shows "Cybersecurity 2026"
    And the Description column shows "Network security and ethical hacking fundamentals"
    And the Description column does not show "Cybersecurity 2026"

  @TC-010
  Scenario: Deleted program is not shown in list
    Given I am logged in as admin
    And programs "Test Program" and "Web Development 2026" exist
    And I am on the Programs page
    When I delete "Test Program" and confirm deletion
    Then "Test Program" is not shown in the program list
    And "Web Development 2026" remains in the program list

  @TC-011
  Scenario: Non-admin cannot access Programs page program list
    Given I am logged in as instructor
    And programs exist in the system
    When I attempt to navigate to the Programs page
    Then I do not see the admin program list with edit and delete actions
    Or I am redirected or shown an access denied message

  @TC-012 @network-500-list
  Scenario: Load failure is not shown as successful empty state
    Given I am logged in as admin
    And the programs list API returns HTTP 500
    When I navigate to the Programs page
    Then I do not see "No programs yet. Create your first program to get started."
    And the Programs heading remains visible

  @TC-025 @network-timeout-list
  Scenario: List timeout is not shown as successful empty state
    Given I am logged in as admin
    And the programs list API request times out
    When I navigate to the Programs page
    Then I do not see "No programs yet. Create your first program to get started."
    And the Programs heading remains visible

  @TC-026 @network-malformed-list
  Scenario: Malformed list payload does not crash the Programs shell
    Given I am logged in as admin
    And the programs list API returns invalid JSON
    When I navigate to the Programs page
    Then the Programs heading remains visible
    And I still see the "+ New Program" action

  @TC-027 @network-401-list
  Scenario: Unauthorized list response is not shown as a genuine empty list
    Given I am logged in as admin
    And the programs list API returns HTTP 401
    When I navigate to the Programs page
    Then I do not see "No programs yet. Create your first program to get started."
    And I am shown an auth error or login prompt

  # Accessibility

  @TC-028 @a11y-axe-programs-page
  Scenario: Populated Programs page passes WCAG 2 A/AA
    Given I am logged in as admin
    And a program exists in the list
    When I scan the Programs page for WCAG 2 A and AA violations
    Then there are no axe violations

  @TC-029 @a11y-keyboard-new-program
  Scenario: Keyboard Tab and Enter open the New Program dialog
    Given I am logged in as admin
    And the programs list API returns an empty collection
    When I Tab to "+ New Program"
    And I press Enter
    Then the New Program dialog is visible

  # Edge cases

  @TC-013
  Scenario: Single program in list
    Given I am logged in as admin
    And only the program "Mobile App Development 2025" exists with Description "iOS and Android development track"
    When I navigate to the Programs page
    Then I see exactly one program row
    And the list shows Program Name "Mobile App Development 2025"
    And the list shows Description "iOS and Android development track"

  @TC-014
  Scenario: Special characters display correctly in program list
    Given I am logged in as admin
    And a program "Informatique & IA - Niveau 2" exists with Description "Programme avancé en informatique et intelligence artificielle"
    When I navigate to the Programs page
    Then the list shows Program Name "Informatique & IA - Niveau 2"
    And the list shows Description "Programme avancé en informatique et intelligence artificielle"

  @TC-015
  Scenario: Unicode and emoji in program list
    Given I am logged in as admin
    And a program "תוכנית פיתוח אתרים 2026 🎓" exists with Description "Full-stack track with modern frameworks"
    When I navigate to the Programs page
    Then the list shows the full Program Name including emoji
    And the list shows Description "Full-stack track with modern frameworks"

  @TC-016
  Scenario: Max-length program name in list
    Given I am logged in as admin
    And a program with a 255-character Program Name exists
    When I navigate to the Programs page
    Then the program appears in the list
    And the Program Name is displayed without breaking the table layout

  @TC-017
  Scenario: Long description in program list
    Given I am logged in as admin
    And a program "Long Description Program" exists with a Description of 2000 characters
    When I navigate to the Programs page
    Then the list shows Program Name "Long Description Program"
    And the Description is displayed with truncation or wrapping without breaking the row layout

  @TC-018
  Scenario: Single-character program name in list
    Given I am logged in as admin
    And a program "X" exists with Description "Single character name boundary test"
    When I navigate to the Programs page
    Then the list shows Program Name "X"
    And the list shows Description "Single character name boundary test"

  @TC-019
  Scenario: All programs appear in list
    Given I am logged in as admin
    And programs "Web Development 2026", "Cloud Engineering 2026", "Data Science Fundamentals", and "Mobile App Development 2025" exist
    When I navigate to the Programs page
    Then the list shows "Web Development 2026"
    And the list shows "Cloud Engineering 2026"
    And the list shows "Data Science Fundamentals"
    And the list shows "Mobile App Development 2025"

  @TC-020
  Scenario: New program appears in list after create
    Given I am logged in as admin
    And I am on the Programs page
    And I am on the program creation form
    When I fill in Program Name with "Quantum Computing Intro 2026"
    And I fill in Description with "Introduction to qubits and algorithms"
    And I click Create
    Then the program list shows "Quantum Computing Intro 2026"
    And the list shows Description "Introduction to qubits and algorithms"

  @TC-021
  Scenario: List updates after program edit
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    And I am on the Programs page
    When I edit the program and change Program Name to "Web Development 2026 - Updated"
    And I change Description to "Updated full-stack curriculum"
    And I save the changes
    Then the program list shows "Web Development 2026 - Updated"
    And the list shows Description "Updated full-stack curriculum"
    And the program list does not show "Web Development 2026"

  @TC-022
  Scenario: XSS payload in description is sanitized in list
    Given I am logged in as admin
    And a program "Secure Coding 2026" exists with Description "<script>alert('xss')</script>"
    When I navigate to the Programs page
    Then the list shows "Secure Coding 2026"
    And no script is executed on the Programs page
    And the Description does not render executable HTML

  @TC-023
  Scenario: Empty state after last program deleted
    Given I am logged in as admin
    And only the program "Test Program" exists
    And I am on the Programs page
    When I delete "Test Program" and confirm deletion
    Then I see a message indicating no programs have been created
    And I see a prompt to create the first program

  @TC-024
  Scenario: No duplicate-looking rows from whitespace variants
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    And no program named "  Web Development 2026  " exists
    When I navigate to the Programs page
    Then the program list contains exactly one row for "Web Development 2026"

  # Ambiguities and gaps
  # - "Filtering" in feature title vs ACs — ACs only cover display and empty state; no search, filter, or sort controls specified
  # - Live empty-state copy (2026-08-11): "No programs yet. Create your first program to get started." plus a "Create Program" button; "+ New Program" remains
  # - Shared tenant has hundreds of leftover programs — empty-state ACs must use GET /api/programs mock { data: [] }, not bulk delete
  # - GET 500, timeout, and 401 currently render the same empty-state copy (no error/retry/login) — TC-012/025/027 document the AC; treat as app bugs if they fail
  # - Malformed list JSON currently whitescreens (heading and + New Program missing) — TC-026
  # - List structure — table vs cards, column headers, row actions (edit/delete) not in AC
  # - Sort order — alphabetical, created date, or manual not defined
  # - Pagination / virtual scroll — threshold for paginated list not specified
  # - Non-admin access — admin-only restriction implied by DS-1 but not explicit in these ACs; instructor credentials not configured
  # - Loading state — no AC for skeleton/spinner while programs load
  # - Persistence — AC does not require refresh verification; TC-005 recommended follow-up
  # - Max length / truncation UX — display rules for long Program Name and Description not specified
  # - Accessibility — axe + keyboard added as TC-028/029; known violations may remain (see programs.a11y.spec.ts)
  # - Internationalization — RTL and locale-specific empty-state strings not specified
  # - Relationship to create/edit/delete — list updates after CRUD implied by DS-1–DS-4 but not in these ACs
  # - Duplicate Program Names — DS-3 enforces uniqueness on create; duplicate display out of scope
  # - TC-023 (empty after last delete) cannot be isolated on the shared tenant without deleting other testers' data
