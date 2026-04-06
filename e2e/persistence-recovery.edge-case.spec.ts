import { expect, test } from './fixtures';

import {
  expectCurrentMatchCleared,
  seedInProgressMatchRecord,
  seedInvalidCurrentMatchRecord,
  seedSchemaMismatchRecord
} from './helpers/persistence';

test.describe('@edge-case @setup @active-match @match-end Persistence recovery', () => {
  test('shows the resume or discard dialog for an in-progress record', async ({ page }) => {
    await seedInProgressMatchRecord(page);

    await page.goto('/');

    await expect(page.getByRole('heading', { name: /resume saved match/i })).toBeVisible();
    await page.getByRole('button', { name: /discard match/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /resume saved match/i })).toHaveCount(0);
    await expectCurrentMatchCleared(page);

    await page.reload();
    await expect(page.getByRole('heading', { name: /resume saved match/i })).toHaveCount(0);
  });

  test('resumes an in-progress record without re-showing the stale prompt on reload', async ({
    page
  }) => {
    const record = await seedInProgressMatchRecord(page, { matchId: 'resumable-match' });

    await page.goto('/');
    await page.getByRole('button', { name: /resume match/i }).click();

    await expect(page).toHaveURL(new RegExp(`/match/${record.matchId}$`));
    await expect(page.getByTestId('set-row-0')).toContainText('1-0');

    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/match/${record.matchId}$`));
    await expect(page.getByRole('heading', { name: /resume saved match/i })).toHaveCount(0);
  });

  test('recovers from a corrupt record and clears persistence after reset', async ({ page }) => {
    await seedInvalidCurrentMatchRecord(page);

    await page.goto('/');

    await expect(page.getByRole('heading', { name: /saved match needs recovery/i })).toBeVisible();
    await page.getByRole('button', { name: /reset and continue/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: /start match/i })).toBeVisible();
    await expectCurrentMatchCleared(page);

    await page.reload();
    await expect(page.getByRole('heading', { name: /saved match needs recovery/i })).toHaveCount(0);
  });

  test('shows the schema-mismatch notice only once after auto-reset', async ({ page }) => {
    await seedSchemaMismatchRecord(page);

    await page.goto('/');

    await expect(page.getByText(/saved match was reset/i)).toBeVisible();
    await expectCurrentMatchCleared(page);

    await page.reload();
    await expect(page.getByText(/saved match was reset/i)).toHaveCount(0);
  });
});
