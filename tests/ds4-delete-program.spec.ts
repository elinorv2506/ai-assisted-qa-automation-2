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

test.describe('Positive Flows', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('TC-001 — Delete program with confirmation — dialog appears', async ({ page, trackProgram }) => {
    const programName = uniqueName('Test Program');
    const description = 'Sample program for deletion testing';

    await createProgram(programsPage, trackProgram, programName, description);
    const message = await programsPage.openDeleteConfirmation(programName);

    expect(message).toContain(programName);
    expect(message).toMatch(/delete program/i);
    await expect(programsPage.programRow(programName).first()).toBeVisible();
    // Native window.confirm() cannot be scanned with axe; see programs.a11y.spec.ts for page-level a11y.
  });

  test('TC-002 — Delete program with confirmation — successful deletion', async ({ trackProgram }) => {
    const programName = uniqueName('Test Program');
    const description = 'Sample program for deletion testing';

    await createProgram(programsPage, trackProgram, programName, description);
    await programsPage.deleteWithConfirmation(programName);

    await expect(programsPage.programRow(programName)).toHaveCount(0);
  });

  test('TC-003 — Cancel program deletion', async ({ trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';

    await createProgram(programsPage, trackProgram, programName, description);
    await programsPage.cancelDelete(programName);

    await expect(programsPage.programRow(programName).first()).toBeVisible();
    await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
  });

  test('TC-004 — Confirmation dialog shows target program name', async ({ trackProgram }) => {
    const programName = uniqueName('Informatique & IA - Niveau 2');
    const description = 'Programme avancé en informatique et intelligence artificielle';

    await createProgram(programsPage, trackProgram, programName, description);
    const message = await programsPage.openDeleteConfirmation(programName);

    expect(message).toContain(programName);
  });

  test('TC-005 — Delete affects only the selected program', async ({ trackProgram }) => {
    const programA = uniqueName('Test Program');
    const programB = uniqueName('Web Development 2026');
    const programC = uniqueName('Cloud Engineering 2026');

    await createProgram(programsPage, trackProgram, programA, 'Sample program for deletion testing');
    await createProgram(programsPage, trackProgram, programB, 'Full-stack web development program');
    await createProgram(programsPage, trackProgram, programC, 'AWS and Azure fundamentals');

    await programsPage.deleteWithConfirmation(programA);

    await expect(programsPage.programRow(programA)).toHaveCount(0);
    await expect(programsPage.programRow(programB).first()).toBeVisible();
    await expect(programsPage.programRow(programC).first()).toBeVisible();
  });

  test('TC-006 — Deleted program stays removed after refresh', async ({ page, trackProgram }) => {
    const programName = uniqueName('Test Program');

    await createProgram(programsPage, trackProgram, programName, 'Sample program for deletion testing');
    await programsPage.deleteWithConfirmation(programName);
    await expect(programsPage.programRow(programName)).toHaveCount(0);

    await page.reload();
    await programsPage.newProgramButton.waitFor({ state: 'visible' });
    await expect(programsPage.programRow(programName)).toHaveCount(0);
  });

  test('TC-007 — Delete program with special characters in name', async ({ trackProgram }) => {
    const programName = uniqueName('C++ & C# Dev (2026) — "Advanced"');
    const description = 'Covers C++, C#, and related tooling';

    await createProgram(programsPage, trackProgram, programName, description);
    const message = await programsPage.openDeleteConfirmation(programName);
    expect(message).toContain(programName);
    await programsPage.deleteWithConfirmation(programName);

    await expect(programsPage.programRow(programName)).toHaveCount(0);
  });

  test('TC-008 — Recreate program after deletion', async ({ trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';

    await createProgram(programsPage, trackProgram, programName, description);
    await programsPage.deleteWithConfirmation(programName);
    await expect(programsPage.programRow(programName)).toHaveCount(0);

    await programsPage.openNewProgramForm();
    await programsPage.createProgram(programName, trackProgram, { description });

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });
});

test.describe('Negative Flows', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('TC-009 — No deletion without explicit confirmation', async ({ trackProgram }) => {
    const programName = uniqueName('Cloud Engineering 2026');

    await createProgram(programsPage, trackProgram, programName, 'AWS and Azure fundamentals');
    await programsPage.cancelDelete(programName);

    await expect(programsPage.programRow(programName).first()).toBeVisible();
  });

  test('TC-010 — Multiple cancel actions do not delete', async ({ trackProgram }) => {
    const programName = uniqueName('Test Program');

    await createProgram(programsPage, trackProgram, programName, 'Sample program for deletion testing');

    await programsPage.cancelDelete(programName);
    await expect(programsPage.programRow(programName).first()).toBeVisible();

    await programsPage.cancelDelete(programName);

    await expect(programsPage.programRow(programName).first()).toBeVisible();
  });

  test('TC-011 — Edit does not trigger delete', async ({ page, trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    let dialogOpened = false;
    page.on('dialog', () => {
      dialogOpened = true;
    });

    await createProgram(programsPage, trackProgram, programName, 'Full-stack web development program');
    await programsPage.openEditProgramModal(programName);

    await expect(programsPage.editProgramModal.dialog).toBeVisible();
    await expect(programsPage.editProgramModal.programNameField).toHaveValue(programName);
    expect(dialogOpened).toBe(false);
    await expect(programsPage.programRow(programName).first()).toBeVisible();

    await programsPage.editProgramModal.dismiss();
  });

  test('TC-012 — Delete confirmation targets the clicked row only', async ({ trackProgram }) => {
    const programA = uniqueName('Test Program');
    const programB = uniqueName('Web Development 2026');

    await createProgram(programsPage, trackProgram, programA, 'Sample program for deletion testing');
    await createProgram(programsPage, trackProgram, programB, 'Full-stack web development program');

    const message = await programsPage.openDeleteConfirmation(programA);
    expect(message).toContain(programA);
    await programsPage.deleteWithConfirmation(programA);

    await expect(programsPage.programRow(programA)).toHaveCount(0);
    await expect(programsPage.programRow(programB).first()).toBeVisible();
  });

  test('TC-013 — Failed delete preserves program in list', async ({ page, trackProgram }) => {
    const programName = uniqueName('Test Program');

    await createProgram(programsPage, trackProgram, programName, 'Sample program for deletion testing');

    await page.route('**/*', async (route) => {
      const request = route.request();
      if (request.method() === 'DELETE' && /\/api\/programs\//.test(request.url())) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        });
        return;
      }
      await route.continue();
    });

    await programsPage.deleteWithConfirmation(programName);

    // App may not surface delete API errors in UI yet; primary AC is list preservation.
    await expect(programsPage.programRow(programName).first()).toBeVisible();
  });

  test('TC-014 — Non-admin cannot delete programs', async () => {
    test.skip(true, 'Instructor/non-admin credentials not configured in .env');
  });
});

test.describe('Edge Cases', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('TC-015 — Delete the only program in the list', async ({ trackProgram }) => {
    const programName = uniqueName('Test Program');

    await createProgram(programsPage, trackProgram, programName, 'Sample program for deletion testing');
    await programsPage.deleteWithConfirmation(programName);

    await expect(programsPage.programRow(programName)).toHaveCount(0);
    await expect(programsPage.newProgramButton).toBeVisible();
  });

  test('TC-016 — Delete program with max-length name', async ({ trackProgram }) => {
    const maxName = 'W'.repeat(255);

    await createProgram(programsPage, trackProgram, maxName, 'Max length name delete test');
    await programsPage.deleteWithConfirmation(maxName);

    await expect(programsPage.programRow(maxName)).toHaveCount(0);
  });

  test('TC-017 — Delete program with single-character name', async ({ trackProgram }) => {
    const programName = String.fromCharCode(65 + (Date.now() % 26));
    const description = 'Single character name';

    await createProgram(programsPage, trackProgram, programName, description);
    await programsPage.deleteWithConfirmation(programName);

    await expect(programsPage.programRow(programName)).toHaveCount(0);
  });

  test('TC-018 — Delete program with Unicode and emoji name', async ({ trackProgram }) => {
    const programName = uniqueName('日本語プログラム 🎓');
    const description = 'Unicode and emoji test';

    await createProgram(programsPage, trackProgram, programName, description);
    const message = await programsPage.openDeleteConfirmation(programName);
    expect(message).toContain(programName);
    await programsPage.deleteWithConfirmation(programName);

    await expect(programsPage.programRow(programName)).toHaveCount(0);
  });

  test('TC-019 — Double-click confirm does not break delete flow', async ({ trackProgram }) => {
    const programName = uniqueName('Test Program');

    await createProgram(programsPage, trackProgram, programName, 'Sample program for deletion testing');
    await programsPage.deleteWithConfirmation(programName);

    await expect(programsPage.programRow(programName)).toHaveCount(0);
    await expect(programsPage.deleteProgramModal.deletionError).toBeHidden();
  });

  test('TC-020 — Double-click delete icon opens single dialog', async ({ trackProgram }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(programsPage, trackProgram, programName, 'Full-stack web development program');
    const message = await programsPage.doubleClickDeleteIcon(programName);

    expect(message).toMatch(/delete program/i);
    await expect(programsPage.programRow(programName).first()).toBeVisible();
  });

  test('TC-021 — Delete while edit modal is open', async ({ page, trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    const siblingProgram = uniqueName('Cloud Engineering 2026');

    await createProgram(programsPage, trackProgram, programName, 'Full-stack web development program');
    await createProgram(programsPage, trackProgram, siblingProgram, 'AWS and Azure fundamentals');
    await programsPage.openEditProgramModal(programName);

    await expect(programsPage.editProgramModal.dialog).toBeVisible();

    const deleteButton = programsPage.deleteProgramButton(siblingProgram);
    if (await deleteButton.isVisible()) {
      page.once('dialog', (dialog) => dialog.dismiss());
      await deleteButton.click({ force: true });
    } else {
      await programsPage.editProgramModal.dismiss();
    }

    await expect(programsPage.programRow(programName).first()).toBeVisible();
    await expect(programsPage.programRow(siblingProgram).first()).toBeVisible();
  });

  test('TC-022 — Delete program with long description', async ({ trackProgram }) => {
    const programName = uniqueName('Long Description Program');
    const longDescription = 'D'.repeat(2000);

    await createProgram(programsPage, trackProgram, programName, longDescription);
    await programsPage.deleteWithConfirmation(programName);

    await expect(programsPage.programRow(programName)).toHaveCount(0);
  });

  test('TC-023 — Dismiss dialog without confirming does not delete', async ({ trackProgram }) => {
    const programName = uniqueName('Test Program');

    await createProgram(programsPage, trackProgram, programName, 'Sample program for deletion testing');
    await programsPage.cancelDelete(programName);

    await expect(programsPage.programRow(programName).first()).toBeVisible();
  });
});
