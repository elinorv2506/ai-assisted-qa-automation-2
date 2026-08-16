import AxeBuilder from '@axe-core/playwright';
import { type Page } from '@playwright/test';
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
  await expect(programsPage.programRow(name)).toBeVisible();
}

function isProgramsCollectionGet(method: string, url: string): boolean {
  return method === 'GET' && !url.match(/\/api\/programs\/[^/]+$/);
}

async function mockEmptyProgramsList(page: Page): Promise<void> {
  await page.route('**/api/programs**', async (route) => {
    const method = route.request().method();
    const url = route.request().url();
    if (isProgramsCollectionGet(method, url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
      return;
    }
    await route.continue();
  });
}

test.setTimeout(60000);

test.describe('DS-5: Program list filtering and display', () => {
  test.describe('Happy paths', () => {
    let programsPage: ProgramsPage;

    test.beforeEach(async ({ page }) => {
      programsPage = new ProgramsPage(page);
      await programsPage.goto();
    });

    test('TC-001 — Display program list with key details', { tag: '@smoke' }, async ({
      trackProgram,
    }) => {
      const programA = uniqueName('Web Development 2026');
      const programB = uniqueName('Cloud Engineering 2026');
      const descriptionA = 'Full-stack web development program';
      const descriptionB = 'AWS and Azure fundamentals';

      await createProgram(programsPage, trackProgram, programA, descriptionA);
      await createProgram(programsPage, trackProgram, programB, descriptionB);

      await expect.soft(programsPage.programRow(programA)).toBeVisible();
      await expect.soft(programsPage.programRow(programB)).toBeVisible();
      await expect.soft(programsPage.programNameInRow(programA)).toHaveText(programA);
      await expect.soft(programsPage.programDescriptionInRow(programA)).toHaveText(descriptionA);
      await expect.soft(programsPage.programNameInRow(programB)).toHaveText(programB);
      await expect.soft(programsPage.programDescriptionInRow(programB)).toHaveText(descriptionB);
    });

    test('TC-003 — Create action is available on populated Programs page', { tag: '@sanity' }, async ({
      trackProgram,
    }) => {
      const programName = uniqueName('Mobile App Development 2025');

      await createProgram(programsPage, trackProgram, programName, 'iOS and Android development track');

      await expect(programsPage.programRow(programName)).toBeVisible();
      await expect(programsPage.newProgramButton).toBeVisible();
    });

    test('TC-006 — Program with empty description appears in list', { tag: '@regression' }, async ({ trackProgram }) => {
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

    test('TC-020 — New program appears in list after create', { tag: '@e2e' }, async ({ trackProgram }) => {
      const programName = uniqueName('Quantum Computing Intro 2026');
      const description = 'Introduction to qubits and algorithms';

      await programsPage.openNewProgramForm();
      await programsPage.createProgram(programName, trackProgram, { description });

      await expect(programsPage.newProgramModal.dialog).toBeHidden();
      await expect(programsPage.programRow(programName)).toBeVisible();
      await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
    });
  });

  test('TC-005 — Program list data persists after refresh', { tag: '@regression' }, async ({
    page,
    trackProgram,
  }) => {
    await page.clock.install({ time: new Date('2026-08-08T16:00:00.000Z') });
    const programName = `Web Development 2026 ${Date.now()}`;
    // Resume so POM waits (Date.now / setTimeout) are not frozen during goto/reload.
    await page.clock.resume();

    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
    const description = 'Full-stack web development program';

    await createProgram(programsPage, trackProgram, programName, description);

    await page.reload();
    await expect(programsPage.heading).toBeVisible();
    await expect(programsPage.newProgramButton).toBeVisible();

    await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
    await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
  });

  test.describe('Negative', () => {
    let programsPage: ProgramsPage;

    test.beforeEach(async ({ page }) => {
      programsPage = new ProgramsPage(page);
      await programsPage.goto();
    });

    test('TC-008 — Empty state hidden when programs exist', { tag: '@regression' }, async ({ trackProgram }) => {
      const programName = uniqueName('Web Development 2026');

      await createProgram(programsPage, trackProgram, programName, 'Full-stack web development program');

      await expect(programsPage.programRow(programName)).toBeVisible();
      await expect(programsPage.emptyStateMessage).toHaveCount(0);
    });

    test('TC-009 — Program name and description are not swapped in list', { tag: '@regression' }, async ({
      trackProgram,
    }) => {
      const programName = uniqueName('Cybersecurity 2026');
      const description = 'Network security and ethical hacking fundamentals';

      await createProgram(programsPage, trackProgram, programName, description);

      await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
      await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
      await expect(programsPage.programDescriptionInRow(programName)).not.toHaveText(programName);
    });

    test('TC-010 — Deleted program is not shown in list', { tag: '@e2e' }, async ({ trackProgram }) => {
      const programToDelete = uniqueName('Test Program');
      const programToKeep = uniqueName('Web Development 2026');

      await createProgram(
        programsPage,
        trackProgram,
        programToDelete,
        'Sample program for deletion testing',
      );
      await createProgram(
        programsPage,
        trackProgram,
        programToKeep,
        'Full-stack web development program',
      );

      await programsPage.deleteWithConfirmation(programToDelete);

      await expect(programsPage.programRow(programToDelete)).toHaveCount(0);
      await expect(programsPage.programRow(programToKeep)).toBeVisible();
    });

    test('TC-011 — Non-admin cannot access Programs page program list', { tag: '@regression' }, async () => {
      test.skip(true, 'Instructor/non-admin credentials not configured');
    });

    test('TC-021 — List updates after program edit', { tag: '@e2e' }, async ({ trackProgram }) => {
      const programName = uniqueName('Web Development 2026');
      const updatedName = `${programName} - Updated`;
      const updatedDescription = 'Updated full-stack curriculum';

      await createProgram(programsPage, trackProgram, programName, 'Full-stack web development program');
      await programsPage.openEditProgramModal(programName);
      await programsPage.editProgramModal.fillProgramName(updatedName);
      await programsPage.editProgramModal.fillDescription(updatedDescription);
      await programsPage.editProgramModal.clickSave();

      await expect(programsPage.editProgramModal.dialog).toBeHidden();
      await expect(programsPage.programRow(updatedName)).toBeVisible();
      await expect(programsPage.programDescriptionInRow(updatedName)).toHaveText(updatedDescription);
      await expect(programsPage.programRow(programName)).toHaveCount(0);
    });

    test('TC-024 — No duplicate-looking rows from whitespace variants', { tag: '@regression' }, async ({ trackProgram }) => {
      const programName = uniqueName('Web Development 2026');

      await createProgram(programsPage, trackProgram, programName, 'Full-stack web development program');

      await expect(programsPage.programRow(programName)).toHaveCount(1);
      await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
      await expect(programsPage.programNameInRow(programName)).not.toHaveText(/^\s|\s$/);
    });
  });

  test.describe('Edge cases', () => {
    let programsPage: ProgramsPage;

    test.beforeEach(async ({ page }) => {
      programsPage = new ProgramsPage(page);
      await programsPage.goto();
    });

    test('TC-013 — Single program in list', { tag: '@regression' }, async ({ trackProgram }) => {
      const programName = uniqueName('Mobile App Development 2025');
      const description = 'iOS and Android development track';

      await createProgram(programsPage, trackProgram, programName, description);

      await expect(programsPage.programRow(programName)).toHaveCount(1);
      await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
      await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
    });

    test('TC-014 — Special characters display correctly in program list', { tag: '@regression' }, async ({
      trackProgram,
    }) => {
      const programName = uniqueName('Informatique & IA - Niveau 2');
      const description = 'Programme avancé en informatique et intelligence artificielle';

      await createProgram(programsPage, trackProgram, programName, description);

      await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
      await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
    });

    test('TC-015 — Unicode and emoji in program list', { tag: '@regression' }, async ({ trackProgram }) => {
      const programName = uniqueName('תוכנית פיתוח אתרים 2026 🎓');
      const description = 'Full-stack track with modern frameworks';

      await createProgram(programsPage, trackProgram, programName, description);

      await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
      await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
    });

    test('TC-016 — Max-length program name in list', { tag: '@regression' }, async ({ trackProgram }) => {
      const maxName = uniqueName('Max').padEnd(255, 'A').slice(0, 255);

      await createProgram(programsPage, trackProgram, maxName, 'Max length name display test');

      await expect(programsPage.programRow(maxName)).toBeVisible();
      await expect(programsPage.programNameInRow(maxName)).toHaveText(maxName);
      await expect(programsPage.programNameCell(maxName)).toBeVisible();
    });

    test('TC-017 — Long description in program list', { tag: '@regression' }, async ({ trackProgram }) => {
      const programName = uniqueName('Long Description Program');
      const longDescription = 'B'.repeat(2000);

      await createProgram(programsPage, trackProgram, programName, longDescription);

      await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
      await expect(programsPage.programDescriptionInRow(programName)).toBeVisible();
      await expect(programsPage.programRow(programName)).toBeVisible();
    });

    test('TC-018 — Single-character program name in list', { tag: '@regression' }, async ({ trackProgram }) => {
      const programName = uniqueName('X');
      const description = 'Single character name boundary test';

      await createProgram(programsPage, trackProgram, programName, description);

      await expect(programsPage.programNameInRow(programName)).toHaveText(programName);
      await expect(programsPage.programDescriptionInRow(programName)).toHaveText(description);
    });

    test('TC-019 — All programs appear in list', { tag: '@regression' }, async ({ trackProgram }) => {
      const programA = uniqueName('Web Development 2026');
      const programB = uniqueName('Cloud Engineering 2026');
      const programC = uniqueName('Data Science Fundamentals');
      const programD = uniqueName('Mobile App Development 2025');

      await createProgram(programsPage, trackProgram, programA, 'Full-stack web development program');
      await createProgram(programsPage, trackProgram, programB, 'AWS and Azure fundamentals');
      await createProgram(programsPage, trackProgram, programC, 'Statistics and Python track');
      await createProgram(programsPage, trackProgram, programD, 'iOS and Android development track');

      await expect(programsPage.programRow(programA)).toBeVisible();
      await expect(programsPage.programRow(programB)).toBeVisible();
      await expect(programsPage.programRow(programC)).toBeVisible();
      await expect(programsPage.programRow(programD)).toBeVisible();
    });

    test('TC-022 — XSS payload in description is sanitized in list', { tag: '@regression' }, async ({ page, trackProgram }) => {
      test.fixme(true, 'Blocked by DS-205: description renders raw <script> in program list');

      const programName = uniqueName('Secure Coding 2026');
      const maliciousDescription = "<script>alert('xss')</script>";

      page.on('dialog', (dialog) => {
        throw new Error(`Unexpected dialog: ${dialog.message()}`);
      });

      await createProgram(programsPage, trackProgram, programName, maliciousDescription);

      await expect(programsPage.programRow(programName)).toBeVisible();
      await expect(programsPage.programDescriptionInRow(programName)).not.toContainText('<script>');
      await expect(programsPage.programDescriptionInRow(programName)).not.toContainText('alert(');
    });

    test('TC-023 — Empty state after last program deleted', { tag: '@regression' }, async () => {
      test.skip(true, 'Cannot isolate last-program delete on shared tenant without deleting other testers data');
    });
  });

  test.describe('Accessibility', () => {
    test('TC-028 — Populated Programs page passes WCAG 2 A/AA', { tag: '@regression' }, async ({
      page,
      trackProgram,
    }) => {
      test.fixme(true, 'Known WCAG 2 A/AA violations on populated Programs page');

      const programsPage = new ProgramsPage(page);
      await programsPage.goto();

      const programName = uniqueName('A11Y List Scan');
      await createProgram(
        programsPage,
        trackProgram,
        programName,
        'Accessibility scan seed program',
      );

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      await expect(results.violations).toEqual([]);
    });

    test('TC-029 — Keyboard Tab and Enter open the New Program dialog', { tag: '@regression' }, async ({
      page,
    }) => {
      await mockEmptyProgramsList(page);

      const programsPage = new ProgramsPage(page);
      await programsPage.goto();
      await expect(programsPage.newProgramButton).toBeVisible();

      let focused = false;
      for (let i = 0; i < 30 && !focused; i++) {
        if (await programsPage.newProgramButton.evaluate((el) => el === document.activeElement)) {
          focused = true;
          break;
        }
        await page.keyboard.press('Tab');
      }

      await expect(programsPage.newProgramButton).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(programsPage.newProgramModal.dialog).toBeVisible();
    });
  });

  test.describe('Network', () => {
    test('TC-002 — Empty state when no programs exist', { tag: '@regression' }, async ({
      page,
    }) => {
      await mockEmptyProgramsList(page);

      const programsPage = new ProgramsPage(page);
      await programsPage.goto();

      await expect(programsPage.emptyStateMessage).toBeVisible();
      await expect(programsPage.emptyStateCreateButton).toBeVisible();
      await expect(programsPage.newProgramButton).toBeVisible();
    });

    test('TC-004 — Empty state create prompt opens program creation form', { tag: '@regression' }, async ({
      page,
    }) => {
      await mockEmptyProgramsList(page);

      const programsPage = new ProgramsPage(page);
      await programsPage.goto();
      await programsPage.openNewProgramForm();

      await expect(programsPage.newProgramModal.programNameField).toBeVisible();
      await expect(programsPage.newProgramModal.descriptionField).toBeVisible();
      await expect(programsPage.newProgramModal.createButton).toBeVisible();
    });

    test('TC-007 — No program rows when list is empty', { tag: '@regression' }, async ({
      page,
    }) => {
      await mockEmptyProgramsList(page);

      const programsPage = new ProgramsPage(page);
      await programsPage.goto();

      await expect(programsPage.programRows()).toHaveCount(0);
      await expect(programsPage.emptyStateMessage).toBeVisible();
    });

    test('TC-012 — Load failure is not shown as successful empty state', { tag: '@regression' }, async ({
      page,
    }) => {
      test.fixme(true, 'App shows empty state on GET 500 instead of an error');

      await page.route('**/api/programs**', async (route) => {
        const method = route.request().method();
        const url = route.request().url();
        if (isProgramsCollectionGet(method, url)) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Internal Server Error' }),
          });
          return;
        }
        await route.continue();
      });

      const programsPage = new ProgramsPage(page);
      await programsPage.gotoExpectingListFailure();

      await expect(programsPage.emptyStateMessage).toHaveCount(0);
      await expect(programsPage.heading).toBeVisible();
    });

    test('TC-025 — List timeout is not shown as successful empty state', { tag: '@regression' }, async ({
      page,
    }) => {
      test.fixme(true, 'App shows empty state on GET timeout');

      await page.route('**/api/programs**', async (route) => {
        const method = route.request().method();
        const url = route.request().url();
        if (isProgramsCollectionGet(method, url)) {
          await route.abort('timedout');
          return;
        }
        await route.continue();
      });

      const programsPage = new ProgramsPage(page);
      await programsPage.gotoExpectingListFailure();

      await expect(programsPage.emptyStateMessage).toHaveCount(0);
      await expect(programsPage.heading).toBeVisible();
    });

    test('TC-026 — Malformed list payload does not crash the Programs shell', { tag: '@regression' }, async ({
      page,
    }) => {
      test.fixme(true, 'Malformed GET /api/programs JSON whitescreens the Programs page');

      await page.route('**/api/programs**', async (route) => {
        const method = route.request().method();
        const url = route.request().url();
        if (isProgramsCollectionGet(method, url)) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: '{not-json',
          });
          return;
        }
        await route.continue();
      });

      const programsPage = new ProgramsPage(page);
      await programsPage.gotoAllowingRenderFailure();

      await expect(programsPage.heading).toBeVisible();
      await expect(programsPage.newProgramButton).toBeVisible();
    });

    test('TC-027 — Unauthorized list response is not shown as a genuine empty list', { tag: '@regression' }, async ({
      page,
    }) => {
      test.fixme(true, 'App shows empty state on GET 401 instead of auth error or login');

      await page.route('**/api/programs**', async (route) => {
        const method = route.request().method();
        const url = route.request().url();
        if (isProgramsCollectionGet(method, url)) {
          await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Unauthorized' }),
          });
          return;
        }
        await route.continue();
      });

      const programsPage = new ProgramsPage(page);
      await programsPage.gotoExpectingListFailure();

      await expect(programsPage.emptyStateMessage).toHaveCount(0);
    });
  });

  test.describe('API', () => {
    test('TC-030 — GET /api/programs returns data array', { tag: '@api' }, async ({
      request,
    }) => {
      const token = process.env.DIDAXIS_API_TOKEN;
      test.skip(!token, 'DIDAXIS_API_TOKEN required for contract check');

      const res = await request.get('/api/programs', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
    });
  });
});
