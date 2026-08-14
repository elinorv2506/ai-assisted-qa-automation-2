import { type Locator, type Page, type Response } from '@playwright/test';
import { DeleteProgramModal } from './DeleteProgramModal';
import { EditProgramModal } from './EditProgramModal';
import { NewProgramModal } from './NewProgramModal';

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';

export class ProgramsPage {
  readonly newProgramModal: NewProgramModal;
  readonly editProgramModal: EditProgramModal;
  readonly deleteProgramModal: DeleteProgramModal;
  readonly newProgramButton: Locator;
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly programColumnHeader: Locator;
  readonly selectProgramPrompt: Locator;
  readonly emptyStateMessage: Locator;

  constructor(private readonly page: Page) {
    this.newProgramModal = new NewProgramModal(page);
    this.editProgramModal = new EditProgramModal(page);
    this.deleteProgramModal = new DeleteProgramModal(page);
    this.newProgramButton = page.getByRole('button', { name: '+ New Program' });
    this.heading = page.getByRole('heading', { name: 'Programs', level: 2 });
    this.subtitle = page.getByText('Manage academic programs and semesters');
    this.programColumnHeader = page.getByRole('columnheader', { name: 'Program' });
    this.selectProgramPrompt = page.getByText('Select a program to manage semesters');
    this.emptyStateMessage = page.getByText(/no programs have been created|no programs yet|no programs found/i);
  }

  async goto(): Promise<void> {
    const programsLoaded = this.page.waitForResponse(
      (res) =>
        res.url().includes('/api/programs') &&
        res.request().method() === 'GET' &&
        res.ok(),
    );
    await this.page.goto(`${BASE_URL}/programs`);
    await this.newProgramButton.waitFor({ state: 'visible' });
    await this.heading.waitFor({ state: 'visible' });
    await this.waitForProgramList(await programsLoaded);
  }

  private async waitForProgramList(response: Response): Promise<void> {
    let expectedCount = 0;
    try {
      const body = await response.json();
      if (Array.isArray(body?.data)) {
        expectedCount = body.data.length;
      }
    } catch {
      return;
    }

    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline) {
      if ((await this.programRows().count()) === expectedCount) {
        return;
      }
      await this.page.waitForTimeout(100);
    }

    if (expectedCount > 0) {
      await this.programRows().first().waitFor({ state: 'visible', timeout: 5_000 });
    }
  }

  async openNewProgramForm(): Promise<void> {
    await this.newProgramButton.click();
    await this.newProgramModal.dialog.waitFor({ state: 'visible' });
  }

  programRow(name: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByText(name, { exact: true }),
    });
  }

  programRows(): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('button', { name: /^Edit / }),
    });
  }

  firstProgramRow(): Locator {
    return this.programRows().first();
  }

  programNameCell(name: string): Locator {
    return this.programRow(name).getByRole('cell').first();
  }

  programNameInRow(name: string): Locator {
    return this.programNameCell(name).getByRole('paragraph').first();
  }

  firstProgramNameText(name: string): Locator {
    return this.firstProgramRow().getByText(name, { exact: true });
  }

  editProgramButton(programName: string): Locator {
    return this.page.getByRole('button', { name: `Edit ${programName}` });
  }

  deleteProgramButton(programName: string): Locator {
    return this.page.getByRole('button', { name: `Delete ${programName}` });
  }

  async clickDeleteProgram(programName: string): Promise<void> {
    await this.deleteProgramButton(programName).first().click();
  }

  async deleteWithConfirmation(programName: string): Promise<string> {
    return this.deleteProgramModal.withDialogAction(
      () => this.clickDeleteProgram(programName),
      'accept',
    );
  }

  async cancelDelete(programName: string): Promise<string> {
    return this.deleteProgramModal.withDialogAction(
      () => this.clickDeleteProgram(programName),
      'dismiss',
    );
  }

  async openDeleteConfirmation(programName: string): Promise<string> {
    return this.cancelDelete(programName);
  }

  async doubleClickDeleteIcon(programName: string): Promise<string> {
    return this.deleteProgramModal.withDialogAction(
      () => this.deleteProgramButton(programName).first().dblclick(),
      'dismiss',
    );
  }

  programDescriptionInRow(name: string): Locator {
    return this.programNameCell(name).getByRole('paragraph').nth(1);
  }

  programCellParagraphs(name: string): Locator {
    return this.programNameCell(name).getByRole('paragraph');
  }

  async openEditProgramModal(programName: string): Promise<void> {
    await this.editProgramButton(programName).first().click();
    await this.editProgramModal.dialog.waitFor({ state: 'visible' });
  }

  async submitCreateForm(options: {
    name: string;
    description?: string;
    submit?: () => Promise<void>;
  }): Promise<Response> {
    await this.newProgramModal.fillProgramName(options.name);
    if (options.description !== undefined) {
      await this.newProgramModal.fillDescription(options.description);
    }

    const createResponse = this.page.waitForResponse(
      (res) => res.url().includes('/api/programs') && res.request().method() === 'POST',
    );

    if (options.submit) {
      await options.submit();
    } else {
      await this.newProgramModal.clickCreate();
    }

    return createResponse;
  }

  async createProgram(
    name: string,
    trackProgram: (uuid: string) => void,
    options?: {
      description?: string;
      submit?: () => Promise<void>;
      trackAllCreates?: boolean;
    },
  ): Promise<void> {
    if (options?.trackAllCreates) {
      await this.newProgramModal.fillProgramName(name);
      if (options?.description !== undefined) {
        await this.newProgramModal.fillDescription(options.description);
      }
      await this.trackProgramCreatesDuring(trackProgram, async () => {
        if (options.submit) {
          await options.submit();
        } else {
          await this.newProgramModal.clickCreate();
        }
      });
      return;
    }

    const response = await this.submitCreateForm({
      name,
      description: options?.description,
      submit: options?.submit,
    });

    await this.trackProgramFromResponse(response, trackProgram);
  }

  private async trackProgramFromResponse(
    response: Response,
    trackProgram: (uuid: string) => void,
  ): Promise<void> {
    if (!response.ok()) {
      return;
    }
    const body = await response.json();
    if (body?.data?.id) {
      trackProgram(body.data.id);
    }
  }

  private async trackProgramCreatesDuring(
    trackProgram: (uuid: string) => void,
    action: () => Promise<void>,
    maxCreates = 2,
  ): Promise<void> {
    const seen = new Set<string>();
    const pending: Promise<void>[] = [];
    let lastSeenAt = 0;

    const handler = (response: Response) => {
      if (!response.url().includes('/api/programs') || response.request().method() !== 'POST') {
        return;
      }
      pending.push(
        (async () => {
          if (!response.ok()) {
            return;
          }
          const body = await response.json();
          const id = body?.data?.id;
          if (id && !seen.has(id)) {
            seen.add(id);
            trackProgram(id);
            lastSeenAt = Date.now();
          }
        })(),
      );
    };

    this.page.on('response', handler);
    try {
      await action();

      const deadline = Date.now() + 15000;
      while (Date.now() < deadline) {
        if (seen.size >= maxCreates) {
          break;
        }
        if (seen.size > 0 && Date.now() - lastSeenAt > 500) {
          break;
        }
        await this.page.waitForTimeout(50);
      }
    } finally {
      await Promise.all(pending);
      this.page.off('response', handler);
    }
  }
}
