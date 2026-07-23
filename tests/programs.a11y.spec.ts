import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ProgramsPage } from '../pages/ProgramsPage';

test.describe('Programs accessibility', { tag: '@regression' }, () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame() && /\/login/.test(frame.url())) {
        throw new Error('Hit /login — storageState was not reused for this test');
      }
    });

    programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('Programs page has no accessibility violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test('New Program modal has no accessibility violations', async ({ page }) => {
    await programsPage.openNewProgramForm();

    const modalSelector = await programsPage.newProgramModal.axeScanIncludeSelector();
    const results = await new AxeBuilder({ page })
      .include(modalSelector)
      // Example: disable one rule when it is a known, tracked exception
      .disableRules('color-contrast')
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
