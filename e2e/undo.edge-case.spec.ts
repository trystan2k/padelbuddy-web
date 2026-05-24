import { expect, test } from './fixtures';

import { startMatch, winQuickGame } from './helpers/match-flow';

test.describe('@edge-case @active-match Undo scoring', () => {
  test('enables undo after scoring and can rewind a completed game boundary', async ({ page }) => {
    await startMatch(page, {
      format: 'best-of-1',
      sideSwitchPrompts: false,
      servingIndicatorEnabled: false,
      autoOpenSetsHistoryModal: false
    });

    const team1Panel = page.getByTestId('team-panel-team-1');
    const team2UndoButton = page.getByTestId('revert-button-team-2');
    const team1UndoButton = page.getByTestId('revert-button-team-1');

    await expect(team1UndoButton).toBeDisabled();
    await expect(team2UndoButton).toBeDisabled();

    await team1Panel.click();
    await expect(team1UndoButton).toBeEnabled();
    await expect(team2UndoButton).toBeDisabled();
    await expect(team1Panel).toContainText('15');

    await team1UndoButton.click();
    await expect(team1UndoButton).toBeDisabled();
    await expect(team1Panel).toContainText('0');

    await winQuickGame(team1Panel);
    await expect(page.getByTestId('set-row-current')).toContainText('1-0');

    await team1UndoButton.click();
    await expect(page.getByTestId('set-row-current')).toContainText('0-0');
    await expect(team1Panel).toContainText('40');
  });
});
