import { expect, test } from './fixtures';

import { expectCurrentMatchCleared, seedCompletedMatchRecord } from './helpers/persistence';

test.describe('@happy-path @match-end Match end', () => {
  test('renders winner, summary, and stats for a completed match', async ({ page }) => {
    const record = await seedCompletedMatchRecord(page);

    await page.goto(`/match/${record.matchId}`);

    await expect(page).toHaveURL(new RegExp(`/match/finish/${record.matchId}$`));
    await expect(page.getByTestId('match-end-winner-card')).toContainText('Team A');
    await expect(page.getByTestId('match-end-summary-card')).toContainText('6-0');
    await expect(page.getByTestId('match-end-duration')).toHaveText('5m');
    await expect(page.getByTestId('match-end-total-games')).toHaveText('6');
  });

  test('starts a new match and clears persisted current-match state', async ({ page }) => {
    const record = await seedCompletedMatchRecord(page);

    await page.goto(`/match/${record.matchId}`);
    await page.getByRole('button', { name: /new match/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: /start match/i })).toBeVisible();
    await expectCurrentMatchCleared(page);
  });

  test('continues a completed match on the active route with preserved score', async ({ page }) => {
    const record = await seedCompletedMatchRecord(page);

    await page.goto(`/match/${record.matchId}`);
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(new RegExp(`/match/${record.matchId}$`));
    await expect(page.getByTestId('set-row-current')).toContainText('0-0');
    await page.getByTestId('sets-card').click();
    await expect(page.getByTestId('sets-history-modal-list')).toContainText(/6\s*-\s*0/);
    await page.getByTestId('sets-history-modal-close').click();
    await expect(page.getByTestId('sets-history-modal')).not.toBeAttached();
    await expect(page.getByTestId('team-panel-team-1')).toContainText('0');

    await page.getByTestId('team-panel-team-1').click();
    await expect(page.getByTestId('team-panel-team-1')).toContainText('15');
    await expect(page).not.toHaveURL(/\/match\/finish\//);
  });
});
