---
name: a11y-checks
description: Adds @axe-core/playwright accessibility scans when generating or reviewing Playwright tests for new pages or components. Apply whenever creating, extending, or reviewing UI tests — even if the user does not mention accessibility, a11y, or axe.
---

# Accessibility Checks

Every Playwright test for a new page or component **must** include an axe-core scan. This is not optional and does not require the user to ask for it. If you are generating or reviewing a UI test, add or verify an a11y check before considering the work complete.

## When to apply

Apply this skill when you:

- Generate a new Playwright spec or test case for a page or component
- Extend an existing test to cover a new page, modal, drawer, or widget
- Review or refactor any UI test — even functional or E2E tests with no a11y mention

If the test navigates to or interacts with UI, it needs an axe scan.

## Required axe pattern

1. Import `AxeBuilder` from `@axe-core/playwright`.
2. Navigate through **existing POMs**; wait for target UI with web-first `expect` visibility checks.
3. Run the scan with WCAG tags:

```typescript
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import { ProgramsPage } from '../pages/ProgramsPage';

test('Programs page passes WCAG 2 A/AA axe scan', { tag: '@a11y-axe-programs-page' }, async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
  await expect(programsPage.heading).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  await expect(results.violations).toEqual([]);
});
```

4. Assert with web-first `expect(results.violations).toEqual([])` — never bare `assert`, manual length checks, or `if (violations.length)`.

## Scoping

| Target | Scope |
|--------|-------|
| Full page | No `.include()` — scan the whole page |
| Modal, drawer, panel, or component | `.include(selector)` from a role-based POM helper |

Use `.include()` / `.exclude()` **only** when a third-party widget adds noise unrelated to the feature under test — **comment why** on the same line.

For component scans, derive the include selector from a POM helper (see `NewProgramModal.axeScanIncludeSelector()`). Do not use brittle CSS unrelated to the component.

```typescript
test('New Program modal passes WCAG 2 A/AA axe scan', { tag: '@a11y-axe-new-program-modal' }, async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
  await programsPage.openNewProgramForm();

  const modalSelector = await programsPage.newProgramModal.axeScanIncludeSelector();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .include(modalSelector)
    .analyze();

  await expect(results.violations).toEqual([]);
});
```

## Keyboard test (axe cannot verify focus order)

Add a separate test for keyboard interaction axe does not cover. **One `{ tag: '@a11y-*' }` per test.** No inline locators — use POM fields only.

Primary control on the Programs page: `programsPage.newProgramButton` (`+ New Program`).

```typescript
test('Tab and Enter on + New Program opens dialog', { tag: '@a11y-keyboard-new-program' }, async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
  await expect(programsPage.newProgramButton).toBeVisible();

  await page.keyboard.press('Tab');
  // Repeat Tab until primary control is focused, or tab from a known landmark
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
```

If tab order is unstable, note a POM gap (e.g. `tabToNewProgramButton()`) in the handoff — do not add inline locators to work around it.

## Violations — report and stop

If `results.violations` is non-empty:

1. **Stop** — do not weaken the test to pass.
2. **Never** use `.disableRules()` to make the scan green.
3. Report each violation: `id`, `impact`, affected nodes, and helpUrl from the axe result.
4. Mark the test `test.fixme('…', …)` with the violation summary, or hand off to **bug-reporter** for a Jira ticket after human confirmation.
5. Do not merge a spec that disables rules or deletes the assertion to hide real failures.

**Known blocked state in this repo:** `tests/programs.a11y.spec.ts` and `ds5-program-list-display.spec.ts` TC-A11Y are `test.fixme` pending real app fixes — do not re-enable with `.disableRules()`.

## File placement

- Dedicated coverage: `tests/<feature>.a11y.spec.ts` (see `tests/programs.a11y.spec.ts`)
- Or append an axe assertion to a functional test that already reaches the target UI state

Keep axe scans and keyboard steps in test files, not Page Objects. POMs may expose helpers like `axeScanIncludeSelector()`; assertions stay in specs.

## Generating tests checklist

- [ ] Target UI loaded via POM before scanning
- [ ] `.withTags(['wcag2a', 'wcag2aa'])` on every axe scan
- [ ] `await expect(results.violations).toEqual([])`
- [ ] Component scans use `.include()` from POM; `.exclude()` only with comment
- [ ] Separate keyboard test with `{ tag: '@a11y-*' }` where focus/activation matters
- [ ] No inline locators in a11y specs
- [ ] No `.disableRules()` — violations reported and test fixme'd until app is fixed

## Reviewing tests checklist

- [ ] Axe scan covers every new page or component
- [ ] Scan runs in the state under test (modal open, list populated, etc.)
- [ ] WCAG 2 A/AA tags present
- [ ] Keyboard coverage for primary interactive controls axe cannot test
- [ ] No `.disableRules()` used to silence failures
- [ ] One tag per a11y test

If any item fails, add or fix the a11y check before considering the work complete.
