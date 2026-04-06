import { expect, test } from './fixtures';

import {
  assertNoHorizontalOverflow,
  gotoSetupScreen,
  startMatch,
  winQuickSet
} from './helpers/match-flow';
import { isPortraitViewport, landscapeViewportCatalog, viewportCatalog } from './helpers/viewports';

test.describe('@responsive Responsive layout', () => {
  // ─── Setup Screen ──────────────────────────────────────────────────────────

  for (const viewport of viewportCatalog) {
    test(`setup screen stays usable on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await gotoSetupScreen(page);

      await expect(page.getByRole('textbox', { name: /team 1/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /team 2/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /start match/i })).toBeVisible();
      await assertNoHorizontalOverflow(page);
    });
  }

  // ─── Active Match - Portrait (phones show rotate blocker) ─────────────────

  const portraitPhoneViewport = viewportCatalog.find((v) => isPortraitViewport(v) && v.width < 500);

  if (!portraitPhoneViewport) {
    throw new Error('No portrait phone viewport found');
  }

  test(`active match shows rotate blocker on ${portraitPhoneViewport.name} (portrait)`, async ({
    page
  }) => {
    await page.setViewportSize({
      width: portraitPhoneViewport.width,
      height: portraitPhoneViewport.height
    });
    await startMatch(page, {
      format: 'best-of-1',
      sideSwitchPrompts: false,
      servingIndicatorEnabled: false
    });

    await expect(page.getByTestId('rotate-device-blocker')).toBeVisible();
    await expect(page.getByRole('heading', { name: /rotate your device/i })).toBeVisible();
  });

  // ─── Active Match - Landscape ─────────────────────────────────────────────

  for (const viewport of landscapeViewportCatalog) {
    test(`active match renders score panel on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await startMatch(page, {
        format: 'best-of-1',
        sideSwitchPrompts: false,
        servingIndicatorEnabled: false
      });

      await expect(page.getByTestId('rotate-device-blocker')).toHaveCount(0);
      await expect(page.getByTestId('team-panel-team-1')).toBeVisible();
      await expect(page.getByTestId('team-panel-team-2')).toBeVisible();
      await expect(page.getByTestId('sets-card')).toBeVisible();
      await expect(page.getByTestId('time-chip')).toBeVisible();
      await expect(page.getByTestId('finish-button')).toBeVisible();
      await assertNoHorizontalOverflow(page);
    });
  }

  // ─── Match End Screen - All Viewports ────────────────────────────────────

  for (const viewport of viewportCatalog) {
    test(`match end screen renders correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await startMatch(page, {
        team1Name: 'Team Alpha',
        team2Name: 'Team Beta',
        format: 'best-of-1',
        sideSwitchPrompts: false,
        servingIndicatorEnabled: false
      });

      const isPortrait = isPortraitViewport(viewport);
      if (isPortrait) {
        await page.setViewportSize({ width: viewport.height, height: viewport.width });
      }

      const team1Panel = page.getByTestId('team-panel-team-1');
      await winQuickSet(team1Panel, 6);

      if (isPortrait) {
        await page.setViewportSize({ width: viewport.height, height: viewport.width });
      }
      await expect(page).toHaveURL(/\/match\/finish\//);
      await expect(page.getByTestId('match-end-screen')).toBeVisible();
      await expect(page.getByTestId('match-end-winner-card')).toBeVisible();
      await expect(page.getByTestId('match-end-summary-card')).toBeVisible();
      await expect(page.getByTestId('new-match-button')).toBeVisible();
      await expect(page.getByTestId('continue-match-button')).toBeVisible();
    });
  }
});
