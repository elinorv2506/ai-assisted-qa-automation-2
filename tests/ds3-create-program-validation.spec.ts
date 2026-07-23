import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';

function uniqueName(base: string): string {
  return `${base} ${Date.now()}`;
}

test.setTimeout(60000);

test.describe('Positive Flows', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('TC-001 — Program with special characters in name is created successfully', async ({
    trackProgram,
  }) => {
    const programName = uniqueName('Informatique & IA - Niveau 2');
    const description = 'Programme avancé en informatique et intelligence artificielle';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName).first()).toBeVisible();
    await expect(programsPage.programNameCell(programName)).toHaveText(programName);
  });

  test('TC-002 — Standard valid Program Name creates program without duplicate conflict', async ({
    trackProgram,
  }) => {
    const programName = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  test('TC-003 — Program Name with leading and trailing spaces is trimmed and saved', async ({
    trackProgram,
  }) => {
    const trimmedName = uniqueName('Cloud Engineering 2026');
    const paddedName = `  ${trimmedName}  `;
    const description = 'AWS and Azure fundamentals';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(paddedName, trackProgram, { description });

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(trimmedName)).toHaveCount(1);
    await expect(programsPage.programRow(paddedName)).toHaveCount(0);
  });

  test('TC-004 — Additional allowed special characters are preserved end-to-end', async ({
    trackProgram,
  }) => {
    const programName = uniqueName('C++ & C# Dev (2026) — "Advanced"');
    const description = 'Covers C++, C#, and related tooling';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programNameCell(programName)).toHaveText(programName);
  });

  test('TC-005 — Unicode characters in Program Name are accepted', async ({ trackProgram }) => {
    const programName = uniqueName('תוכנית פיתוח אתרים 2026');
    const description = 'תיאור בעברית — full-stack program';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName).first()).toBeVisible();
  });
});

test.describe('Negative Flows', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('TC-006 — Whitespace-only Program Name is rejected and form is not submitted', async () => {
    const rowsBefore = await programsPage.programRows().count();

    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fillProgramName('   ');
    await programsPage.newProgramModal.fillDescription('Optional description text');

    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    await expect(programsPage.newProgramModal.dialog).toBeVisible();
    await expect(programsPage.programRows()).toHaveCount(rowsBefore);
  });

  test('TC-007 — Duplicate Program Name is rejected with a clear error', async ({ trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    const originalDescription = 'Full-stack web development program';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: originalDescription });
    await expect(programsPage.programRow(programName)).toHaveCount(1);

    await programsPage.openNewProgramForm();
    await programsPage.submitCreateForm({
      name: programName,
      description: 'Second attempt — different description',
    });

    await expect(programsPage.newProgramModal.duplicateNameError).toBeVisible();
    await expect(programsPage.newProgramModal.dialog).toBeVisible();
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  test('TC-008 — Empty Program Name prevents submission', async () => {
    const rowsBefore = await programsPage.programRows().count();

    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fillDescription('Description without a name');

    await expect(programsPage.newProgramModal.programNameField).toHaveValue('');
    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    await expect(programsPage.programRows()).toHaveCount(rowsBefore);
  });

  test('TC-009 — Duplicate attempt does not modify the existing program', async ({ trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    const originalDescription = 'Full-stack web development program';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: originalDescription });

    await programsPage.openNewProgramForm();
    await programsPage.submitCreateForm({
      name: programName,
      description: 'Malicious overwrite attempt',
    });

    await expect(programsPage.newProgramModal.duplicateNameError).toBeVisible();
    await expect(programsPage.programDescriptionInRow(programName)).toHaveText(originalDescription);
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  test('TC-010 — Whitespace-padded duplicate name is rejected after trimming', async ({
    trackProgram,
  }) => {
    const programName = uniqueName('Web Development 2026');
    const paddedName = `  ${programName}  `;

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, {
      description: 'Full-stack web development program',
    });

    await programsPage.openNewProgramForm();
    await programsPage.submitCreateForm({
      name: paddedName,
      description: 'Padded duplicate attempt',
    });

    await expect(programsPage.newProgramModal.duplicateNameError).toBeVisible();
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  test('TC-011 — Duplicate error preserves user input for correction', async ({ trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    const advancedName = `${programName} - Advanced`;
    const description = 'Advanced React and Node.js';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, {
      description: 'Full-stack web development program',
    });

    await programsPage.openNewProgramForm();
    await programsPage.submitCreateForm({ name: programName, description });

    await expect(programsPage.newProgramModal.duplicateNameError).toBeVisible();
    await expect(programsPage.newProgramModal.descriptionField).toHaveValue(description);

    await programsPage.newProgramModal.fillProgramName(advancedName);
    await programsPage.createProgram(advancedName, trackProgram);

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(advancedName)).toHaveCount(1);
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  test('TC-012 — Valid name is not rejected when a similar but different name exists', async ({
    trackProgram,
  }) => {
    const programName = uniqueName('Web Development 2026');
    const similarName = `${programName} - Updated`;

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, {
      description: 'Full-stack web development program',
    });

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(similarName, trackProgram, { description: 'Extended curriculum' });

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName)).toHaveCount(1);
    await expect(programsPage.programRow(similarName)).toHaveCount(1);
  });
});

test.describe('Edge Cases', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('TC-013 — Tabs and newline characters in whitespace-only name are rejected', async () => {
    const rowsBefore = await programsPage.programRows().count();

    for (const whitespaceOnly of ['\t\t', '\n\n']) {
      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fillProgramName(whitespaceOnly);
      await programsPage.newProgramModal.fillDescription('Test description');

      await expect(programsPage.newProgramModal.createButton).toBeDisabled();
      await programsPage.newProgramModal.dismiss();
    }

    await expect(programsPage.programRows()).toHaveCount(rowsBefore);
  });

  test('TC-014 — Minimum-length Program Name (single character) is accepted', async ({
    trackProgram,
  }) => {
    const programName = String.fromCharCode(65 + (Date.now() % 26));
    const description = 'Single character name boundary test';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName).last()).toBeVisible();
  });

  test('TC-015 — Program Name at maximum allowed length is accepted', async ({ trackProgram }) => {
    const maxName = 'W'.repeat(255);

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(maxName, trackProgram, { description: 'Boundary test at max length' });

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(maxName)).toHaveCount(1);
  });

  test('TC-015b — Program name exceeding maximum length is rejected', async () => {
    const overMaxName = 'W'.repeat(256);
    const rowsBefore = await programsPage.programRows().count();

    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fillProgramName(overMaxName);
    await programsPage.newProgramModal.fillDescription('Over max length attempt');

    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    await expect(programsPage.programRow(overMaxName)).toHaveCount(0);
    await expect(programsPage.programRows()).toHaveCount(rowsBefore);
  });

  test('TC-016 — Duplicate detection is case-sensitive (or per documented rule)', async ({
    trackProgram,
  }) => {
    const suffix = Date.now();
    const programName = `Web Development 2026 ${suffix}`;
    const lowercaseName = `web development 2026 ${suffix}`;

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, {
      description: 'Full-stack web development program',
    });

    await programsPage.openNewProgramForm();
    const response = await programsPage.submitCreateForm({
      name: lowercaseName,
      description: 'Lowercase duplicate test',
    });

    if (response.ok()) {
      const body = await response.json();
      if (body?.data?.id) {
        trackProgram(body.data.id);
      }
      await expect(programsPage.programRow(programName)).toHaveCount(1);
      await expect(programsPage.programRow(lowercaseName)).toHaveCount(1);
    } else {
      await expect(programsPage.newProgramModal.duplicateNameError).toBeVisible();
      await expect(programsPage.programRow(programName)).toHaveCount(1);
      await expect(programsPage.programRow(lowercaseName)).toHaveCount(0);
    }
  });

  test('TC-017 — Internal multiple spaces in valid name are preserved', async ({ trackProgram }) => {
    const programName = `Data  Science  2026 ${Date.now()}`;
    const description = 'Internal spacing test';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programNameCell(programName)).toHaveText(programName);
  });

  test('TC-018 — Rapid double-click on Create does not bypass duplicate validation', async ({
    trackProgram,
  }) => {
    const programName = uniqueName('Mobile App Development 2025');

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, {
      description: 'Original mobile program',
    });

    await programsPage.openNewProgramForm();
    await programsPage.submitCreateForm({
      name: programName,
      description: 'Duplicate double-click test',
      submit: () => programsPage.newProgramModal.doubleClickCreate(),
    });

    await expect(programsPage.newProgramModal.duplicateNameError).toBeVisible();
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  test('TC-019 — Special characters in name do not bypass duplicate check', async ({
    trackProgram,
  }) => {
    const programName = uniqueName('Informatique & IA - Niveau 2');

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, {
      description: 'Programme avancé en informatique et intelligence artificielle',
    });

    await programsPage.openNewProgramForm();
    await programsPage.submitCreateForm({
      name: programName,
      description: 'Duplicate special char test',
    });

    await expect(programsPage.newProgramModal.duplicateNameError).toBeVisible();
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  test('TC-020 — Whitespace-only name with filled Description does not create a program', async () => {
    const rowsBefore = await programsPage.programRows().count();

    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fillProgramName('     ');
    await programsPage.newProgramModal.fillDescription('Full-stack web development program');

    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    await expect(programsPage.programRows()).toHaveCount(rowsBefore);
  });
});
