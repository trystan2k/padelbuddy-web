import { expect, test } from './fixtures';

import { clickNTimes, startMatch } from './helpers/match-flow';

test.describe('@edge-case @active-match Advantage and deuce scoring', () => {
  test('requires a two-point advantage to close the game', async ({ page }) => {
    test.slow();
    await startMatch(page, {
      format: 'best-of-1',
      gameMode: 'advantage',
      sideSwitchPrompts: false,
      servingIndicatorEnabled: false,
      autoOpenSetsHistoryModal: false
    });

    const team1Panel = page.getByTestId('team-panel-team-1');
    const team2Panel = page.getByTestId('team-panel-team-2');

    await clickNTimes(team1Panel, 3);
    await clickNTimes(team2Panel, 3);

    await expect(team1Panel).toContainText('40');
    await expect(team2Panel).toContainText('40');

    await team1Panel.click();
    await expect(team1Panel).toContainText('ad');
    await expect(team2Panel).toContainText('40');
    await expect(page.getByTestId('set-row-current')).toContainText('0-0');

    await team2Panel.click();
    await expect(team1Panel).toContainText('40');
    await expect(team2Panel).toContainText('40');

    await team2Panel.click();
    await expect(team1Panel).toContainText('40');
    await expect(team2Panel).toContainText('ad');
    await expect(page.getByTestId('set-row-current')).toContainText('0-0');

    await team2Panel.click();
    await expect(page.getByTestId('set-row-current')).toContainText('0-1');
    await expect(team1Panel).toContainText('0');
    await expect(team2Panel).toContainText('0');
  });
});
