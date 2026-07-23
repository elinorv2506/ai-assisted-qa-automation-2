import { test, expect, type Page } from '../fixtures/cleanup.fixture';

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';

function uniqueName(base: string): string {
  return `${base} ${Date.now()}`;
}

function programModal(page: Page) {
  return page.getByRole('dialog', { name: 'New Program' });
}

function programNameField(page: Page) {
  return programModal(page).getByLabel('Program Name');
}

function descriptionField(page: Page) {
  return programModal(page).getByLabel('Description');
}

function createButton(page: Page) {
  return programModal(page).getByRole('button', { name: 'Create' });
}

function cancelButton(page: Page) {
  return programModal(page).getByRole('button', { name: 'Cancel' });
}

function newProgramButton(page: Page) {
  return page.getByRole('button', { name: '+ New Program' });
}

function programsHeading(page: Page) {
  return page.getByRole('heading', { name: 'Programs', level: 2 });
}

function programInList(page: Page, name: string) {
  return page.locator('tbody tr').filter({
    has: page.locator('td').first().getByText(name, { exact: true }),
  });
}

function programNameInFirstRow(page: Page) {
  return page.locator('tbody tr').first().locator('td').first().locator('p').first();
}

function programDescriptionInRow(page: Page, name: string) {
  return programInList(page, name).first().locator('td').first().locator('p').nth(1);
}

async function gotoPrograms(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/programs`);
  await expect(newProgramButton(page)).toBeVisible();
  await expect(programsHeading(page)).toBeVisible();
}

async function openNewProgramModal(page: Page): Promise<void> {
  await newProgramButton(page).click();
  await expect(programModal(page)).toBeVisible();
  await expect(programNameField(page)).toBeVisible();
  await expect(descriptionField(page)).toBeVisible();
  await expect(createButton(page)).toBeVisible();
  await expect(cancelButton(page)).toBeVisible();
}

async function closeModalWithoutSubmit(page: Page): Promise<void> {
  if (await cancelButton(page).isVisible()) {
    await cancelButton(page).click();
  } else {
    await page.keyboard.press('Escape');
  }
  await expect(programModal(page)).toBeHidden();
}

async function closeModalViaX(page: Page): Promise<void> {
  await programModal(page).locator('banner button, h2').locator('..').getByRole('button').click();
  await expect(programModal(page)).toBeHidden();
}

async function trackProgramFromResponse(
  response: import('@playwright/test').Response,
  trackProgram: (uuid: string) => void,
): Promise<void> {
  if (!response.ok()) {
    return;
  }
  const body = await response.json();
  if (body?.data?.id) {
    trackProgram(body.data.id);
  }
}

async function trackProgramCreatesDuring(
  page: Page,
  trackProgram: (uuid: string) => void,
  action: () => Promise<void>,
  maxCreates = 2,
): Promise<void> {
  const seen = new Set<string>();
  const pending: Promise<void>[] = [];
  let lastSeenAt = 0;

  const handler = (response: import('@playwright/test').Response) => {
    if (!response.url().includes('/api/programs') || response.request().method() !== 'POST') {
      return;
    }
    pending.push(
      (async () => {
        if (!response.ok()) {
          return;
        }
        const body = await response.json();
        const id = body?.data?.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          trackProgram(id);
          lastSeenAt = Date.now();
        }
      })(),
    );
  };

  page.on('response', handler);
  try {
    await action();

    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      if (seen.size >= maxCreates) {
        break;
      }
      if (seen.size > 0 && Date.now() - lastSeenAt > 500) {
        break;
      }
      await page.waitForTimeout(50);
    }
  } finally {
    await Promise.all(pending);
    page.off('response', handler);
  }
}

async function fillAndCreateProgram(
  page: Page,
  name: string,
  trackProgram: (uuid: string) => void,
  description?: string,
  submit?: () => Promise<void>,
  options?: { trackAllCreates?: boolean },
): Promise<void> {
  await programNameField(page).fill(name);
  if (description !== undefined) {
    await descriptionField(page).fill(description);
  }

  if (options?.trackAllCreates) {
    await trackProgramCreatesDuring(page, trackProgram, async () => {
      if (submit) {
        await submit();
      } else {
        await createButton(page).click();
      }
    });
    return;
  }

  const createResponse = page.waitForResponse(
    (res) => res.url().includes('/api/programs') && res.request().method() === 'POST',
  );

  if (submit) {
    await submit();
  } else {
    await createButton(page).click();
  }

  await trackProgramFromResponse(await createResponse, trackProgram);
}

test.beforeEach(async ({ page }) => {
  await gotoPrograms(page);
});

test.describe('Positive Flows', () => {
  test('TC-001 — Program creation form displays required fields', async ({ page }) => {
    await openNewProgramModal(page);

    // Jira AC: "I see the program creation form with fields: Program Name, Description"
    await expect(programNameField(page)).toBeVisible();
    await expect(programNameField(page)).toBeEditable();
    await expect(descriptionField(page)).toBeVisible();
    await expect(descriptionField(page)).toBeEditable();
    await expect(createButton(page)).toBeVisible();
  });

  test('TC-002 — Program is created and appears in the list', async ({ page, trackProgram }) => {
    // Jira AC uses exact values: "Web Development 2026" / "Full-stack web development program"
    const programName = 'Web Development 2026';
    const description = 'Full-stack web development program';

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, trackProgram, description);

    // Jira AC: "the modal closes" and "the program list shows Web Development 2026"
    await expect(programModal(page)).toBeHidden();
    await expect(programInList(page, programName).first()).toBeVisible();
  });

  test('TC-003 — Program can be created with Program Name only', async ({ page, trackProgram }) => {
    const programName = uniqueName('Data Science Fundamentals');

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, trackProgram);

    await expect(programModal(page)).toBeHidden();
    await expect(programInList(page, programName)).toBeVisible();
    await expect(programInList(page, programName).first().locator('td p')).toHaveCount(1);
  });

  test('TC-004 — Create button is enabled when Program Name has valid input', async ({ page }) => {
    const programName = uniqueName('Cybersecurity 2026');

    await openNewProgramModal(page);
    await expect(createButton(page)).toBeDisabled();

    await programNameField(page).fill(programName);
    await expect(createButton(page)).toBeEnabled();
  });

  test('TC-005 — New program appears without disrupting existing list entries', async ({ page, trackProgram }) => {
    const existingProgram = uniqueName('Mobile App Development 2025');
    const newProgram = uniqueName('Cloud Engineering 2026');
    const description = 'AWS and Azure fundamentals';

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, existingProgram, trackProgram, 'Existing program seed');
    await expect(programInList(page, existingProgram)).toBeVisible();

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, newProgram, trackProgram, description);

    await expect(programInList(page, newProgram)).toBeVisible();
    await expect(programInList(page, existingProgram)).toBeVisible();
  });
});

test.describe('Negative Flows', () => {
  test('TC-006 — Empty Program Name keeps Create disabled', async ({ page }) => {
    await openNewProgramModal(page);

    // Jira AC: "I leave the Program Name field empty" → "Create button is disabled"
    await expect(programNameField(page)).toHaveValue('');
    await expect(createButton(page)).toBeDisabled();
    await expect(programModal(page)).toBeVisible();
  });

  test('TC-007 — Whitespace-only Program Name does not enable Create', async ({ page }) => {
    const programName = uniqueName('Whitespace Guard');

    await openNewProgramModal(page);
    await programNameField(page).fill('   ');
    await descriptionField(page).fill('Optional description text');

    await expect(createButton(page)).toBeDisabled();
    await expect(programInList(page, programName)).toHaveCount(0);
  });

  test('TC-009 — Cancel/close does not create a program', async ({ page }) => {
    const programName = uniqueName('UX Design 2026');
    const description = 'Human-centered design principles';

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await descriptionField(page).fill(description);
    await closeModalWithoutSubmit(page);

    await expect(programInList(page, programName)).toHaveCount(0);
  });

  test('TC-010 — Duplicate program name is rejected or handled per business rules', async ({ page, trackProgram }) => {
    const programName = uniqueName('Web Development 2026');

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, trackProgram, 'Original program');
    await expect(programInList(page, programName)).toHaveCount(1);

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, trackProgram, 'Duplicate attempt description');
    await expect(programModal(page)).toBeHidden({ timeout: 15000 });

    // Requirement: duplicate must not be silently accepted — only one entry allowed.
    await expect(programInList(page, programName)).toHaveCount(1);
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

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await descriptionField(page).fill(description);
    await createButton(page).click();

    await expect(programModal(page)).toBeVisible();
    await expect(programNameField(page)).toHaveValue(programName);
    await expect(descriptionField(page)).toHaveValue(description);
    await expect(programInList(page, programName)).toHaveCount(0);
  });
});

test.describe('Edge Cases', () => {
  test('TC-012 — Minimum-length Program Name (single character)', async ({ page, trackProgram }) => {
    const programName = String.fromCharCode(65 + (Date.now() % 26));
    const description = `Single letter program name test ${Date.now()}`;

    await expect(page.locator('tbody tr').first()).toBeVisible();
    const rowsBefore = await page.locator('tbody tr').count();

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, trackProgram, description);

    await expect(page.locator('tbody tr')).toHaveCount(rowsBefore + 1);
    await expect(programInList(page, programName).last()).toBeVisible();
  });

  test('TC-013 — Maximum-length Program Name boundary', async ({ page, trackProgram }) => {
    const maxName = `${'W'.repeat(255)} ${Date.now()}`;
    const overMaxName = `${'W'.repeat(256)} ${Date.now()}`;

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, maxName, trackProgram, 'Boundary test at max length');
    await expect(programInList(page, maxName)).toHaveCount(1);

    await openNewProgramModal(page);
    await programNameField(page).fill(overMaxName);
    await descriptionField(page).fill('Over max length attempt');

    // Requirement: names exceeding max length must be rejected — not silently saved.
    await expect(createButton(page)).toBeDisabled();
    await expect(programInList(page, overMaxName)).toHaveCount(0);
  });

  test('TC-014 — Maximum-length Description boundary', async ({ page, trackProgram }) => {
    const programName = uniqueName('Blockchain Basics 2026');
    const maxDescription = 'D'.repeat(2000);
    const overMaxDescription = 'D'.repeat(2001);
    const overflowName = uniqueName('Blockchain Basics 2026 overflow');

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, trackProgram, maxDescription);
    await expect(programInList(page, programName)).toHaveCount(1);

    await openNewProgramModal(page);
    await programNameField(page).fill(overflowName);
    await descriptionField(page).fill(overMaxDescription);

    // Requirement: descriptions exceeding max length must be rejected.
    await expect(createButton(page)).toBeDisabled();
    await expect(programInList(page, overflowName)).toHaveCount(0);
  });

  test('TC-015 — Special characters in Program Name', async ({ page, trackProgram }) => {
    const programName = uniqueName('C++ & C# Dev (2026) — "Advanced"');
    const description = 'Covers C++, C#, and related tooling';

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, trackProgram, description);

    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-016 — Unicode and emoji in Program Name and Description', async ({ page, trackProgram }) => {
    const programName = uniqueName('תוכנית פיתוח אתרים 2026 🎓');
    const description = 'תיאור בעברית — full-stack program';

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, trackProgram, description);

    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-017 — Leading and trailing whitespace in Program Name', async ({ page, trackProgram }) => {
    const coreName = uniqueName('Game Development 2026');
    const paddedName = `  ${coreName}  `;
    const description = 'Unity and Unreal basics';

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, paddedName, trackProgram, description);

    await expect(programModal(page)).toBeHidden();
    // Requirement: leading/trailing whitespace must be trimmed on save.
    await expect(programInList(page, coreName)).toHaveCount(1);
    await expect(programInList(page, paddedName)).toHaveCount(0);
  });

  test('TC-018 — HTML/script injection in Description', async ({ page, trackProgram }) => {
    const programName = uniqueName('Secure Coding 2026');
    const maliciousDescription = "<script>alert('xss')</script><img src=x onerror=alert(1)>";

    page.on('dialog', (dialog) => {
      throw new Error(`Unexpected dialog: ${dialog.message()}`);
    });

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, trackProgram, maliciousDescription);

    await expect(programModal(page)).toBeHidden();
    await expect(programInList(page, programName)).toBeVisible();
  });

  test('TC-019 — Rapid double-click on Create', async ({ page, trackProgram }) => {
    const programName = uniqueName('DevOps Pipeline 2026');
    const description = 'CI/CD and infrastructure as code';

    await openNewProgramModal(page);
    await fillAndCreateProgram(
      page,
      programName,
      trackProgram,
      description,
      () => createButton(page).dblclick(),
      { trackAllCreates: true },
    );

    await expect(programModal(page)).toBeHidden({ timeout: 15000 });
    // Requirement: only one program must be created on double-click (idempotent submit).
    await expect(programInList(page, programName)).toHaveCount(1);
  });

  test('TC-020 — Program list sort/order after creation', async ({ page, trackProgram }) => {
    const programName = uniqueName('Quantum Computing Intro 2026');
    const description = 'Qubits and algorithms overview';

    await openNewProgramModal(page);
    await fillAndCreateProgram(page, programName, trackProgram, description);

    await expect(programInList(page, programName)).toHaveCount(1);
    await expect(programNameInFirstRow(page)).toHaveText(programName);
  });

  test('TC-021 — AI Generation Config section displays with defaults', async ({ page }) => {
    await openNewProgramModal(page);

    await expect(programModal(page).getByText('▸ Show AI Generation Config')).toBeVisible();
    await expect(programModal(page).getByText('Total Program Hours')).toBeVisible();
    await expect(programModal(page).getByText('Default Session Hours')).toBeVisible();
    await expect(programModal(page).getByText('Default Exam Hours')).toBeVisible();
    await expect(programModal(page).getByPlaceholder('e.g. Career changers, no CS background')).toBeVisible();
    await expect(programModal(page).getByPlaceholder('e.g. Python, SQL, Machine Learning, Data Visualization')).toBeVisible();
    await expect(programModal(page).getByText('Sync/Async Ratio: 70% sync / 30% async')).toBeVisible();

    const sessionHours = programModal(page).locator('input[value="4"]');
    const examHours = programModal(page).locator('input[value="3"]');
    await expect(sessionHours).toBeVisible();
    await expect(examHours).toBeVisible();
  });

  test('TC-022 — Programs page layout and list structure', async ({ page }) => {
    await expect(programsHeading(page)).toBeVisible();
    await expect(page.getByText('Manage academic programs and semesters')).toBeVisible();
    await expect(newProgramButton(page)).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Program' })).toBeVisible();
    await expect(page.getByText('Select a program to manage semesters')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('TC-023 — Modal dismiss via X close button', async ({ page }) => {
    const programName = uniqueName('Dismiss Test 2026');

    await openNewProgramModal(page);
    await programNameField(page).fill(programName);
    await descriptionField(page).fill('Should not be saved');
    await closeModalViaX(page);

    await expect(programInList(page, programName)).toHaveCount(0);
  });
});
