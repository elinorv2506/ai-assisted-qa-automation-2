---
name: playwright-assertions
description: Assertion patterns for Playwright tests — web-first hard expects,
  soft expects for multi-check audits, and visual snapshots where layout is
  the AC. Apply when writing or reviewing specs with multiple checks or
  layout-dependent acceptance criteria.
---

# Playwright Assertions

## Default — web-first hard `expect`

Use Playwright's auto-retrying assertions for every AC-critical check:

```typescript
await expect(programsPage.programRow(name)).toBeVisible();
await expect(programsPage.newProgramButton).toBeEnabled();
await expect(programsPage.programNameInRow(name)).toHaveText(name);
```

Never snapshot booleans (`expect(await locator.isVisible())`). Never bare Node
`assert` for UI state.

## Soft asserts — multi-check audits

Use `expect.soft` when one test verifies **many independent items** and you
want full failure output (e.g. auditing several rows or fields). The test still
fails if any soft assert fails.

```typescript
test('TC-NNN — list columns present for each row', { tag: '@soft-audit' }, async ({ trackProgram }) => {
  const names = [uniqueName('Alpha'), uniqueName('Beta')];
  for (const name of names) {
    await createProgram(programsPage, trackProgram, name);
  }

  for (const name of names) {
    await expect.soft(programsPage.programNameInRow(name)).toBeVisible();
    await expect.soft(programsPage.programDescriptionInRow(name)).toBeVisible();
  }
});
```

**Rules for soft asserts:**

- Use only for **secondary / audit** checks — primary AC path uses hard `expect`
- Do not wrap a single critical assertion in `expect.soft` to hide failures
- One `{ tag: '@soft-audit' }` per test that relies on soft asserts
- Route locators through POMs — no inline locators

## Visual — `toHaveScreenshot` where layout earns it

Use visual comparison only when the AC is about **layout or visual regression**
— not for text content (use `toHaveText`) or presence (use `toBeVisible`).

```typescript
test('TC-NNN — programs empty state layout', { tag: '@visual' }, async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
  await expect(programsPage.emptyStateMessage).toBeVisible();

  await expect(page).toHaveScreenshot('programs-empty-state.png', {
    maxDiffPixels: 100,
  });
});
```

**Rules for visual asserts:**

- One `{ tag: '@visual' }` per test
- Baseline committed under `tests/**/*-snapshots/` (Playwright default)
- Human must approve new/changed baselines before merge
- Mask dynamic regions (timestamps, avatars) via `mask: [locator]` when needed
- Prefer axe + role-based asserts over screenshots when the AC is accessibility or content

## When reviewing

- [ ] AC-critical path uses hard `expect`
- [ ] `expect.soft` not masking a single must-pass gate
- [ ] Visual tests have committed baselines and `@visual` tag
- [ ] No mixed pattern: hard expect for pass/fail gate, soft for audit extras
