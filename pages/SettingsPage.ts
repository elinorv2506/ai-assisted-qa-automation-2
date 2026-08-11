import { type Locator, type Page, type Response } from '@playwright/test';
import { AddUserModal } from './AddUserModal';

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';

export class SettingsPage {
  readonly addUserModal: AddUserModal;
  readonly heading: Locator;
  readonly settingsNavButton: Locator;
  readonly usersHeading: Locator;
  readonly addUserButton: Locator;
  readonly usersTable: Locator;
  readonly nameColumnHeader: Locator;
  readonly emailColumnHeader: Locator;
  readonly roleColumnHeader: Locator;
  readonly activeColumnHeader: Locator;
  readonly calendarViewHeading: Locator;
  readonly accountHeading: Locator;
  readonly validationError: Locator;

  constructor(private readonly page: Page) {
    this.addUserModal = new AddUserModal(page);
    this.heading = page.getByRole('heading', { name: 'Settings' });
    this.settingsNavButton = page.getByRole('button', { name: 'Settings' });
    this.usersHeading = page.getByRole('heading', { name: 'Users', level: 4 });
    this.addUserButton = page.getByRole('button', { name: 'Add User' });
    this.usersTable = page.getByRole('table');
    this.nameColumnHeader = page.getByRole('columnheader', { name: 'Name' });
    this.emailColumnHeader = page.getByRole('columnheader', { name: 'Email' });
    this.roleColumnHeader = page.getByRole('columnheader', { name: 'Role' });
    this.activeColumnHeader = page.getByRole('columnheader', { name: 'Active' });
    this.calendarViewHeading = page.getByRole('heading', { name: 'Calendar View', level: 4 });
    this.accountHeading = page.getByRole('heading', { name: 'Account', level: 4 });
    this.validationError = page.getByText(
      /already exists|duplicate|email.*taken|user.*exists|invalid email|error/i,
    );
  }

  async goto(): Promise<void> {
    const usersLoaded = this.page.waitForResponse(
      (res) => res.url().includes('/users') && res.request().method() === 'GET' && res.ok(),
    );
    await this.page.goto(`${BASE_URL}/settings`);
    await this.heading.waitFor({ state: 'visible' });
    await usersLoaded;
    await this.usersHeading.waitFor({ state: 'visible' });
  }

  async openAddUserModal(): Promise<void> {
    await this.addUserButton.click();
    await this.addUserModal.dialog.waitFor({ state: 'visible' });
  }

  userRow(name: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByText(name, { exact: true }),
    });
  }

  userEmailInRow(name: string): Locator {
    return this.userRow(name).getByText(/@/);
  }

  userRoleInRow(name: string, role: string): Locator {
    return this.userRow(name).getByText(role, { exact: true });
  }

  userActiveSwitchInRow(name: string): Locator {
    return this.userRow(name).getByRole('switch');
  }

  async submitCreateUserForm(options: {
    name: string;
    email: string;
    password: string;
    role?: 'ADMIN' | 'EDITOR' | 'VIEWER';
    submit?: () => Promise<void>;
  }): Promise<Response> {
    await this.addUserModal.fillName(options.name);
    await this.addUserModal.fillEmail(options.email);
    await this.addUserModal.fillPassword(options.password);
    if (options.role) {
      await this.addUserModal.selectRole(options.role);
    }

    const createResponse = this.page.waitForResponse(
      (res) => res.url().includes('/users') && res.request().method() === 'POST',
    );

    if (options.submit) {
      await options.submit();
    } else {
      await this.addUserModal.clickCreateUser();
    }

    return createResponse;
  }

  async createUser(
    options: {
      name: string;
      email: string;
      password: string;
      role?: 'ADMIN' | 'EDITOR' | 'VIEWER';
      submit?: () => Promise<void>;
    },
    trackUser: (id: string) => void,
  ): Promise<void> {
    const response = await this.submitCreateUserForm(options);
    await this.trackUserFromResponse(response, trackUser);
  }

  private async trackUserFromResponse(
    response: Response,
    trackUser: (id: string) => void,
  ): Promise<void> {
    if (!response.ok()) {
      return;
    }
    const body = await response.json();
    if (body?.data?.id) {
      trackUser(body.data.id);
    }
  }
}
