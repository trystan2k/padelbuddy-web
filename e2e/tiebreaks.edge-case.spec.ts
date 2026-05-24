import { expect, test } from './fixtures';

import {
  clickNTimes,
  gotoSetupScreen,
  startMatch,
  winQuickGame,
  winQuickSet
} from './helpers/match-flow';

test.describe('@edge-case @active-match @match-end Tiebreak flows', () => {
  test('plays a standard set tiebreak at 6-6 and records a 7-6 set', async ({ page }) => {
    await startMatch(page, {
      format: 'best-of-1',
      sideSwitchPrompts: false,
      servingIndicatorEnabled: false
    });

    const team1Panel = page.getByTestId('team-panel-team-1');
    const team2Panel = page.getByTestId('team-panel-team-2');

    await Array.from({ length: 6 }).reduce(async (previousGame) => {
      await previousGame;
      await winQuickGame(team1Panel);
      await winQuickGame(team2Panel);
    }, Promise.resolve());

    await expect(page.getByTestId('set-row-0')).toContainText('6-6');

    await clickNTimes(team1Panel, 2);
    await team2Panel.click();
    await expect(team1Panel).toContainText('2');
    await expect(team2Panel).toContainText('1');

    await clickNTimes(team1Panel, 4);
    await clickNTimes(team2Panel, 4);
    await expect(team1Panel).toContainText('6');
    await expect(team2Panel).toContainText('5');

    await team1Panel.click();

    await expect(page).toHaveURL(/\/match\/finish\/[^/]+$/);
    await expect(page.getByTestId('match-end-set-row-1')).toContainText('7-6');
  });

  test('uses default deciding-set super tiebreak target (11) in best-of-3', async ({ page }) => {
    await startMatch(page, {
      format: 'best-of-3',
      decidingSetSuperTiebreak: true,
      sideSwitchPrompts: false,
      servingIndicatorEnabled: false
    });

    const team1Panel = page.getByTestId('team-panel-team-1');
    const team2Panel = page.getByTestId('team-panel-team-2');

    await winQuickSet(team1Panel);
    await winQuickSet(team2Panel);

    await expect(team1Panel).toContainText('0');
    await expect(team2Panel).toContainText('0');

    await clickNTimes(team1Panel, 10);
    await clickNTimes(team2Panel, 9);
    await expect(team1Panel).toContainText('10');
    await expect(team2Panel).toContainText('9');

    await team1Panel.click();

    await expect(page).toHaveURL(/\/match\/finish\/[^/]+$/);
    await expect(page.getByTestId('match-end-set-row-3')).toContainText('11-9');
  });

  test('uses configured deciding-set super tiebreak target (9) and keeps win-by-2', async ({
    page
  }) => {
    await startMatch(page, {
      format: 'best-of-3',
      decidingSetSuperTiebreak: true,
      superTiebreakTargetPoints: 9,
      sideSwitchPrompts: false,
      servingIndicatorEnabled: false
    });

    const team1Panel = page.getByTestId('team-panel-team-1');
    const team2Panel = page.getByTestId('team-panel-team-2');

    await winQuickSet(team1Panel);
    await winQuickSet(team2Panel);

    await clickNTimes(team1Panel, 8);
    await clickNTimes(team2Panel, 8);
    await expect(team1Panel).toContainText('8');
    await expect(team2Panel).toContainText('8');

    await team1Panel.click();
    await expect(team1Panel).toContainText('9');
    await expect(team2Panel).toContainText('8');

    await team1Panel.click();

    await expect(page).toHaveURL(/\/match\/finish\/[^/]+$/);
    await expect(page.getByTestId('match-end-set-row-3')).toContainText('10-8');
  });

  test('best-of-1 full-set flow ignores selected super tiebreak target and plays regular set', async ({
    page
  }) => {
    await gotoSetupScreen(page);
    await page.getByRole('switch', { name: /super tiebreak/i }).click();
    await page.locator('[data-super-tiebreak-target="7"]').click();

    await startMatch(page, {
      format: 'best-of-1',
      sideSwitchPrompts: false,
      servingIndicatorEnabled: false,
      countdownTimerEnabled: false
    });

    const team1Panel = page.getByTestId('team-panel-team-1');

    await winQuickSet(team1Panel);

    await expect(page).toHaveURL(/\/match\/finish\/[^/]+$/);
    await expect(page.getByTestId('match-end-set-row-1')).toContainText('6-0');
  });
});
