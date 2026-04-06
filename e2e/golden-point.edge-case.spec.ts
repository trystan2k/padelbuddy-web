import { expect, test } from './fixtures';

import { clickNTimes, startMatch } from './helpers/match-flow';

test.describe('@edge-case @active-match Golden point scoring', () => {
  test('wins the game immediately on the point after deuce', async ({ page }) => {
    await startMatch(page, {
      format: 'best-of-1',
      gameMode: 'golden-point',
      sideSwitchPrompts: false,
      servingIndicatorEnabled: false
    });

    const team1Panel = page.getByTestId('team-panel-team-1');
    const team2Panel = page.getByTestId('team-panel-team-2');

    await clickNTimes(team1Panel, 3);
    await clickNTimes(team2Panel, 3);

    await expect(team1Panel).toContainText('40');
    await expect(team2Panel).toContainText('40');

    await team1Panel.click();

    await expect(page.getByTestId('set-row-0')).toContainText('1-0');
    await expect(team1Panel).toContainText('0');
    await expect(team2Panel).toContainText('0');
    await expect(team1Panel).not.toContainText('ad');
    await expect(team2Panel).not.toContainText('ad');
  });
});
