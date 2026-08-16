# Examples: Playwright test data cleanup

## Correct — UI create with response intercept

```typescript
import { test, expect } from '../fixtures/cleanup.fixture';

test('creates a program and lists it', async ({ page, trackProgram }) => {
  const programName = `QA Program ${Date.now()}`;

  const createResponse = page.waitForResponse(
    (res) => res.url().includes('/api/programs') && res.request().method() === 'POST'
  );

  await openNewProgramModal(page);
  await programNameField(page).fill(programName);
  await createButton(page).click();

  const response = await createResponse;
  const body = await response.json();
  trackProgram(body.data.id);

  await expect(programInList(page, programName)).toBeVisible();
});
```

## Correct — direct API create

```typescript
import { test, expect } from '../fixtures/cleanup.fixture';
import { request as playwrightRequest } from '@playwright/test';

test('creates a program via API', async ({ trackProgram }) => {
  const api = await playwrightRequest.newContext({
    baseURL: process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio',
  });

  const response = await api.post('/api/programs', {
    data: { name: `API Program ${Date.now()}`, description: 'cleanup example' },
    headers: { Authorization: `Bearer ${process.env.DIDAXIS_API_TOKEN}` },
  });

  const { data } = await response.json();
  trackProgram(data.id);

  expect(response.ok()).toBeTruthy();
  await api.dispose();
});
```

## Incorrect — do not do this

```typescript
// Wrong: imports test from @playwright/test — no automatic cleanup
import { test } from '@playwright/test';

// Wrong: manual afterAll instead of trackProgram + fixture
test.afterAll(async () => {
  await deleteProgramViaUi(page, programId);
});

// Wrong: hardcoded token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Wrong: deletes a program the test did not create
trackProgram('00000000-0000-0000-0000-000000000001');
```

## Review checklist

```
- [ ] test imported from fixtures/cleanup.fixture.ts
- [ ] trackProgram called immediately after create with response.data.id
- [ ] no manual afterAll/afterEach cleanup blocks
- [ ] no UI-based delete for teardown
- [ ] no hardcoded tokens; uses DIDAXIS_API_TOKEN or login fallback
- [ ] only UUIDs created in this test are tracked
```
