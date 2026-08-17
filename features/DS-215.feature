Feature: MASHA: User should be able to add user in Settings TK
  DS-215 — Admin opens Settings, clicks Add User, and creates users via dialog (name, email, password, role)

  # Happy paths

  @TC-001 @AC-NavigateToSettings
  Scenario: Admin navigates to Settings and sees Users management
    Given I am logged in as admin
    When I navigate to the Settings page
    Then I see the page title "Settings"
    And I see the "Users" section with an "Add User" button
    And I see a users table with columns Name, Email, Role, and Active

  @TC-002 @AC-AddUserDialog
  Scenario: Add User dialog displays required fields
    Given I am logged in as admin
    And I am on the Settings page
    When I click "Add User"
    Then I see the "Add User" modal with fields Name, Email, Password, and Role
    And the Role field defaults to "EDITOR"
    And I see a "Create User" button

  @TC-003 @AC-SuccessfulAddUser
  Scenario: Admin successfully creates a new user
    Given I am logged in as admin
    And I am on the Settings page
    When I click "Add User"
    And I fill Name with "QA Instructor Elena"
    And I fill Email with "qa-instructor-elena@college.edu"
    And I fill Password with "SecurePass1!"
    And I select Role "EDITOR"
    And I click "Create User"
    Then the Add User modal closes
    And the users table shows "QA Instructor Elena" with email "qa-instructor-elena@college.edu"
    And the user row shows role "EDITOR"
    And the user row shows as Active

  @TC-004
  Scenario: Admin can create a user with VIEWER role
    Given I am logged in as admin
    And I am on the Settings page
    When I click "Add User"
    And I fill Name with "QA Viewer Victor"
    And I fill Email with "qa-viewer-victor@college.edu"
    And I fill Password with "ViewerPass1!"
    And I select Role "VIEWER"
    And I click "Create User"
    Then the Add User modal closes
    And the users table shows "QA Viewer Victor" with role "VIEWER"

  @TC-005
  Scenario: Create User button enables when all required fields are valid
    Given I am logged in as admin
    And I am on the Settings page
    And I have opened the Add User modal
    And the Create User button is disabled
    When I fill Name with "QA Editor Emma"
    And I fill Email with "qa-editor-emma@college.edu"
    And I fill Password with "EditorPass1!"
    Then the Create User button is enabled

  # Negative

  @TC-006
  Scenario: Create User stays disabled with empty Name
    Given I am logged in as admin
    And I have opened the Add User modal on Settings
    When I fill Email with "missing-name@college.edu"
    And I fill Password with "SecurePass1!"
    Then the Create User button is disabled
    And no user is created

  @TC-007
  Scenario: Create User stays disabled with empty Email
    Given I am logged in as admin
    And I have opened the Add User modal on Settings
    When I fill Name with "No Email User"
    And I fill Password with "SecurePass1!"
    Then the Create User button is disabled
    And no user is created

  @TC-008
  Scenario: Create User stays disabled when password is shorter than 8 characters
    Given I am logged in as admin
    And I have opened the Add User modal on Settings
    When I fill Name with "Short Password User"
    And I fill Email with "short-pass@college.edu"
    And I fill Password with "short1"
    Then the Create User button is disabled
    And no user is created

  @TC-009
  Scenario: Closing Add User modal without submit does not create a user
    Given I am logged in as admin
    And I am on the Settings page
    When I click "Add User"
    And I fill Name with "Cancelled User"
    And I fill Email with "cancelled-user@college.edu"
    And I fill Password with "CancelPass1!"
    And I close the Add User modal without clicking Create User
    Then the Add User modal is closed
    And the users table does not show "Cancelled User"

  @TC-010
  Scenario: Duplicate email is not silently accepted
    Given I am logged in as admin
    And the users table already shows a user with email "dup-user@college.edu"
    And I have opened the Add User modal on Settings
    When I fill Name with "Duplicate Email Attempt"
    And I fill Email with "dup-user@college.edu"
    And I fill Password with "DupPass123!"
    And I click "Create User"
    Then the Add User modal stays open
    And the users table does not show "Duplicate Email Attempt"

  # Edge cases

  @TC-011
  Scenario: User name with special characters is accepted
    Given I am logged in as admin
    And I have opened the Add User modal on Settings
    When I fill Name with "María O'Connor-Smith (QA)"
    And I fill Email with "maria-oconnor@college.edu"
    And I fill Password with "MariaPass1!"
    And I click "Create User"
    Then the Add User modal closes
    And the users table shows "María O'Connor-Smith (QA)"

  @TC-012
  Scenario: Password with exactly 8 characters enables Create User
    Given I am logged in as admin
    And I have opened the Add User modal on Settings
    When I fill Name with "Eight Char Pass"
    And I fill Email with "eight-char@college.edu"
    And I fill Password with "12345678"
    Then the Create User button is enabled

  @TC-013 @network-503
  Scenario: User creation survives POST /users server error
    Given I am logged in as admin
    And I have opened the Add User modal on Settings
    And POST /users returns 503
    When I fill Name with "Network Fail User"
    And I fill Email with "network-fail@college.edu"
    And I fill Password with "NetworkPass1!"
    And I click "Create User"
    Then the Add User modal stays open
    And the users table does not show "Network Fail User"

  # Ambiguities and gaps
  # - DS-215 has no Jira description; AC inferred from sibling clone DS-214: open Settings, click Add User, dialog with name/email/password/role.
  # - Duplicate-email behavior: app keeps modal open without surfaced error (observed in DS-212 spec); no explicit AC in ticket.
  # - Non-admin access to Users section not specified; ADMIN-only gating inferred from app.
  # - Cleanup uses PATCH is_active=false via trackUser fixture; no DELETE /users endpoint observed.
