import { expect, test } from './fixtures';

import { clearHistoryRecords, seedHistoryRecord } from './helpers/history';

test.describe('@happy-path @history History screen', () => {
  test('renders history records with correct team names, date, sets, and games', async ({
    page
  }) => {
    await seedHistoryRecord(page, {
      matchId: 'history-render-test',
      team1Name: 'Alpha',
      team2Name: 'Beta'
    });

    await page.goto('/history');

    await expect(page.getByText('Alpha')).toBeVisible();
    await expect(page.getByText('Beta')).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('1-0')).toBeVisible();

    const gamesCell = page.getByTestId('history-games-history-render-test');
    await expect(gamesCell).toContainText(/6\s*-\s*0/);
  });

  test('share button is visible and clickable', async ({ page }) => {
    const record = await seedHistoryRecord(page, {
      matchId: 'history-share-test',
      team1Name: 'Share Team 1',
      team2Name: 'Share Team 2'
    });

    await page.goto('/history');

    const shareButton = page.getByTestId(`history-share-${record.matchId}`);
    await expect(shareButton).toBeVisible();
    await expect(shareButton).toBeEnabled();
  });

  test('delete button shows confirmation and removes record on confirm', async ({ page }) => {
    const record = await seedHistoryRecord(page, {
      matchId: 'history-delete-confirm-test',
      team1Name: 'Delete Confirm',
      team2Name: 'Opponent'
    });

    await page.goto('/history');

    await expect(page.getByText('Delete Confirm')).toBeVisible();

    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    await page.getByTestId(`history-delete-${record.matchId}`).click();

    await expect(page.getByText('Delete Confirm')).toBeHidden();
  });

  test('delete button cancels and keeps record on cancel', async ({ page }) => {
    const record = await seedHistoryRecord(page, {
      matchId: 'history-delete-cancel-test',
      team1Name: 'Delete Cancel',
      team2Name: 'Opponent'
    });

    await page.goto('/history');

    await expect(page.getByText('Delete Cancel')).toBeVisible();

    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.dismiss();
    });

    await page.getByTestId(`history-delete-${record.matchId}`).click();

    await expect(page.getByText('Delete Cancel')).toBeVisible();
  });

  test('play again button navigates to setup with team names pre-filled', async ({ page }) => {
    await seedHistoryRecord(page, {
      matchId: 'history-play-again-test',
      team1Name: 'Raptors',
      team2Name: 'Wolves'
    });

    await page.goto('/history');

    const playAgainButton = page.getByText('Play Again', { exact: true });
    await expect(playAgainButton).toBeVisible();
    await playAgainButton.click();

    await expect(page).toHaveURL('/');

    await expect(page.getByRole('textbox', { name: /team 1/i })).toHaveValue('Raptors');
    await expect(page.getByRole('textbox', { name: /team 2/i })).toHaveValue('Wolves');
  });

  test('back button navigates to home', async ({ page }) => {
    await page.goto('/history');

    const backButton = page.getByRole('button', { name: /back/i });
    await expect(backButton).toBeVisible();
    await backButton.click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: /start match/i })).toBeVisible();
  });

  test('renders empty state when no history records', async ({ page }) => {
    await page.goto('/history');
    await clearHistoryRecords(page);
    await page.goto('/history');

    await expect(page.getByText(/no finished matches yet/i)).toBeVisible();
    await expect(page.getByRole('table')).toBeHidden();
  });
});
