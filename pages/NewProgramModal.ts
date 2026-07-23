import { type Locator, type Page } from '@playwright/test';

export class NewProgramModal {
  readonly dialog: Locator;
  readonly programNameField: Locator;
  readonly descriptionField: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly showAiConfigToggle: Locator;
  readonly totalProgramHoursLabel: Locator;
  readonly defaultSessionHoursLabel: Locator;
  readonly defaultExamHoursLabel: Locator;
  readonly targetAudienceField: Locator;
  readonly focusAreasField: Locator;
  readonly syncAsyncRatioText: Locator;
  readonly defaultSessionHoursInput: Locator;
  readonly defaultExamHoursInput: Locator;
  readonly duplicateNameError: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New Program' });
    this.programNameField = this.dialog.getByLabel('Program Name');
    this.descriptionField = this.dialog.getByLabel('Description');
    this.createButton = this.dialog.getByRole('button', { name: 'Create' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.closeButton = this.dialog.getByRole('banner').getByRole('button');
    this.showAiConfigToggle = this.dialog.getByText('▸ Show AI Generation Config');
    this.totalProgramHoursLabel = this.dialog.getByText('Total Program Hours');
    this.defaultSessionHoursLabel = this.dialog.getByText('Default Session Hours');
    this.defaultExamHoursLabel = this.dialog.getByText('Default Exam Hours');
    this.targetAudienceField = this.dialog.getByLabel('Target Audience');
    this.focusAreasField = this.dialog.getByLabel('Focus Areas');
    this.syncAsyncRatioText = this.dialog.getByText('Sync/Async Ratio: 70% sync / 30% async');
    this.defaultSessionHoursInput = this.dialog.getByLabel('Default Session Hours');
    this.defaultExamHoursInput = this.dialog.getByLabel('Default Exam Hours');
    this.duplicateNameError = page.getByText(
      /already exists|duplicate program|program with this name|name.*already/i,
    );
  }

  async fillProgramName(name: string): Promise<void> {
    await this.programNameField.fill(name);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionField.fill(description);
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click();
  }

  async doubleClickCreate(): Promise<void> {
    await this.createButton.dblclick();
  }

  async dismiss(): Promise<void> {
    if (await this.cancelButton.isVisible()) {
      await this.cancelButton.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
  }

  async closeViaX(): Promise<void> {
    await this.closeButton.click();
  }
}
