import { type Locator, type Page } from '@playwright/test';

export class EditProgramModal {
  readonly dialog: Locator;
  readonly programNameField: Locator;
  readonly descriptionField: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly showAiConfigToggle: Locator;
  readonly totalProgramHoursLabel: Locator;
  readonly defaultSessionHoursLabel: Locator;
  readonly defaultExamHoursLabel: Locator;
  readonly targetAudienceField: Locator;
  readonly focusAreasField: Locator;
  readonly syncAsyncRatioText: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Edit Program' });
    this.programNameField = this.dialog.getByLabel('Program Name');
    this.descriptionField = this.dialog.getByLabel('Description');
    this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.closeButton = this.dialog.getByRole('banner').getByRole('button');
    this.showAiConfigToggle = this.dialog.getByText('▸ Show AI Generation Config');
    this.totalProgramHoursLabel = this.dialog.getByText('Total Program Hours');
    this.defaultSessionHoursLabel = this.dialog.getByText('Default Session Hours');
    this.defaultExamHoursLabel = this.dialog.getByText('Default Exam Hours');
    this.targetAudienceField = this.dialog.getByLabel('Target Audience');
    this.focusAreasField = this.dialog.getByLabel('Focus Areas');
    this.syncAsyncRatioText = this.dialog.getByText('Sync/Async Ratio: 70% sync / 30% async');
  }

  async fillProgramName(name: string): Promise<void> {
    await this.programNameField.fill(name);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionField.fill(description);
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  async doubleClickSave(): Promise<void> {
    await this.saveButton.dblclick();
  }

  async dismiss(): Promise<void> {
    await this.cancelButton.click();
  }

  async closeViaX(): Promise<void> {
    await this.closeButton.click();
  }
}
