import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';

function uniqueName(base: string): string {
  return `${base} ${Date.now()}`;
}

async function createProgram(
  programsPage: ProgramsPage,
  trackProgram: (uuid: string) => void,
  name: string,
  description?: string,
): Promise<void> {
  await programsPage.openNewProgramForm();
  await programsPage.createProgram(name, trackProgram, { description });
  await expect(programsPage.programRow(name).first()).toBeVisible();
}

test.setTimeout(60000);

test.describe('Happy paths', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('TC-001 — Display program list with key details', async ({ trackProgram }) => {
    const programA = uniqueName('Web Development 2026');
    const programB = uniqueName('Cloud Engineering 2026');
    const descriptionA = 'Full-stack web development program';
    const descriptionB = 'AWS and Azure fundamentals';

    await createProgram(programsPage, trackProgram, programA, descriptionA);
    await createProgram(programsPage, trackProgram, programB, descriptionB);

    await expect(programsPage.programRow(programA).first()).toBeVisible();
    await expect(programsPage.programRow(programB).first()).toBeVisible();
    await expect(programsPage.programNameInRow(programA)).toHaveText(programA);
    await expect(programsPage.programDescriptionInRow(programA)).toHaveText(descriptionA);
    await expect(programsPage.programNameInRow(programB)).toHaveText(programB);
    await expect(programsPage.programDescriptionInRow(programB)).toHaveText(descriptionB);
  });

  test.skip('TC-002 — Empty state when no programs exist', async () => {
    // Requires zero programs in the environment; bulk API delete fixture not available in this repo.
  });

  test('TC-003 — Create action is available on populated Programs page', async ({ trackProgram }) => {
    const programName = uniqueName('Mobile App Development 2025');

    await createProgram(programsPage, trackProgram, programName, 'iOS and Android development track');

    await expect(programsPage.programRows().first()).toBeVisible();
    await expect(programsPage.newProgramButton).toBeVisible();
  });

  test.skip('TC-004 — Empty state create prompt opens program creation form', async () => {
    // Requires zero programs in the environment; bulk API delete fixture not available in this repo.
  });

  test('TC-005 — Program list data persists after refresh', async ({ page, trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';

    await createProgram(programsPage, trackProgram, programName, description);

    await page.reload();
    await programsPage.newProgramButton.waitFor({ state: 'visible' });
    await programsPage.heading.waitFor({ state: 'visible' });

    await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
    await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
  });

  test('TC-006 — Program with empty description appears in list', async ({ trackProgram }) => {
    const programName = uniqueName('Data Science Fundamentals');

    await createProgram(programsPage, trackProgram, programName);

    await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
    const paragraphCount = await programsPage.programCellParagraphs(programName).count();
    if (paragraphCount > 1) {
      await expect(programsPage.programDescriptionInRow(programName)).toHaveText('');
    } else {
      await expect(programsPage.programCellParagraphs(programName)).toHaveCount(1);
    }
  });

  test.fixme('TC-A11Y — Programs list (populated) has no accessibility violations', async ({
    page,
    trackProgram,
  }) => {
    // Blocked by app bug: accessibility violations on populated programs list
    const programName = uniqueName('A11Y List Scan');
    await createProgram(programsPage, trackProgram, programName, 'Accessibility scan seed program');

    const results = await new AxeBuilder({ page }).analyze();
    await expect(results.violations).toEqual([]);
  });
});

test.describe('Negative', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test.skip('TC-007 — No program rows when list is empty', async () => {
    // Requires zero programs in the environment; bulk API delete fixture not available in this repo.
  });

  test('TC-008 — Empty state hidden when programs exist', async ({ trackProgram }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(programsPage, trackProgram, programName, 'Full-stack web development program');

    await expect(programsPage.programRow(programName).first()).toBeVisible();
    await expect(programsPage.emptyStateMessage).toHaveCount(0);
  });

  test('TC-009 — Program name and description are not swapped in list', async ({ trackProgram }) => {
    const programName = uniqueName('Cybersecurity 2026');
    const description = 'Network security and ethical hacking fundamentals';

    await createProgram(programsPage, trackProgram, programName, description);

    await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
    await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
    await expect(programsPage.programDescriptionInRow(programName)).not.toHaveText(programName);
  });

  test('TC-010 — Deleted program is not shown in list', async ({ trackProgram }) => {
    const programToDelete = uniqueName('Test Program');
    const programToKeep = uniqueName('Web Development 2026');

    await createProgram(programsPage, trackProgram, programToDelete, 'Sample program for deletion testing');
    await createProgram(programsPage, trackProgram, programToKeep, 'Full-stack web development program');

    await programsPage.deleteWithConfirmation(programToDelete);

    await expect(programsPage.programRow(programToDelete)).toHaveCount(0);
    await expect(programsPage.programRow(programToKeep).first()).toBeVisible();
  });

  test('TC-011 — Non-admin cannot access Programs page program list', async () => {
    test.skip(true, 'Instructor/non-admin credentials not configured in .env');
  });

  test.skip('TC-012 — Load failure is not shown as successful empty state', async () => {
    // Requires route mocking of GET /api/programs; not implemented in this spec.
  });
});

test.describe('Edge cases', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('TC-013 — Single program in list', async ({ trackProgram }) => {
    const programName = uniqueName('Mobile App Development 2025');
    const description = 'iOS and Android development track';

    await createProgram(programsPage, trackProgram, programName, description);

    await expect(programsPage.programRow(programName)).toHaveCount(1);
    await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
    await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
  });

  test('TC-014 — Special characters display correctly in program list', async ({ trackProgram }) => {
    const programName = uniqueName('Informatique & IA - Niveau 2');
    const description = 'Programme avancé en informatique et intelligence artificielle';

    await createProgram(programsPage, trackProgram, programName, description);

    await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
    await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
  });

  test('TC-015 — Unicode and emoji in program list', async ({ trackProgram }) => {
    const programName = uniqueName('תוכנית פיתוח אתרים 2026 🎓');
    const description = 'Full-stack track with modern frameworks';

    await createProgram(programsPage, trackProgram, programName, description);

    await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
    await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
  });

  test('TC-016 — Max-length program name in list', async ({ trackProgram }) => {
    const maxName = 'A'.repeat(255);

    await createProgram(programsPage, trackProgram, maxName, 'Max length name display test');

    await expect(programsPage.programRow(maxName).first()).toBeVisible();
    await expect(programsPage.programNameInRow(maxName)).toHaveText(maxName);
    await expect(programsPage.programNameCell(maxName)).toBeVisible();
  });

  test('TC-017 — Long description in program list', async ({ trackProgram }) => {
    const programName = uniqueName('Long Description Program');
    const longDescription = 'B'.repeat(2000);

    await createProgram(programsPage, trackProgram, programName, longDescription);

    await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
    await expect(programsPage.programDescriptionInRow(programName)).toBeVisible();
    await expect(programsPage.programRow(programName).first()).toBeVisible();
  });

  test('TC-018 — Single-character program name in list', async ({ trackProgram }) => {
    const programName = String.fromCharCode(65 + (Date.now() % 26));
    const description = 'Single character name boundary test';

    await createProgram(programsPage, trackProgram, programName, description);

    await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
    await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
  });

  test('TC-019 — All programs appear in list', async ({ trackProgram }) => {
    const programA = uniqueName('Web Development 2026');
    const programB = uniqueName('Cloud Engineering 2026');
    const programC = uniqueName('Data Science Fundamentals');
    const programD = uniqueName('Mobile App Development 2025');

    await createProgram(programsPage, trackProgram, programA, 'Full-stack web development program');
    await createProgram(programsPage, trackProgram, programB, 'AWS and Azure fundamentals');
    await createProgram(programsPage, trackProgram, programC, 'Statistics and Python track');
    await createProgram(programsPage, trackProgram, programD, 'iOS and Android development track');

    await expect(programsPage.programRow(programA).first()).toBeVisible();
    await expect(programsPage.programRow(programB).first()).toBeVisible();
    await expect(programsPage.programRow(programC).first()).toBeVisible();
    await expect(programsPage.programRow(programD).first()).toBeVisible();
  });

  test('TC-020 — New program appears in list after create', async ({ trackProgram }) => {
    const programName = uniqueName('Quantum Computing Intro 2026');
    const description = 'Introduction to qubits and algorithms';

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName).first()).toBeVisible();
    await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
  });

  test('TC-021 — List updates after program edit', async ({ trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    const updatedName = `${programName} - Updated`;
    const updatedDescription = 'Updated full-stack curriculum';

    await createProgram(programsPage, trackProgram, programName, 'Full-stack web development program');
    await programsPage.openEditProgramModal(programName);
    await programsPage.editProgramModal.fillProgramName(updatedName);
    await programsPage.editProgramModal.fillDescription(updatedDescription);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.editProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(updatedName).first()).toBeVisible();
    await expect(programsPage.programDescriptionInRow(updatedName)).toHaveText(updatedDescription);
    await expect(programsPage.programRow(programName)).toHaveCount(0);
  });

  test.fixme('TC-022 — XSS payload in description is sanitized in list', async ({ page, trackProgram }) => {
    // Blocked by DS-205: description renders raw <script> in program list
    const programName = uniqueName('Secure Coding 2026');
    const maliciousDescription = "<script>alert('xss')</script>";

    page.on('dialog', (dialog) => {
      throw new Error(`Unexpected dialog: ${dialog.message()}`);
    });

    await createProgram(programsPage, trackProgram, programName, maliciousDescription);

    await expect(programsPage.programRow(programName).first()).toBeVisible();
    await expect(programsPage.programDescriptionInRow(programName)).not.toContainText('<script>');
    await expect(programsPage.programDescriptionInRow(programName)).not.toContainText('alert(');
  });

  test.skip('TC-023 — Empty state after last program deleted', async () => {
    // Requires an isolated environment with only one program; bulk API delete fixture not available.
  });

  test('TC-024 — No duplicate-looking rows from whitespace variants', async ({ trackProgram }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(programsPage, trackProgram, programName, 'Full-stack web development program');

    await expect(programsPage.programRow(programName)).toHaveCount(1);
    await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
    await expect(programsPage.programNameInRow(programName)).not.toHaveText(/^\s|\s$/);
  });
});
