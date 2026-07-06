import { test, expect, type Page } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../TODO_MVC/.env') });

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';
const ADMIN_EMAIL = process.env.DIDAXIS_EMAIL;
const ADMIN_PASSWORD = process.env.DIDAXIS_PASSWORD;

function uniqueName(base: string): string {
  return `${base} ${Date.now()}`;
}

function newProgramModal(page: Page) {
  return page.getByRole('dialog', { name: 'New Program' });
}

function editProgramModal(page: Page) {
  return page.getByRole('dialog', { name: 'Edit Program' });
}

function programNameField(page: Page) {
  return newProgramModal(page).getByLabel('Program Name');
}

function editProgramNameField(page: Page) {
  return editProgramModal(page).getByLabel('Program Name');
}

function descriptionField(page: Page) {
  return newProgramModal(page).getByLabel('Description');
}

function editDescriptionField(page: Page) {
  return editProgramModal(page).getByLabel('Description');
}

function createButton(page: Page) {
  return newProgramModal(page).getByRole('button', { name: 'Create' });
}

function saveButton(page: Page) {
  return editProgramModal(page).getByRole('button', { name: 'Save' });
}

function cancelButton(page: Page) {
  return editProgramModal(page).getByRole('button', { name: 'Cancel' });
}

function newProgramButton(page: Page) {
  return page.getByRole('button', { name: '+ New Program' });
}

function editProgramButton(page: Page, programName: string) {
  return page.getByRole('button', { name: `Edit ${programName}` });
}

function programsHeading(page: Page) {
  return page.getByRole('heading', { name: 'Programs', level: 2 });
}

function programInList(page: Page, name: string) {
  return page.locator('tbody tr').filter({
    has: page.locator('td').first().getByText(name, { exact: true }),
  });
}

function programDescriptionInRow(page: Page, name: string) {
  return programInList(page, name).first().locator('td').first().locator('p').nth(1);
}

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel('Email').fill(ADMIN_EMAIL!);
  await page.getByLabel('Password').fill(ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).not.toHaveURL(/\/login\/?$/, { timeout: 30000 });
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible({ timeout: 30000 });
}

async function gotoPrograms(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/programs`);
  await expect(newProgramButton(page)).toBeVisible();
  await expect(programsHeading(page)).toBeVisible();
}

async function createProgram(
  page: Page,
  name: string,
  description?: string,
): Promise<void> {
  await newProgramButton(page).click();
  await expect(newProgramModal(page)).toBeVisible();
  await programNameField(page).fill(name);
  if (description !== undefined) {
    await descriptionField(page).fill(description);
  }
  await createButton(page).click();
  await expect(newProgramModal(page)).toBeHidden({ timeout: 15000 });
  await expect(programInList(page, name).first()).toBeVisible();
}

async function openEditProgramModal(page: Page, programName: string): Promise<void> {
  await editProgramButton(page, programName).first().click();
  await expect(editProgramModal(page)).toBeVisible();
  await expect(editProgramNameField(page)).toBeVisible();
  await expect(editDescriptionField(page)).toBeVisible();
  await expect(saveButton(page)).toBeVisible();
  await expect(cancelButton(page)).toBeVisible();
}

async function closeEditModalWithoutSubmit(page: Page): Promise<void> {
  await cancelButton(page).click();
  await expect(editProgramModal(page)).toBeHidden();
}

async function closeEditModalViaX(page: Page): Promise<void> {
  await editProgramModal(page).getByRole('banner').getByRole('button').click();
  await expect(editProgramModal(page)).toBeHidden();
}

test.setTimeout(60000);

test.beforeEach(async ({ page }) => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set');
  await loginAsAdmin(page);
  await gotoPrograms(page);
});

test.describe('Positive Flows', () => {
  test('TC-001 — Edit form opens with current program data pre-filled', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';

    await createProgram(page, programName, description);
    await openEditProgramModal(page, programName);

    await expect(editProgramNameField(page)).toHaveValue(programName);
    await expect(editDescriptionField(page)).toHaveValue(description);
    await expect(saveButton(page)).toBeEnabled();
  });

  test('TC-002 — Program name update is saved and reflected in the list immediately', async ({
    page,
  }) => {
    // Jira AC: rename to "Web Development 2026 - Updated", modal closes, list updates immediately
    const programName = uniqueName('Web Development 2026');
    const updatedName = `${programName} - Updated`;

    await createProgram(page, programName, 'Full-stack web development program');
    await openEditProgramModal(page, programName);
    await editProgramNameField(page).fill(updatedName);
    await saveButton(page).click();

    await expect(editProgramModal(page)).toBeHidden();
    await expect(programInList(page, updatedName).first()).toBeVisible();
    await expect(programInList(page, programName)).toHaveCount(0);
  });

  test('TC-003 — Unchanged fields remain intact when only Description is edited', async ({
    page,
  }) => {
    // Jira AC: "When I only change the Description ... Then the Name and other fields remain unchanged"
    const programName = uniqueName('Web Development 2026');
    const originalDescription = 'Full-stack web development program';
    const updatedDescription = 'Full-stack web development program — updated curriculum';

    await createProgram(page, programName, originalDescription);
    await openEditProgramModal(page, programName);
    await expect(editProgramNameField(page)).toHaveValue(programName);
    await editDescriptionField(page).fill(updatedDescription);
    await saveButton(page).click();

    await expect(editProgramModal(page)).toBeHidden();
    await expect(programInList(page, programName).first()).toBeVisible();
    await expect(programDescriptionInRow(page, programName)).toHaveText(updatedDescription);

    await openEditProgramModal(page, programName);
    await expect(editProgramNameField(page)).toHaveValue(programName);
    await expect(editDescriptionField(page)).toHaveValue(updatedDescription);
  });

  test('TC-004 — Both Program Name and Description can be updated in one save', async ({
    page,
  }) => {
    const programName = uniqueName('Mobile App Development 2025');
    const updatedName = `${programName} - Revised`;
    const updatedDescription = 'Cross-platform mobile development with React Native';

    await createProgram(page, programName, 'iOS and Android development track');
    await openEditProgramModal(page, programName);
    await editProgramNameField(page).fill(updatedName);
    await editDescriptionField(page).fill(updatedDescription);
    await saveButton(page).click();

    await expect(editProgramModal(page)).toBeHidden();
    await expect(programInList(page, updatedName).first()).toBeVisible();
    await expect(programDescriptionInRow(page, updatedName)).toHaveText(updatedDescription);

    await openEditProgramModal(page, updatedName);
    await expect(editProgramNameField(page)).toHaveValue(updatedName);
    await expect(editDescriptionField(page)).toHaveValue(updatedDescription);
  });

  test('TC-005 — Save with no field changes closes modal without side effects', async ({
    page,
  }) => {
    const programName = uniqueName('Data Science Fundamentals');
    const description = 'Introductory statistics and Python';

    await createProgram(page, programName, description);
    const rowsBefore = await programInList(page, programName).count();

    await openEditProgramModal(page, programName);
    await saveButton(page).click();

    await expect(editProgramModal(page)).toBeHidden();
    await expect(programInList(page, programName)).toHaveCount(rowsBefore);
    await expect(programDescriptionInRow(page, programName)).toHaveText(description);
  });

  test('TC-006 — Editing one program does not alter other programs', async ({ page }) => {
    const programA = uniqueName('Web Development 2026');
    const programB = uniqueName('Cloud Engineering 2026');
    const updatedDescription = 'Modern full-stack curriculum';

    await createProgram(page, programA, 'Original A description');
    await createProgram(page, programB, 'AWS and Azure fundamentals');

    await openEditProgramModal(page, programA);
    await editDescriptionField(page).fill(updatedDescription);
    await saveButton(page).click();

    await expect(programInList(page, programA).first()).toBeVisible();
    await expect(programDescriptionInRow(page, programA)).toHaveText(updatedDescription);
    await expect(programInList(page, programB).first()).toBeVisible();
    await expect(programDescriptionInRow(page, programB)).toHaveText('AWS and Azure fundamentals');
  });
});

test.describe('Negative Flows', () => {
  test('TC-007 — Empty Program Name prevents save', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Full-stack web development program');
    await openEditProgramModal(page, programName);
    await editProgramNameField(page).fill('');

    await expect(saveButton(page)).toBeDisabled();
    await expect(editProgramModal(page)).toBeVisible();
    await expect(programInList(page, programName).first()).toBeVisible();
  });

  test('TC-008 — Whitespace-only Program Name does not save', async ({ page }) => {
    const programName = uniqueName('Cybersecurity 2026');

    await createProgram(page, programName, 'Security fundamentals');
    await openEditProgramModal(page, programName);
    await editProgramNameField(page).fill('   ');

    await expect(saveButton(page)).toBeDisabled();
    await expect(programInList(page, programName).first()).toBeVisible();
  });

  test('TC-009 — Canceling edit discards unsaved changes', async ({ page }) => {
    const programName = uniqueName('UX Design 2026');
    const description = 'Human-centered design principles';

    await createProgram(page, programName, description);
    await openEditProgramModal(page, programName);
    await editProgramNameField(page).fill(`${programName} - Draft`);
    await editDescriptionField(page).fill('Should not be saved');
    await closeEditModalWithoutSubmit(page);

    await expect(programInList(page, programName).first()).toBeVisible();
    await expect(programDescriptionInRow(page, programName)).toHaveText(description);

    await openEditProgramModal(page, programName);
    await expect(editProgramNameField(page)).toHaveValue(programName);
    await expect(editDescriptionField(page)).toHaveValue(description);
  });

  test('TC-010 — Viewer role cannot edit programs', async () => {
    test.skip(true, 'Viewer credentials not configured in .env');
  });

  test('TC-011 — Renaming to an existing program name is rejected or handled per business rules', async ({
    page,
  }) => {
    const alphaProgram = uniqueName('Alpha Program');
    const betaProgram = uniqueName('Beta Program');

    await createProgram(page, alphaProgram, 'Alpha description');
    await createProgram(page, betaProgram, 'Beta description');

    await openEditProgramModal(page, betaProgram);
    await editProgramNameField(page).fill(alphaProgram);
    await saveButton(page).click();

    // Requirement: duplicate names must not be silently accepted on edit.
    await expect(programInList(page, alphaProgram)).toHaveCount(1);
    await expect(programInList(page, betaProgram)).toHaveCount(1);
    await expect(editProgramModal(page)).toBeVisible();
  });

  test('TC-012 — Failed save does not update the list optimistically', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const updatedName = `${programName} - Updated`;

    await createProgram(page, programName, 'Full-stack web development program');

    await page.route('**/*', async (route) => {
      const request = route.request();
      if (request.method() === 'PUT' && /program/i.test(request.url())) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        });
        return;
      }
      if (request.method() === 'PATCH' && /program/i.test(request.url())) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        });
        return;
      }
      await route.continue();
    });

    await openEditProgramModal(page, programName);
    await editProgramNameField(page).fill(updatedName);
    await saveButton(page).click();

    await expect(editProgramModal(page)).toBeVisible();
    await expect(editProgramNameField(page)).toHaveValue(updatedName);
    await expect(programInList(page, programName).first()).toBeVisible();
    await expect(programInList(page, updatedName)).toHaveCount(0);
  });

  test('TC-013 — Rapid double-click on Save does not create duplicates or corrupt data', async ({
    page,
  }) => {
    const programName = uniqueName('Web Development 2026');
    const updatedDescription = 'Updated description';

    await createProgram(page, programName, 'Original description');
    await openEditProgramModal(page, programName);
    await editDescriptionField(page).fill(updatedDescription);
    await saveButton(page).dblclick();

    await expect(editProgramModal(page)).toBeHidden({ timeout: 15000 });
    await expect(programInList(page, programName)).toHaveCount(1);
    await expect(programDescriptionInRow(page, programName)).toHaveText(updatedDescription);
  });
});

test.describe('Edge Cases', () => {
  test('TC-014 — Program Name at maximum allowed length saves successfully', async ({ page }) => {
    const programName = uniqueName('Max Length Edit');
    const suffix = String(Date.now());
    const maxName = `${'W'.repeat(Math.max(1, 255 - suffix.length - 1))} ${suffix}`;

    await createProgram(page, programName, 'Before max length edit');
    await openEditProgramModal(page, programName);
    await editProgramNameField(page).fill(maxName);
    await saveButton(page).click();

    await expect(editProgramModal(page)).toBeHidden();
    await expect(programInList(page, maxName).first()).toBeVisible();
  });

  test('TC-015 — Program Name exceeding max length is rejected', async ({ page }) => {
    const programName = uniqueName('Over Max Edit');
    const overMaxName = 'W'.repeat(256);

    await createProgram(page, programName, 'Over max length attempt');
    await openEditProgramModal(page, programName);
    await editProgramNameField(page).fill(overMaxName);

    await expect(saveButton(page)).toBeDisabled();
    await expect(programInList(page, overMaxName)).toHaveCount(0);
  });

  test('TC-016 — Description at maximum allowed length saves successfully', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const maxDescription = 'D'.repeat(2000);

    await createProgram(page, programName, 'Initial description');
    await openEditProgramModal(page, programName);
    await editDescriptionField(page).fill(maxDescription);
    await saveButton(page).click();

    await expect(editProgramModal(page)).toBeHidden();
    await openEditProgramModal(page, programName);
    await expect(editDescriptionField(page)).toHaveValue(maxDescription);
  });

  test('TC-016b — Description exceeding max length is rejected on edit', async ({ page }) => {
    const programName = uniqueName('Description Over Max Edit');
    const overMaxDescription = 'D'.repeat(2001);

    await createProgram(page, programName, 'Initial description');
    await openEditProgramModal(page, programName);
    await editDescriptionField(page).fill(overMaxDescription);

    await expect(saveButton(page)).toBeDisabled();
    await expect(programDescriptionInRow(page, programName)).not.toHaveText(overMaxDescription);
  });

  test('TC-017 — Special characters in Program Name and Description are handled safely', async ({
    page,
  }) => {
    const originalName = uniqueName('Web Development 2026');
    const specialName = `C++ & C# Development (2026) ${Date.now()}`;
    const specialDescription = 'Covers O\'Reilly-style topics: <tags>, "quotes", & ampersands';

    await createProgram(page, originalName, 'Initial');
    await openEditProgramModal(page, originalName);
    await editProgramNameField(page).fill(specialName);
    await editDescriptionField(page).fill(specialDescription);
    await saveButton(page).click();

    await expect(programInList(page, specialName).first()).toBeVisible();
    await expect(programDescriptionInRow(page, specialName)).toHaveText(specialDescription);
  });

  test('TC-018 — Unicode and emoji in fields are supported', async ({ page }) => {
    const originalName = uniqueName('Web Development 2026');
    const unicodeName = `Développement Web 2026 🎓 ${Date.now()}`;
    const unicodeDescription = 'Programme bilingue — français/English';

    await createProgram(page, originalName, 'Initial');
    await openEditProgramModal(page, originalName);
    await editProgramNameField(page).fill(unicodeName);
    await editDescriptionField(page).fill(unicodeDescription);
    await saveButton(page).click();

    await expect(programInList(page, unicodeName).first()).toBeVisible();
    await expect(programDescriptionInRow(page, unicodeName)).toHaveText(unicodeDescription);
  });

  test('TC-019 — Leading and trailing whitespace is trimmed or rejected consistently', async ({
    page,
  }) => {
    const coreName = uniqueName('Web Development 2026');
    const paddedName = `  ${coreName}  `;

    await createProgram(page, coreName, 'Whitespace trim test');
    await openEditProgramModal(page, coreName);
    await editProgramNameField(page).fill(paddedName);
    await saveButton(page).click();

    await expect(editProgramModal(page)).toBeHidden();
    await expect(programInList(page, coreName)).toHaveCount(1);
    await expect(programInList(page, paddedName)).toHaveCount(0);
  });

  test('TC-020 — Description can be cleared to empty on edit', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Full-stack web development program');
    await openEditProgramModal(page, programName);
    await editDescriptionField(page).fill('');
    await saveButton(page).click();

    await expect(editProgramModal(page)).toBeHidden();
    await expect(programInList(page, programName).first()).toBeVisible();
    await expect(programInList(page, programName).first().locator('td p')).toHaveCount(1);

    await openEditProgramModal(page, programName);
    await expect(editDescriptionField(page)).toHaveValue('');
  });

  test('TC-021 — Minimum-length Program Name (single character) saves if allowed', async ({
    page,
  }) => {
    const programName = uniqueName('QA Boundary Test Program');
    const singleCharName = String.fromCharCode(65 + (Date.now() % 26));

    await createProgram(page, programName, 'Boundary test');
    await openEditProgramModal(page, programName);
    await editProgramNameField(page).fill(singleCharName);
    await saveButton(page).click();

    await expect(editProgramModal(page)).toBeHidden();
    await expect(programInList(page, singleCharName).first()).toBeVisible();
  });

  test('TC-023 — HTML/script injection in Description is sanitized', async ({ page }) => {
    const programName = uniqueName('Secure Coding 2026');
    const maliciousDescription = "<script>alert('xss')</script><img src=x onerror=alert(1)>";

    page.on('dialog', (dialog) => {
      throw new Error(`Unexpected dialog: ${dialog.message()}`);
    });

    await createProgram(page, programName, 'Safe baseline');
    await openEditProgramModal(page, programName);
    await editDescriptionField(page).fill(maliciousDescription);
    await saveButton(page).click();

    await expect(editProgramModal(page)).toBeHidden();
    await expect(programInList(page, programName).first()).toBeVisible();
  });

  test('TC-025 — Edit modal includes AI Generation Config section', async ({ page }) => {
    const programName = uniqueName('AI Config Edit Test');

    await createProgram(page, programName, 'AI config visibility test');
    await openEditProgramModal(page, programName);

    await expect(editProgramModal(page).getByText('▸ Show AI Generation Config')).toBeVisible();
    await expect(editProgramModal(page).getByText('Total Program Hours')).toBeVisible();
    await expect(editProgramModal(page).getByText('Default Session Hours')).toBeVisible();
    await expect(editProgramModal(page).getByText('Default Exam Hours')).toBeVisible();
    await expect(
      editProgramModal(page).getByPlaceholder('e.g. Career changers, no CS background'),
    ).toBeVisible();
    await expect(
      editProgramModal(page).getByPlaceholder(
        'e.g. Python, SQL, Machine Learning, Data Visualization',
      ),
    ).toBeVisible();
    await expect(editProgramModal(page).getByText('Sync/Async Ratio: 70% sync / 30% async')).toBeVisible();
  });

  test('TC-026 — Clicking edit button opens modal without unexpected navigation', async ({
    page,
  }) => {
    const programName = uniqueName('Row Edit Isolation');

    await createProgram(page, programName, 'Edit isolation test');
    await expect(page.getByText('Select a program to manage semesters')).toBeVisible();

    await editProgramButton(page, programName).first().click();
    await expect(editProgramModal(page)).toBeVisible();
    await expect(page).toHaveURL(/\/programs/);
  });

  test('TC-027 — Modal dismiss via X close button discards changes', async ({ page }) => {
    const programName = uniqueName('Dismiss Edit Test');
    const description = 'Original description';

    await createProgram(page, programName, description);
    await openEditProgramModal(page, programName);
    await editProgramNameField(page).fill(`${programName} - Draft`);
    await editDescriptionField(page).fill('Should not be saved');
    await closeEditModalViaX(page);

    await expect(programInList(page, programName).first()).toBeVisible();
    await expect(programInList(page, `${programName} - Draft`)).toHaveCount(0);
    await expect(programDescriptionInRow(page, programName)).toHaveText(description);
  });
});
