import { type Locator, type Page } from '@playwright/test';

export class AddUserModal {
  readonly dialog: Locator;
  readonly nameField: Locator;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly roleField: Locator;
  readonly createUserButton: Locator;
  readonly closeButton: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Add User' });
    this.nameField = this.dialog.getByLabel('Name');
    this.emailField = this.dialog.getByLabel('Email');
    this.passwordField = this.dialog.getByLabel('Password');
    this.roleField = this.dialog.getByLabel('Role');
    this.createUserButton = this.dialog.getByRole('button', { name: 'Create User' });
    this.closeButton = this.dialog.getByRole('banner').getByRole('button');
  }

  async fillName(name: string): Promise<void> {
    await this.nameField.fill(name);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailField.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordField.fill(password);
  }

  async selectRole(role: 'ADMIN' | 'EDITOR' | 'VIEWER'): Promise<void> {
    await this.roleField.click();
    await this.page.getByRole('option', { name: role, exact: true }).click();
  }

  async clickCreateUser(): Promise<void> {
    await this.createUserButton.click();
  }

  async dismiss(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async closeViaX(): Promise<void> {
    await this.closeButton.click();
  }

  /** Resolves a selector for AxeBuilder.include() from the role-based dialog locator. */
  async axeScanIncludeSelector(): Promise<string> {
    await this.dialog.waitFor({ state: 'visible' });
    return this.dialog.evaluate((element) => {
      if (element.id) {
        return `#${CSS.escape(element.id)}`;
      }
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel) {
        const escaped = ariaLabel.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return `[role="dialog"][aria-label="${escaped}"]`;
      }
      const labelledBy = element.getAttribute('aria-labelledby');
      if (labelledBy) {
        const firstId = labelledBy.split(/\s+/)[0];
        return `[role="dialog"][aria-labelledby~="${CSS.escape(firstId)}"]`;
      }
      throw new Error('Add User dialog lacks id or labelling attributes for axe include scoping');
    });
  }
}
