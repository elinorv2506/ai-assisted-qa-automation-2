---
name: pom-conventions
description: Page Object Model conventions for Playwright tests in this
  project. Apply whenever generating, refactoring, or reviewing any
  Playwright test that interacts with the Didaxis UI — even if the user
  doesn't say "POM". Tests should never contain inline locators.
---

# Page Object Model Conventions

All UI interactions go through Page Objects in `pages/`. Tests describe
intent; POMs handle mechanics.

## Steps

1. One Page Object class per page or distinct component.
   Examples: `LoginPage`, `ProgramsPage`, `NewProgramModal`.

2. Define locators as `readonly` properties in the constructor.
   Priority order: `getByRole` → `getByLabel` / `getByPlaceholder` →
   `getByText` → `getByTestId` (escape hatch only — comment why
   role/label/text could not be used). Never CSS selectors or XPath.

3. When a locator matches multiple elements, disambiguate with
   `.filter({ hasText: … })` or `.filter({ has: … })` — never `.first()`
   to pick one.

4. Provide methods for user actions: `goto`, `clickX`, `fillY`, `submit`.
   Methods perform actions; they do not assert.

5. **No assertions inside Page Objects.** All `expect(...)` calls
   live in the test files, never in `pages/`.

6. Compose POMs when a page contains distinct components — e.g.
   `ProgramsPage` holds a `NewProgramModal` instance.

7. Import POMs at the top of each spec; instantiate with `new XxxPage(page)`.

## Waits & stability

- Never `waitForTimeout`. Use web-first assertions that auto-retry:
  `expect(locator).toBeVisible()`, `.toBeEnabled()`, `.toHaveText()`.
- Never snapshot booleans: replace `if (await locator.isVisible())` or
  `expect(await locator.isVisible()).toBe(true)` with
  `expect(locator).toBeVisible()` (or rely on action auto-wait).
- Prefer Playwright action auto-wait (click, fill) over manual
  `locator.waitFor()` when the action itself suffices.

## Output

Page Object files in `pages/`. Tests in `tests/` that import them.
