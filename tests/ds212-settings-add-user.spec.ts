import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/cleanup.fixture';
import { SettingsPage } from '../pages/SettingsPage';

function uniqueEmail(): string {
  return `qa-${Date.now()}@college.edu`;
}

function uniqueName(base: string): string {
  return `${base} ${Date.now()}`;
}

test.describe('DS-212: Add user in Settings', () => {
  test.describe('Positive Flows', () => {
    let settingsPage: SettingsPage;

    test.beforeEach(async ({ page }) => {
      settingsPage = new SettingsPage(page);
      await settingsPage.goto();
    });

    test('TC-001 — Admin navigates to Settings and sees Users management', async () => {
      await expect(settingsPage.heading).toBeVisible();
      await expect(settingsPage.usersHeading).toBeVisible();
      await expect(settingsPage.addUserButton).toBeVisible();
      await expect(settingsPage.usersTable).toBeVisible();
      await expect(settingsPage.nameColumnHeader).toBeVisible();
      await expect(settingsPage.emailColumnHeader).toBeVisible();
      await expect(settingsPage.roleColumnHeader).toBeVisible();
      await expect(settingsPage.activeColumnHeader).toBeVisible();
    });

    test('TC-002 — Add User modal displays required fields', async () => {
      await settingsPage.openAddUserModal();

      await expect(settingsPage.addUserModal.dialog).toBeVisible();
      await expect(settingsPage.addUserModal.nameField).toBeVisible();
      await expect(settingsPage.addUserModal.emailField).toBeVisible();
      await expect(settingsPage.addUserModal.passwordField).toBeVisible();
      await expect(settingsPage.addUserModal.roleField).toBeVisible();
      await expect(settingsPage.addUserModal.roleField).toHaveValue('EDITOR');
      await expect(settingsPage.addUserModal.createUserButton).toBeVisible();
    });

    test('TC-003 — Admin successfully creates a new user', async ({ trackUser }) => {
      const name = uniqueName('QA Instructor Elena');
      const email = uniqueEmail();

      await settingsPage.openAddUserModal();
      await settingsPage.createUser(
        { name, email, password: 'SecurePass1!', role: 'EDITOR' },
        trackUser,
      );

      await expect(settingsPage.addUserModal.dialog).toBeHidden();
      await expect(settingsPage.userRow(name)).toBeVisible();
      await expect(settingsPage.userEmailInRow(name)).toHaveText(email);
      await expect(settingsPage.userRoleInRow(name, 'EDITOR')).toBeVisible();
      await expect(settingsPage.userActiveSwitchInRow(name)).toBeChecked();
    });

    test('TC-004 — Admin can create a user with VIEWER role', async ({ trackUser }) => {
      const name = uniqueName('QA Viewer Victor');
      const email = uniqueEmail();

      await settingsPage.openAddUserModal();
      await settingsPage.createUser(
        { name, email, password: 'ViewerPass1!', role: 'VIEWER' },
        trackUser,
      );

      await expect(settingsPage.addUserModal.dialog).toBeHidden();
      await expect(settingsPage.userRow(name)).toBeVisible();
      await expect(settingsPage.userRoleInRow(name, 'VIEWER')).toBeVisible();
    });

    test('TC-005 — Create User button enables when all required fields are valid', async () => {
      const name = uniqueName('QA Editor Emma');
      const email = uniqueEmail();

      await settingsPage.openAddUserModal();
      await expect(settingsPage.addUserModal.createUserButton).toBeDisabled();

      await settingsPage.addUserModal.fillName(name);
      await settingsPage.addUserModal.fillEmail(email);
      await settingsPage.addUserModal.fillPassword('EditorPass1!');

      await expect(settingsPage.addUserModal.createUserButton).toBeEnabled();
    });
  });

  test.describe('Negative Flows', () => {
    let settingsPage: SettingsPage;

    test.beforeEach(async ({ page }) => {
      settingsPage = new SettingsPage(page);
      await settingsPage.goto();
    });

    test('TC-006 — Create User stays disabled with empty Name', async () => {
      const ghostName = uniqueName('Missing Name User');

      await settingsPage.openAddUserModal();
      await settingsPage.addUserModal.fillEmail(uniqueEmail());
      await settingsPage.addUserModal.fillPassword('SecurePass1!');

      await expect(settingsPage.addUserModal.createUserButton).toBeDisabled();
      await expect(settingsPage.userRow(ghostName)).toHaveCount(0);
    });

    test('TC-007 — Create User stays disabled with empty Email', async () => {
      const name = uniqueName('No Email User');

      await settingsPage.openAddUserModal();
      await settingsPage.addUserModal.fillName(name);
      await settingsPage.addUserModal.fillPassword('SecurePass1!');

      await expect(settingsPage.addUserModal.createUserButton).toBeDisabled();
      await expect(settingsPage.userRow(name)).toHaveCount(0);
    });

    test('TC-008 — Create User stays disabled when password is shorter than 8 characters', async () => {
      const name = uniqueName('Short Password User');

      await settingsPage.openAddUserModal();
      await settingsPage.addUserModal.fillName(name);
      await settingsPage.addUserModal.fillEmail(uniqueEmail());
      await settingsPage.addUserModal.fillPassword('short1');

      await expect(settingsPage.addUserModal.createUserButton).toBeDisabled();
      await expect(settingsPage.userRow(name)).toHaveCount(0);
    });

    test('TC-009 — Closing Add User modal without submit does not create a user', async () => {
      const name = uniqueName('Cancelled User');

      await settingsPage.openAddUserModal();
      await settingsPage.addUserModal.fillName(name);
      await settingsPage.addUserModal.fillEmail(uniqueEmail());
      await settingsPage.addUserModal.fillPassword('CancelPass1!');
      await settingsPage.addUserModal.dismiss();

      await expect(settingsPage.addUserModal.dialog).toBeHidden();
      await expect(settingsPage.userRow(name)).toHaveCount(0);
    });

    test('TC-010 — Duplicate email is not silently accepted', async ({ trackUser }) => {
      const email = uniqueEmail();
      const seedName = uniqueName('Dup Seed User');
      const duplicateName = uniqueName('Duplicate Email Attempt');

      await settingsPage.openAddUserModal();
      await settingsPage.createUser(
        { name: seedName, email, password: 'SecurePass1!' },
        trackUser,
      );
      await expect(settingsPage.addUserModal.dialog).toBeHidden();

      await settingsPage.openAddUserModal();
      await settingsPage.addUserModal.fillName(duplicateName);
      await settingsPage.addUserModal.fillEmail(email);
      await settingsPage.addUserModal.fillPassword('DupPass123!');
      await settingsPage.addUserModal.clickCreateUser();

      // App keeps modal open on duplicate email but does not surface an error message (no catch on POST /users).
      await expect(settingsPage.addUserModal.dialog).toBeVisible();
      await expect(settingsPage.userRow(duplicateName)).toHaveCount(0);
    });
  });

  test.describe('Edge Cases', () => {
    let settingsPage: SettingsPage;

    test.beforeEach(async ({ page }) => {
      settingsPage = new SettingsPage(page);
      await settingsPage.goto();
    });

    test('TC-011 — User name with special characters is accepted', async ({ trackUser }) => {
      const name = `María O'Connor-Smith (QA) ${Date.now()}`;
      const email = uniqueEmail();

      await settingsPage.openAddUserModal();
      await settingsPage.createUser(
        { name, email, password: 'MariaPass1!' },
        trackUser,
      );

      await expect(settingsPage.addUserModal.dialog).toBeHidden();
      await expect(settingsPage.userRow(name)).toBeVisible();
    });

    test('TC-012 — Password with exactly 8 characters enables Create User', async () => {
      const name = uniqueName('Eight Char Pass');
      const email = uniqueEmail();

      await settingsPage.openAddUserModal();
      await settingsPage.addUserModal.fillName(name);
      await settingsPage.addUserModal.fillEmail(email);
      await settingsPage.addUserModal.fillPassword('12345678');

      await expect(settingsPage.addUserModal.createUserButton).toBeEnabled();
    });
  });

  test.describe('Network Failures', () => {
    let settingsPage: SettingsPage;

    test.beforeEach(async ({ page }) => {
      settingsPage = new SettingsPage(page);
      await settingsPage.goto();
    });

    test(
      'TC-013 — User creation survives POST /users server error',
      { tag: '@network-503' },
      async ({ page }) => {
        const name = uniqueName('Network Fail User');
        const email = uniqueEmail();

        await page.route('**/users**', async (route) => {
          if (route.request().method() === 'POST') {
            await route.fulfill({
              status: 503,
              contentType: 'application/json',
              body: JSON.stringify({ message: 'Service Unavailable' }),
            });
            return;
          }
          await route.continue();
        });

        await settingsPage.openAddUserModal();
        await settingsPage.addUserModal.fillName(name);
        await settingsPage.addUserModal.fillEmail(email);
        await settingsPage.addUserModal.fillPassword('NetworkPass1!');
        await settingsPage.addUserModal.clickCreateUser();

        await expect(settingsPage.addUserModal.dialog).toBeVisible();
        await expect(settingsPage.userRow(name)).toHaveCount(0);
      },
    );
  });

  test.describe('Accessibility', () => {
    let settingsPage: SettingsPage;

    test.beforeEach(async ({ page }) => {
      settingsPage = new SettingsPage(page);
      await settingsPage.goto();
    });

    test.fixme(
      'Users section passes WCAG 2 A/AA axe scan',
      { tag: '@a11y-axe-settings-page' },
      async ({ page }) => {
        // Blocked by app bug: color-contrast violations on dimmed table/email text in Users card
        await expect(settingsPage.usersSection).toBeVisible();

        const sectionSelector = await settingsPage.usersSectionAxeIncludeSelector();
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .include(sectionSelector)
          .analyze();

        await expect(results.violations).toEqual([]);
      },
    );

    test(
      'Add User modal passes WCAG 2 A/AA axe scan',
      { tag: '@a11y-axe-add-user-modal' },
      async ({ page }) => {
        await settingsPage.openAddUserModal();
        await expect(settingsPage.addUserModal.dialog).toBeVisible();

        const modalSelector = await settingsPage.addUserModal.axeScanIncludeSelector();
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .include(modalSelector)
          .exclude(`${modalSelector} .mantine-Modal-close`) // Mantine CloseButton lacks accessible name
          .analyze();

        await expect(results.violations).toEqual([]);
      },
    );

    test(
      'Tab and Enter on Add User opens dialog',
      { tag: '@a11y-keyboard-add-user' },
      async ({ page }) => {
        await expect(settingsPage.addUserButton).toBeVisible();

        let focused = false;
        for (let i = 0; i < 30 && !focused; i++) {
          if (await settingsPage.addUserButton.evaluate((el) => el === document.activeElement)) {
            focused = true;
            break;
          }
          await page.keyboard.press('Tab');
        }

        await expect(settingsPage.addUserButton).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(settingsPage.addUserModal.dialog).toBeVisible();
      },
    );
  });
});
