import { test as setup } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const authFile = path.resolve(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  setup.skip(
    !process.env.DIDAXIS_EMAIL || !process.env.DIDAXIS_PASSWORD,
    'DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set',
  );

  await page.goto('https://test.didaxis.studio/login');
  await page.getByLabel('Email').fill(process.env.DIDAXIS_EMAIL!);
  await page.getByLabel('Password').fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.endsWith('/login'));
  await page.goto('https://test.didaxis.studio/programs');
  await page.waitForURL('**/programs');

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
