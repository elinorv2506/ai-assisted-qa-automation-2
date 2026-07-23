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

  test('TC-001 — Edit form opens with current program data pre-filled', async ({ trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });
    await programsPage.openEditProgramModal(programName);

    await expect(programsPage.editProgramModal.programNameField).toHaveValue(programName);
    await expect(programsPage.editProgramModal.descriptionField).toHaveValue(description);
    await expect(programsPage.editProgramModal.saveButton).toBeEnabled();
  });

  test('TC-002 — Program name update is saved and reflected in the list immediately', async ({
    trackProgram,
  }) => {
    const programName = uniqueName('Web Development 2026');
    const updatedName = `${programName} - Updated`;

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, {
      description: 'Full-stack web development program',
    });
    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillProgramName(updatedName);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.editProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(updatedName).first()).toBeVisible();
    await expect(programsPage.programRow(programName)).toHaveCount(0);
  });

  test('TC-003 — Unchanged fields remain intact when only Description is edited', async ({
    trackProgram,
  }) => {
    const programName = uniqueName('Web Development 2026');
    const originalDescription = 'Full-stack web development program';
    const updatedDescription = 'Full-stack web development program — updated curriculum';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: originalDescription });
    await programsPage.openEditProgramModal(programName);
    await expect(programsPage.editProgramModal.programNameField).toHaveValue(programName);
    await programsPage.editProgramModal.fillDescription(updatedDescription);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.editProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName).first()).toBeVisible();
    await expect(programsPage.programDescriptionInRow(programName)).toHaveText(updatedDescription);

    await programsPage.openEditProgramModal(programName);
    await expect(programsPage.editProgramModal.programNameField).toHaveValue(programName);
    await expect(programsPage.editProgramModal.descriptionField).toHaveValue(updatedDescription);
  });

  test('TC-004 — Both Program Name and Description can be updated in one save', async ({
    trackProgram,
  }) => {
    const programName = uniqueName('Mobile App Development 2025');
    const updatedName = `${programName} - Revised`;
    const updatedDescription = 'Cross-platform mobile development with React Native';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, {
      description: 'iOS and Android development track',
    });
    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillProgramName(updatedName);
    await programsPage.editProgramModal.fillDescription(updatedDescription);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.editProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(updatedName).first()).toBeVisible();
    await expect(programsPage.programDescriptionInRow(updatedName)).toHaveText(updatedDescription);

    await programsPage.openEditProgramModal(updatedName);
    await expect(programsPage.editProgramModal.programNameField).toHaveValue(updatedName);
    await expect(programsPage.editProgramModal.descriptionField).toHaveValue(updatedDescription);
  });

  test('TC-005 — Save with no field changes closes modal without side effects', async ({
    trackProgram,
  }) => {
    const programName = uniqueName('Data Science Fundamentals');
    const description = 'Introductory statistics and Python';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });
    const rowsBefore = await programsPage.programRow(programName).count();

    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.editProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName)).toHaveCount(rowsBefore);
    await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
  });

  test('TC-006 — Editing one program does not alter other programs', async ({ trackProgram }) => {
    const programA = uniqueName('Web Development 2026');
    const programB = uniqueName('Cloud Engineering 2026');
    const updatedDescription = 'Modern full-stack curriculum';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programA, trackProgram, { description: 'Original A description' });
    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programB, trackProgram, { description: 'AWS and Azure fundamentals' });

    await programsPage.openEditProgramModal(programA);
    await programsPage.editProgramModal.fillDescription(updatedDescription);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.programRow(programA).first()).toBeVisible();
    await expect(programsPage.programDescriptionInRow(programA)).toHaveText(updatedDescription);
    await expect(programsPage.programRow(programB).first()).toBeVisible();
    await expect(programsPage.programDescriptionInRow(programB)).toHaveText('AWS and Azure fundamentals');
  });
});

test.describe('Negative Flows', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('TC-007 — Empty Program Name prevents save', async ({ trackProgram }) => {
    const programName = uniqueName('Web Development 2026');

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, {
      description: 'Full-stack web development program',
    });
    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillProgramName('');

    await expect(programsPage.editProgramModal.saveButton).toBeDisabled();
    await expect(programsPage.editProgramModal.dialog).toBeVisible();
    await expect(programsPage.programRow(programName).first()).toBeVisible();
  });

  test('TC-008 — Whitespace-only Program Name does not save', async ({ trackProgram }) => {
    const programName = uniqueName('Cybersecurity 2026');

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: 'Security fundamentals' });
    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillProgramName('   ');

    await expect(programsPage.editProgramModal.saveButton).toBeDisabled();
    await expect(programsPage.programRow(programName).first()).toBeVisible();
  });

  test('TC-009 — Canceling edit discards unsaved changes', async ({ trackProgram }) => {
    const programName = uniqueName('UX Design 2026');
    const description = 'Human-centered design principles';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });
    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillProgramName(`${programName} - Draft`);
    await programsPage.editProgramModal.fillDescription('Should not be saved');
    await programsPage.editProgramModal.dismiss();

    await expect(programsPage.programRow(programName).first()).toBeVisible();
    await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);

    await programsPage.openEditProgramModal(programName);
    await expect(programsPage.editProgramModal.programNameField).toHaveValue(programName);
    await expect(programsPage.editProgramModal.descriptionField).toHaveValue(description);
  });

  test('TC-010 — Viewer role cannot edit programs', async () => {
    test.skip(true, 'Viewer credentials not configured in .env');
  });

  test('TC-011 — Renaming to an existing program name is rejected or handled per business rules', async ({
    trackProgram,
  }) => {
    const alphaProgram = uniqueName('Alpha Program');
    const betaProgram = uniqueName('Beta Program');

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(alphaProgram, trackProgram, { description: 'Alpha description' });
    await programsPage.openNewProgramForm();
    await programsPage.createProgram(betaProgram, trackProgram, { description: 'Beta description' });

    await programsPage.openEditProgramModal(betaProgram);
    await programsPage.editProgramModal.fillProgramName(alphaProgram);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.programRow(alphaProgram)).toHaveCount(1);
    await expect(programsPage.programRow(betaProgram)).toHaveCount(1);
    await expect(programsPage.editProgramModal.dialog).toBeVisible();
  });

  test('TC-012 — Failed save does not update the list optimistically', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('Web Development 2026');
    const updatedName = `${programName} - Updated`;

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, {
      description: 'Full-stack web development program',
    });

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

    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillProgramName(updatedName);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.editProgramModal.dialog).toBeVisible();
    await expect(programsPage.editProgramModal.programNameField).toHaveValue(updatedName);
    await expect(programsPage.programRow(programName).first()).toBeVisible();
    await expect(programsPage.programRow(updatedName)).toHaveCount(0);
  });

  test('TC-013 — Rapid double-click on Save does not create duplicates or corrupt data', async ({
    trackProgram,
  }) => {
    const programName = uniqueName('Web Development 2026');
    const updatedDescription = 'Updated description';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: 'Original description' });
    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillDescription(updatedDescription);
    await programsPage.editProgramModal.doubleClickSave();

    await expect(programsPage.editProgramModal.dialog).toBeHidden({ timeout: 15000 });
    await expect(programsPage.programRow(programName)).toHaveCount(1);
    await expect(programsPage.programDescriptionInRow(programName)).toHaveText(updatedDescription);
  });
});

test.describe('Edge Cases', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('TC-014 — Program Name at maximum allowed length saves successfully', async ({ trackProgram }) => {
    const programName = uniqueName('Max Length Edit');
    const suffix = String(Date.now());
    const maxName = `${'W'.repeat(Math.max(1, 255 - suffix.length - 1))} ${suffix}`;

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: 'Before max length edit' });
    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillProgramName(maxName);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.editProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(maxName).first()).toBeVisible();
  });

  test('TC-015 — Program Name exceeding max length is rejected', async ({ trackProgram }) => {
    const programName = uniqueName('Over Max Edit');
    const overMaxName = 'W'.repeat(256);

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: 'Over max length attempt' });
    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillProgramName(overMaxName);

    await expect(programsPage.editProgramModal.saveButton).toBeDisabled();
    await expect(programsPage.programRow(overMaxName)).toHaveCount(0);
  });

  test('TC-016 — Description at maximum allowed length saves successfully', async ({ trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    const maxDescription = 'D'.repeat(2000);

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: 'Initial description' });
    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillDescription(maxDescription);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.editProgramModal.dialog).toBeHidden();
    await programsPage.openEditProgramModal(programName);
    await expect(programsPage.editProgramModal.descriptionField).toHaveValue(maxDescription);
  });

  test('TC-016b — Description exceeding max length is rejected on edit', async ({ trackProgram }) => {
    const programName = uniqueName('Description Over Max Edit');
    const overMaxDescription = 'D'.repeat(2001);

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: 'Initial description' });
    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillDescription(overMaxDescription);

    await expect(programsPage.editProgramModal.saveButton).toBeDisabled();
    await expect(programsPage.programDescriptionInRow(programName)).not.toHaveText(overMaxDescription);
  });

  test('TC-017 — Special characters in Program Name and Description are handled safely', async ({
    trackProgram,
  }) => {
    const originalName = uniqueName('Web Development 2026');
    const specialName = `C++ & C# Development (2026) ${Date.now()}`;
    const specialDescription = 'Covers O\'Reilly-style topics: <tags>, "quotes", & ampersands';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(originalName, trackProgram, { description: 'Initial' });
    await programsPage.openEditProgramModal(originalName);
    await programsPage.editProgramModal.fillProgramName(specialName);
    await programsPage.editProgramModal.fillDescription(specialDescription);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.programRow(specialName).first()).toBeVisible();
    await expect(programsPage.programDescriptionInRow(specialName)).toHaveText(specialDescription);
  });

  test('TC-018 — Unicode and emoji in fields are supported', async ({ trackProgram }) => {
    const originalName = uniqueName('Web Development 2026');
    const unicodeName = `Développement Web 2026 🎓 ${Date.now()}`;
    const unicodeDescription = 'Programme bilingue — français/English';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(originalName, trackProgram, { description: 'Initial' });
    await programsPage.openEditProgramModal(originalName);
    await programsPage.editProgramModal.fillProgramName(unicodeName);
    await programsPage.editProgramModal.fillDescription(unicodeDescription);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.programRow(unicodeName).first()).toBeVisible();
    await expect(programsPage.programDescriptionInRow(unicodeName)).toHaveText(unicodeDescription);
  });

  test('TC-019 — Leading and trailing whitespace is trimmed or rejected consistently', async ({
    trackProgram,
  }) => {
    const coreName = uniqueName('Web Development 2026');
    const paddedName = `  ${coreName}  `;

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(coreName, trackProgram, { description: 'Whitespace trim test' });
    await programsPage.openEditProgramModal(coreName);
    await programsPage.editProgramModal.fillProgramName(paddedName);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.editProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(coreName)).toHaveCount(1);
    await expect(programsPage.programRow(paddedName)).toHaveCount(0);
  });

  test('TC-020 — Description can be cleared to empty on edit', async ({ trackProgram }) => {
    const programName = uniqueName('Web Development 2026');

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, {
      description: 'Full-stack web development program',
    });
    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillDescription('');
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.editProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName).first()).toBeVisible();
    await expect(programsPage.programCellParagraphs(programName)).toHaveCount(1);

    await programsPage.openEditProgramModal(programName);
    await expect(programsPage.editProgramModal.descriptionField).toHaveValue('');
  });

  test('TC-021 — Minimum-length Program Name (single character) saves if allowed', async ({
    trackProgram,
  }) => {
    const programName = uniqueName('QA Boundary Test Program');
    const singleCharName = String.fromCharCode(65 + (Date.now() % 26));

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: 'Boundary test' });
    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillProgramName(singleCharName);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.editProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(singleCharName).first()).toBeVisible();
  });

  test('TC-023 — HTML/script injection in Description is sanitized', async ({ page, trackProgram }) => {
    const programName = uniqueName('Secure Coding 2026');
    const maliciousDescription = "<script>alert('xss')</script><img src=x onerror=alert(1)>";

    page.on('dialog', (dialog) => {
      throw new Error(`Unexpected dialog: ${dialog.message()}`);
    });

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: 'Safe baseline' });
    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillDescription(maliciousDescription);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.editProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName).first()).toBeVisible();
  });

  test('TC-025 — Edit modal includes AI Generation Config section', async ({ trackProgram }) => {
    const programName = uniqueName('AI Config Edit Test');

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: 'AI config visibility test' });
    await programsPage.openEditProgramModal(programName);

    await expect(programsPage.editProgramModal.showAiConfigToggle).toBeVisible();
    await expect(programsPage.editProgramModal.totalProgramHoursLabel).toBeVisible();
    await expect(programsPage.editProgramModal.defaultSessionHoursLabel).toBeVisible();
    await expect(programsPage.editProgramModal.defaultExamHoursLabel).toBeVisible();
    await expect(programsPage.editProgramModal.targetAudienceField).toBeVisible();
    await expect(programsPage.editProgramModal.focusAreasField).toBeVisible();
    await expect(programsPage.editProgramModal.syncAsyncRatioText).toBeVisible();
  });

  test('TC-026 — Clicking edit button opens modal without unexpected navigation', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('Row Edit Isolation');

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: 'Edit isolation test' });
    await expect(programsPage.selectProgramPrompt).toBeVisible();

    await programsPage.editProgramButton(programName).first().click();
    await expect(programsPage.editProgramModal.dialog).toBeVisible();
    await expect(page).toHaveURL(/\/programs/);
  });

  test('TC-027 — Modal dismiss via X close button discards changes', async ({ trackProgram }) => {
    const programName = uniqueName('Dismiss Edit Test');
    const description = 'Original description';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });
    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillProgramName(`${programName} - Draft`);
    await programsPage.editProgramModal.fillDescription('Should not be saved');
    await programsPage.editProgramModal.closeViaX();

    await expect(programsPage.programRow(programName).first()).toBeVisible();
    await expect(programsPage.programRow(`${programName} - Draft`)).toHaveCount(0);
    await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
  });
});
