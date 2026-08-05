import { type Locator, type Page } from '@playwright/test';

export class DeleteProgramModal {
  readonly deletionError: Locator;

  constructor(private readonly page: Page) {
    this.deletionError = page.getByText(/failed|error|could not delete|unable to delete/i);
  }

  async withDialogAction(
    action: () => Promise<void>,
    dialogAction: 'accept' | 'dismiss',
  ): Promise<string> {
    let message = '';
    this.page.once('dialog', async (dialog) => {
      message = dialog.message();
      if (dialogAction === 'accept') {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
    await action();
    return message;
  }
}
