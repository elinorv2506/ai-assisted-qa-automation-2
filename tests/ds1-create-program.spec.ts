import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';

function uniqueName(base: string): string {
  return `${base} ${Date.now()}`;
}

test.describe('Positive Flows', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('TC-001 — Program creation form displays required fields', async () => {
    await programsPage.openNewProgramForm();

    // Jira AC: "I see the program creation form with fields: Program Name, Description"
    await expect(programsPage.newProgramModal.programNameField).toBeVisible();
    await expect(programsPage.newProgramModal.programNameField).toBeEditable();
    await expect(programsPage.newProgramModal.descriptionField).toBeVisible();
    await expect(programsPage.newProgramModal.descriptionField).toBeEditable();
    await expect(programsPage.newProgramModal.createButton).toBeVisible();
  });

  test('TC-002 — Program is created and appears in the list', async ({ trackProgram }) => {
    // Jira AC uses exact values: "Web Development 2026" / "Full-stack web development program"
    const programName = 'Web Development 2026';
    const description = 'Full-stack web development program';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });

    // Jira AC: "the modal closes" and "the program list shows Web Development 2026"
    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName).first()).toBeVisible();
  });

  test('TC-003 — Program can be created with Program Name only', async ({ trackProgram }) => {
    const programName = uniqueName('Data Science Fundamentals');

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram);

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName)).toBeVisible();
    await expect(programsPage.programNameCell(programName)).toHaveText(programName);
  });

  test('TC-004 — Create button is enabled when Program Name has valid input', async () => {
    const programName = uniqueName('Cybersecurity 2026');

    await programsPage.openNewProgramForm();
    await expect(programsPage.newProgramModal.createButton).toBeDisabled();

    await programsPage.newProgramModal.fillProgramName(programName);
    await expect(programsPage.newProgramModal.createButton).toBeEnabled();
  });

  test('TC-005 — New program appears without disrupting existing list entries', async ({ trackProgram }) => {
    const existingProgram = uniqueName('Mobile App Development 2025');
    const newProgram = uniqueName('Cloud Engineering 2026');
    const description = 'AWS and Azure fundamentals';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(existingProgram, trackProgram, { description: 'Existing program seed' });
    await expect(programsPage.programRow(existingProgram)).toBeVisible();

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(newProgram, trackProgram, { description });

    await expect(programsPage.programRow(newProgram)).toBeVisible();
    await expect(programsPage.programRow(existingProgram)).toBeVisible();
  });
});

test.describe('Negative Flows', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('TC-006 — Empty Program Name keeps Create disabled', async () => {
    await programsPage.openNewProgramForm();

    // Jira AC: "I leave the Program Name field empty" → "Create button is disabled"
    await expect(programsPage.newProgramModal.programNameField).toHaveValue('');
    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    await expect(programsPage.newProgramModal.dialog).toBeVisible();
  });

  test('TC-007 — Whitespace-only Program Name does not enable Create', async () => {
    const programName = uniqueName('Whitespace Guard');

    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fillProgramName('   ');
    await programsPage.newProgramModal.fillDescription('Optional description text');

    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    await expect(programsPage.programRow(programName)).toHaveCount(0);
  });

  test('TC-009 — Cancel/close does not create a program', async () => {
    const programName = uniqueName('UX Design 2026');
    const description = 'Human-centered design principles';

    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fillProgramName(programName);
    await programsPage.newProgramModal.fillDescription(description);
    await programsPage.newProgramModal.dismiss();

    await expect(programsPage.programRow(programName)).toHaveCount(0);
  });

  test('TC-010 — Duplicate program name is rejected or handled per business rules', async ({ trackProgram }) => {
    const programName = uniqueName('Web Development 2026');

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: 'Original program' });
    await expect(programsPage.programRow(programName)).toHaveCount(1);

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: 'Duplicate attempt description' });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 15000 });

    // Requirement: duplicate must not be silently accepted — only one entry allowed.
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  test('TC-011 — Create does not succeed on network/server failure', async ({ page }) => {
    const programName = uniqueName('AI Engineering 2026');
    const description = 'Machine learning and NLP';

    await page.route('**/*', async (route) => {
      const request = route.request();
      if (request.method() === 'POST' && /program/i.test(request.url())) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        });
        return;
      }
      await route.continue();
    });

    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fillProgramName(programName);
    await programsPage.newProgramModal.fillDescription(description);
    await programsPage.newProgramModal.clickCreate();

    await expect(programsPage.newProgramModal.dialog).toBeVisible();
    await expect(programsPage.newProgramModal.programNameField).toHaveValue(programName);
    await expect(programsPage.newProgramModal.descriptionField).toHaveValue(description);
    await expect(programsPage.programRow(programName)).toHaveCount(0);
  });
});

test.describe('Edge Cases', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('TC-012 — Minimum-length Program Name (single character)', async ({ trackProgram }) => {
    const programName = String.fromCharCode(65 + (Date.now() % 26));
    const description = `Single letter program name test ${Date.now()}`;

    await expect(programsPage.firstProgramRow()).toBeVisible();
    const rowsBefore = await programsPage.programRows().count();

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });

    await expect(programsPage.programRows()).toHaveCount(rowsBefore + 1);
    await expect(programsPage.programRow(programName).last()).toBeVisible();
  });

  test('TC-013 — Maximum-length Program Name boundary', async ({ trackProgram }) => {
    const maxName = `${'W'.repeat(255)} ${Date.now()}`;
    const overMaxName = `${'W'.repeat(256)} ${Date.now()}`;

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(maxName, trackProgram, { description: 'Boundary test at max length' });
    await expect(programsPage.programRow(maxName)).toHaveCount(1);

    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fillProgramName(overMaxName);
    await programsPage.newProgramModal.fillDescription('Over max length attempt');

    // Requirement: names exceeding max length must be rejected — not silently saved.
    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    await expect(programsPage.programRow(overMaxName)).toHaveCount(0);
  });

  test('TC-014 — Maximum-length Description boundary', async ({ trackProgram }) => {
    const programName = uniqueName('Blockchain Basics 2026');
    const maxDescription = 'D'.repeat(2000);
    const overMaxDescription = 'D'.repeat(2001);
    const overflowName = uniqueName('Blockchain Basics 2026 overflow');

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: maxDescription });
    await expect(programsPage.programRow(programName)).toHaveCount(1);

    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fillProgramName(overflowName);
    await programsPage.newProgramModal.fillDescription(overMaxDescription);

    // Requirement: descriptions exceeding max length must be rejected.
    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    await expect(programsPage.programRow(overflowName)).toHaveCount(0);
  });

  test('TC-015 — Special characters in Program Name', async ({ trackProgram }) => {
    const programName = uniqueName('C++ & C# Dev (2026) — "Advanced"');
    const description = 'Covers C++, C#, and related tooling';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });

    await expect(programsPage.programRow(programName)).toBeVisible();
  });

  test('TC-016 — Unicode and emoji in Program Name and Description', async ({ trackProgram }) => {
    const programName = uniqueName('תוכנית פיתוח אתרים 2026 🎓');
    const description = 'תיאור בעברית — full-stack program';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });

    await expect(programsPage.programRow(programName)).toBeVisible();
  });

  test('TC-017 — Leading and trailing whitespace in Program Name', async ({ trackProgram }) => {
    const coreName = uniqueName('Game Development 2026');
    const paddedName = `  ${coreName}  `;
    const description = 'Unity and Unreal basics';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(paddedName, trackProgram, { description });

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    // Requirement: leading/trailing whitespace must be trimmed on save.
    await expect(programsPage.programRow(coreName)).toHaveCount(1);
    await expect(programsPage.programRow(paddedName)).toHaveCount(0);
  });

  test('TC-018 — HTML/script injection in Description', async ({ page, trackProgram }) => {
    const programName = uniqueName('Secure Coding 2026');
    const maliciousDescription = "<script>alert('xss')</script><img src=x onerror=alert(1)>";

    page.on('dialog', (dialog) => {
      throw new Error(`Unexpected dialog: ${dialog.message()}`);
    });

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description: maliciousDescription });

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName)).toBeVisible();
  });

  test('TC-019 — Rapid double-click on Create', async ({ trackProgram }) => {
    const programName = uniqueName('DevOps Pipeline 2026');
    const description = 'CI/CD and infrastructure as code';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, {
      description,
      submit: () => programsPage.newProgramModal.doubleClickCreate(),
      trackAllCreates: true,
    });

    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 15000 });
    // Requirement: only one program must be created on double-click (idempotent submit).
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  test('TC-020 — Program list sort/order after creation', async ({ trackProgram }) => {
    const programName = uniqueName('Quantum Computing Intro 2026');
    const description = 'Qubits and algorithms overview';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });

    await expect(programsPage.programRow(programName)).toHaveCount(1);
    await expect(programsPage.firstProgramNameText(programName)).toBeVisible();
  });

  test('TC-021 — AI Generation Config section displays with defaults', async () => {
    await programsPage.openNewProgramForm();

    await expect(programsPage.newProgramModal.showAiConfigToggle).toBeVisible();
    await expect(programsPage.newProgramModal.totalProgramHoursLabel).toBeVisible();
    await expect(programsPage.newProgramModal.defaultSessionHoursLabel).toBeVisible();
    await expect(programsPage.newProgramModal.defaultExamHoursLabel).toBeVisible();
    await expect(programsPage.newProgramModal.targetAudienceField).toBeVisible();
    await expect(programsPage.newProgramModal.focusAreasField).toBeVisible();
    await expect(programsPage.newProgramModal.syncAsyncRatioText).toBeVisible();

    await expect(programsPage.newProgramModal.defaultSessionHoursInput).toHaveValue('4');
    await expect(programsPage.newProgramModal.defaultExamHoursInput).toHaveValue('3');
  });

  test('TC-022 — Programs page layout and list structure', async () => {
    await expect(programsPage.heading).toBeVisible();
    await expect(programsPage.subtitle).toBeVisible();
    await expect(programsPage.newProgramButton).toBeVisible();
    await expect(programsPage.programColumnHeader).toBeVisible();
    await expect(programsPage.selectProgramPrompt).toBeVisible();
    await expect(programsPage.firstProgramRow()).toBeVisible();
  });

  test('TC-023 — Modal dismiss via X close button', async () => {
    const programName = uniqueName('Dismiss Test 2026');

    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fillProgramName(programName);
    await programsPage.newProgramModal.fillDescription('Should not be saved');
    await programsPage.newProgramModal.closeViaX();

    await expect(programsPage.programRow(programName)).toHaveCount(0);
  });
});
