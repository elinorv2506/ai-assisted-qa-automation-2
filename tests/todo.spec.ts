import { test, expect, type Page } from '@playwright/test';

const TODO_URL = 'https://demo.playwright.dev/todomvc/#/';

const LONG_TODO_TEXT =
  'Plan quarterly roadmap review meeting with engineering design product and leadership teams to align on priorities dependencies resourcing risks and milestone dates for Q3 deliverables including migration cutover';

async function gotoEmptyApp(page: Page): Promise<void> {
  await page.goto(TODO_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

function newTodoInput(page: Page) {
  return page.getByPlaceholder('What needs to be done?');
}

function todoItems(page: Page) {
  return page.getByRole('listitem').filter({ has: page.getByRole('checkbox') });
}

function todoItem(page: Page, text: string) {
  return todoItems(page).filter({ hasText: text });
}

function itemCount(page: Page) {
  return page.getByText(/^\d+ items? left$/);
}

function footerFilters(page: Page) {
  return page.getByRole('link', { name: 'All' });
}

async function addTodo(page: Page, text: string): Promise<void> {
  const input = newTodoInput(page);
  await input.fill(text);
  await input.press('Enter');
}

async function deleteTodo(page: Page, text: string): Promise<void> {
  const item = todoItem(page, text);
  await item.hover();
  await item.getByRole('button').click();
}

async function completeTodo(page: Page, text: string): Promise<void> {
  await todoItem(page, text).getByRole('checkbox').check();
}

async function uncompleteTodo(page: Page, text: string): Promise<void> {
  await todoItem(page, text).getByRole('checkbox').uncheck();
}

test.beforeEach(async ({ page }) => {
  await gotoEmptyApp(page);
});

test.describe('Positive Flows', () => {
  test('TC-001 — Single todo appears in the list after submission', async ({ page }) => {
    await newTodoInput(page).click();
    await addTodo(page, 'Buy milk');

    const item = todoItem(page, 'Buy milk');
    await expect(item).toBeVisible();
    await expect(item.getByRole('checkbox')).not.toBeChecked();
    await expect(itemCount(page)).toHaveText('1 item left');
    await expect(newTodoInput(page)).toHaveValue('');
  });

  test('TC-002 — Multiple todos can be added sequentially', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Pay electric bill');

    await expect(todoItems(page)).toHaveText(['Buy milk', 'Walk the dog', 'Pay electric bill']);
    await expect(itemCount(page)).toHaveText('3 items left');
    await expect(todoItems(page)).toHaveCount(3);
    for (const text of ['Buy milk', 'Walk the dog', 'Pay electric bill']) {
      await expect(todoItem(page, text).getByRole('checkbox')).not.toBeChecked();
    }
  });

  test('TC-003 — Todo item is marked completed when its checkbox is checked', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await completeTodo(page, 'Buy milk');

    const item = todoItem(page, 'Buy milk');
    await expect(item.getByRole('checkbox')).toBeChecked();
    await expect(itemCount(page)).toHaveText('0 items left');
    await expect(item).toBeVisible();
  });

  test('TC-004 — Completed todo can be toggled back to active', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await completeTodo(page, 'Buy milk');
    await uncompleteTodo(page, 'Buy milk');

    const item = todoItem(page, 'Buy milk');
    await expect(item.getByRole('checkbox')).not.toBeChecked();
    await expect(itemCount(page)).toHaveText('1 item left');
    await expect(item.getByText('Buy milk')).toBeVisible();
  });

  test('TC-005 — Only the selected item is completed when multiple todos exist', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Pay electric bill');
    await completeTodo(page, 'Walk the dog');

    await expect(todoItem(page, 'Walk the dog').getByRole('checkbox')).toBeChecked();
    await expect(todoItem(page, 'Buy milk').getByRole('checkbox')).not.toBeChecked();
    await expect(todoItem(page, 'Pay electric bill').getByRole('checkbox')).not.toBeChecked();
    await expect(itemCount(page)).toHaveText('2 items left');
  });

  test('TC-006 — Active todo is removed from the list when deleted', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Walk the dog');
    await deleteTodo(page, 'Buy milk');

    await expect(todoItem(page, 'Buy milk')).toHaveCount(0);
    await expect(todoItem(page, 'Walk the dog')).toBeVisible();
    await expect(todoItem(page, 'Walk the dog').getByRole('checkbox')).not.toBeChecked();
    await expect(itemCount(page)).toHaveText('1 item left');
  });

  test('TC-007 — Completed todo is removed from the list when deleted', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await completeTodo(page, 'Buy milk');
    await deleteTodo(page, 'Buy milk');

    await expect(todoItems(page)).toHaveCount(0);
    await expect(footerFilters(page)).toBeHidden();
    await expect(newTodoInput(page)).toBeVisible();
  });

  test('TC-008 — Last remaining todo can be deleted to return to empty state', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await deleteTodo(page, 'Buy milk');

    await expect(todoItems(page)).toHaveCount(0);
    await expect(footerFilters(page)).toBeHidden();
    await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
    await expect(newTodoInput(page)).toBeVisible();
  });
});

test.describe('Negative Flows', () => {
  test('TC-009 — Empty submission does not create a todo', async ({ page }) => {
    const input = newTodoInput(page);
    await input.click();
    await input.press('Enter');

    await expect(todoItems(page)).toHaveCount(0);
    await expect(footerFilters(page)).toBeHidden();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('');
  });

  test('TC-010 — Whitespace-only submission does not create a todo', async ({ page }) => {
    const input = newTodoInput(page);
    await input.click();
    await input.fill('   ');
    await input.press('Enter');

    await expect(todoItems(page)).toHaveCount(0);
    await expect(footerFilters(page)).toBeHidden();
  });

  test('TC-011 — Completing a todo does not remove it from the list', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await completeTodo(page, 'Buy milk');

    const item = todoItem(page, 'Buy milk');
    await expect(item).toBeVisible();
    await expect(item.getByRole('checkbox')).toBeChecked();
    await expect(todoItems(page)).toHaveCount(1);
  });

  test('TC-012 — Deleting a todo does not mark sibling items as completed', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Walk the dog');
    await completeTodo(page, 'Walk the dog');
    await deleteTodo(page, 'Buy milk');

    await expect(todoItem(page, 'Buy milk')).toHaveCount(0);
    await expect(todoItem(page, 'Walk the dog').getByRole('checkbox')).toBeChecked();
    await expect(itemCount(page)).toHaveText('0 items left');
  });

  test('TC-013 — Adding a todo does not auto-complete it', async ({ page }) => {
    await addTodo(page, 'Buy milk');

    const item = todoItem(page, 'Buy milk');
    await expect(item.getByRole('checkbox')).not.toBeChecked();
    await expect(itemCount(page)).toHaveText('1 item left');
  });

  test('TC-014 — Blurring the input without Enter does not create a todo', async ({ page }) => {
    const input = newTodoInput(page);
    await input.click();
    await input.fill('Buy milk');
    await page.getByRole('heading', { name: 'todos' }).click();

    await expect(todoItems(page)).toHaveCount(0);
    await expect(footerFilters(page)).toBeHidden();
  });
});

test.describe('Edge Cases', () => {
  test('TC-015 — Duplicate todo text is allowed as separate entries', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Buy milk');

    const duplicates = todoItem(page, 'Buy milk');
    await expect(duplicates).toHaveCount(2);
    await expect(itemCount(page)).toHaveText('2 items left');

    await duplicates.nth(0).getByRole('checkbox').check();
    await expect(duplicates.nth(0).getByRole('checkbox')).toBeChecked();
    await expect(duplicates.nth(1).getByRole('checkbox')).not.toBeChecked();
  });

  test('TC-016 — Todo with special characters is stored and displayed correctly', async ({ page }) => {
    const text = 'Pay rent: $1,200 (due 6/30!)';
    await addTodo(page, text);

    await expect(todoItem(page, text).getByText(text)).toBeVisible();
    await completeTodo(page, text);
    await expect(todoItem(page, text).getByRole('checkbox')).toBeChecked();
    await deleteTodo(page, text);
    await expect(todoItems(page)).toHaveCount(0);
  });

  test('TC-017 — Todo with leading and trailing spaces is trimmed or preserved consistently', async ({ page }) => {
    await addTodo(page, '  Buy milk  ');

    await expect(todoItems(page)).toHaveCount(1);
    const displayed = await todoItems(page).first().textContent();
    expect(displayed === 'Buy milk' || displayed === '  Buy milk  ').toBeTruthy();
  });

  test('TC-018 — Very long todo text is accepted and displayed', async ({ page }) => {
    await addTodo(page, LONG_TODO_TEXT);

    const item = todoItem(page, LONG_TODO_TEXT);
    await expect(item.getByText(LONG_TODO_TEXT)).toBeVisible();
    await completeTodo(page, LONG_TODO_TEXT);
    await expect(item.getByRole('checkbox')).toBeChecked();
    await deleteTodo(page, LONG_TODO_TEXT);
    await expect(todoItems(page)).toHaveCount(0);
  });

  test('TC-019 — Unicode and emoji characters are supported in todo text', async ({ page }) => {
    const text = 'Buy café supplies ☕ 日本語';
    await addTodo(page, text);

    await expect(todoItem(page, text).getByText(text)).toBeVisible();
    await completeTodo(page, text);
    await deleteTodo(page, text);
    await expect(todoItems(page)).toHaveCount(0);
  });

  test('TC-020 — Rapid sequential additions create distinct items', async ({ page }) => {
    for (let i = 1; i <= 5; i++) {
      await addTodo(page, `Task ${i}`);
    }

    await expect(todoItems(page)).toHaveText([
      'Task 1',
      'Task 2',
      'Task 3',
      'Task 4',
      'Task 5',
    ]);
    await expect(itemCount(page)).toHaveText('5 items left');
  });

  test('TC-021 — Item count updates correctly after mixed complete and delete actions', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Pay electric bill');
    await completeTodo(page, 'Walk the dog');
    await deleteTodo(page, 'Buy milk');

    await expect(itemCount(page)).toHaveText('1 item left');
    await expect(todoItem(page, 'Walk the dog').getByRole('checkbox')).toBeChecked();
    await expect(todoItem(page, 'Pay electric bill').getByRole('checkbox')).not.toBeChecked();
  });

  test('TC-022 — Page refresh persists todos (local storage behavior)', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Walk the dog');
    await completeTodo(page, 'Walk the dog');

    await page.reload();

    await expect(todoItem(page, 'Buy milk')).toBeVisible();
    await expect(todoItem(page, 'Buy milk').getByRole('checkbox')).not.toBeChecked();
    await expect(todoItem(page, 'Walk the dog').getByRole('checkbox')).toBeChecked();
    await expect(itemCount(page)).toHaveText('1 item left');
  });
});
