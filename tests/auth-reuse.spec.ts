import { test, expect } from '@playwright/test';

const BASE_URL = 'https://test.didaxis.studio';

test.describe('storageState reuse (no per-test login)', () => {
  test.beforeEach(async ({ page }) => {
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame() && /\/login/.test(frame.url())) {
        throw new Error('Hit /login — storageState was not reused for this test');
      }
    });
  });

  test('reuse 1 — programs page loads authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/programs`);
    await expect(page.getByRole('heading', { name: 'Programs', level: 2 })).toBeVisible();
    await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
  });

  test('reuse 2 — fresh context still authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/programs`);
    await expect(page).toHaveURL(/\/programs/);
    await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
  });

  test('reuse 3 — third test, still no login redirect', async ({ page }) => {
    await page.goto(`${BASE_URL}/programs`);
    await expect(page.getByRole('heading', { name: 'Programs', level: 2 })).toBeVisible();
  });
});
