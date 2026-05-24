import { expect, test } from './fixtures';

import { dismissSideSwitchPromptIfVisible, startMatch, winQuickSet } from './helpers/match-flow';

test.describe('@happy-path @active-match Active match', () => {
  test('supports scoring flow, game completion, set updates, and side-switch prompts', async ({
    page
  }) => {
    test.slow();
    await startMatch(page, {
      format: 'best-of-1',
      sideSwitchPrompts: true,
      servingIndicatorEnabled: true,
      autoOpenSetsHistoryModal: false,
      team1Name: 'Lobos',
      team2Name: 'Rivals'
    });

    const team1Panel = page.getByTestId('team-panel-team-1');

    await team1Panel.click();
    await expect(team1Panel).toContainText('15');

    await team1Panel.click();
    await expect(team1Panel).toContainText('30');

    await team1Panel.click();
    await expect(team1Panel).toContainText('40');

    await team1Panel.click();
    await expect(page.getByTestId('set-row-current')).toContainText('1-0');
    await expect(page.getByTestId('side-switch-prompt')).toBeVisible();

    await dismissSideSwitchPromptIfVisible(page);
    await expect(page.getByTestId('side-switch-prompt')).toBeHidden();
  });

  test('completes a full match and reaches the finish route', async ({ page }) => {
    await startMatch(page, {
      format: 'best-of-1',
      sideSwitchPrompts: false,
      servingIndicatorEnabled: false,
      autoOpenSetsHistoryModal: false
    });

    await winQuickSet(page.getByTestId('team-panel-team-1'));

    await expect(page).toHaveURL(/\/match\/finish\/[^/]+$/);
    await expect(page.getByTestId('match-end-screen')).toBeVisible();
    await expect(page.getByRole('button', { name: /new match/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();
  });
});
