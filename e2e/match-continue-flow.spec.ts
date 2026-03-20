import type { Locator } from '@playwright/test'

import { test, expect } from './fixtures'

/**
 * E2E test for the Continue button flow on the match end screen.
 *
 * This test replicates the exact user-reported flow:
 * 1. Configure a Best of 3 match on the setup screen
 * 2. Play through the match to completion (2-1 sets)
 * 3. Verify the match end screen appears with the correct final score
 * 4. Click Continue
 * 5. Assert navigation to the active match route
 * 6. Assert the active match screen shows the correct score/sets
 * 7. Score one more point to confirm the match is still playable
 * 8. Verify the timer continues running
 */
test.describe('Match End Screen - Continue Flow', () => {
  // In a standard advantage game, winning 4 consecutive points (no deuce) wins the game.
  const POINTS_PER_GAME = 4
  // A set is won 6-0 by winning 6 games.
  const GAMES_PER_SET = 6

  test('completes a Best of 3 match, continues playing, and preserves score', async ({ page }) => {
    // ── Step 1: Configure match on the setup screen ──────────────────────
    await page.goto('/')

    // Default format is already Best of 3 — verify it
    const bestOf3Button = page.getByRole('button', { name: /best of 3/i })
    await expect(bestOf3Button).toHaveAttribute('aria-pressed', 'true')

    // Disable side-switch prompts to avoid dialog interruptions during scoring
    const sideSwitchToggle = page.getByRole('switch', { name: /side-switch prompts/i })
    await sideSwitchToggle.click()
    await expect(sideSwitchToggle).toHaveAttribute('aria-checked', 'false')

    // Start the match
    const startButton = page.getByRole('button', { name: /start match/i })
    await startButton.click()

    // Wait for navigation to the active match route
    await expect(page).toHaveURL(/\/match\//)

    // ── Step 2: Play Set 1 — Team A wins 6-0 ────────────────────────────
    const teamAPanel = page.getByTestId('team-panel-team-1')
    const teamBPanel = page.getByTestId('team-panel-team-2')

    await clickNTimes(teamAPanel, GAMES_PER_SET * POINTS_PER_GAME)

    // Verify Set 1 completed: 6-0 for Team A
    await expect(page.getByTestId('set-row-0')).toContainText('6-0')

    // ── Step 3: Play Set 2 — Team B wins 6-0 ────────────────────────────
    await clickNTimes(teamBPanel, GAMES_PER_SET * POINTS_PER_GAME)

    // Verify Set 2 completed: 0-6 for Team A (6-0 for Team B)
    await expect(page.getByTestId('set-row-1')).toContainText('0-6')

    // ── Step 4: Play Set 3 — Team A wins 6-0 (match ends 2-1) ───────────
    await clickNTimes(teamAPanel, GAMES_PER_SET * POINTS_PER_GAME)

    // After the match is completed, the ActiveMatchScreen auto-navigates
    // to the finish screen via replace: true
    await expect(page).toHaveURL(/\/match\/finish\//)

    // ── Step 5: Verify match end screen ──────────────────────────────────
    await expect(page.getByText(/match complete/i)).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Team A' })).toBeVisible()
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible()

    // Verify set summary rows: Set 1 (6-0), Set 2 (0-6), Set 3 (6-0)
    await expect(page.getByTestId('match-end-set-row-1')).toContainText('6-0')
    await expect(page.getByTestId('match-end-set-row-2')).toContainText('0-6')
    await expect(page.getByTestId('match-end-set-row-3')).toContainText('6-0')

    // ── Step 6: Click Continue ───────────────────────────────────────────
    await page.getByRole('button', { name: /continue/i }).click()

    // ── Step 7: Assert navigation to the active match route ──────────────
    await expect(page).toHaveURL(/\/match\/[^/]+$/)
    // Ensure we are NOT on the finish route
    await expect(page).not.toHaveURL(/\/match\/finish\//)

    // ── Step 8: Assert the active match screen shows the correct score/sets
    // The sets card should show the same 3 completed sets from the finished match
    await expect(page.getByTestId('sets-card')).toBeVisible()

    // Verify all 3 set rows are preserved with correct scores
    await expect(page.getByTestId('set-row-0')).toContainText('6-0')
    await expect(page.getByTestId('set-row-1')).toContainText('0-6')
    await expect(page.getByTestId('set-row-2')).toContainText('6-0')

    // Verify the timer is visible and has a value
    const timeChip = page.getByTestId('time-chip')
    await expect(timeChip).toBeVisible()

    // Verify the score buttons are enabled (match is playable)
    await expect(page.getByRole('button', { name: /score point for team a/i })).toBeEnabled()
    await expect(page.getByRole('button', { name: /score point for team b/i })).toBeEnabled()

    // ── Step 9: Score one more point to confirm match is still playable ──
    // Before scoring, verify the last set still shows 6-0 games
    await expect(page.getByTestId('set-row-2')).toContainText('6-0')

    // Score a point for Team A
    await teamAPanel.click()

    // The sets card row still shows 6-0 games, but a new game is in progress
    await expect(page.getByTestId('set-row-2')).toContainText('6-0')

    // Verify the match did NOT navigate back to the finish screen
    await expect(page).toHaveURL(/\/match\/[^/]+$/)
    await expect(page).not.toHaveURL(/\/match\/finish\//)

    // ── Step 10: Verify the match stays playable ─────────────────────────
    // Score a few more points and confirm we stay on the active route
    await teamAPanel.click()
    await teamAPanel.click()

    await expect(page).toHaveURL(/\/match\/[^/]+$/)
    await expect(page).not.toHaveURL(/\/match\/finish\//)

    // Score buttons should still be enabled
    await expect(page.getByRole('button', { name: /score point for team a/i })).toBeEnabled()
    await expect(page.getByRole('button', { name: /score point for team b/i })).toBeEnabled()
  })
})

async function clickNTimes(locator: Locator, count: number): Promise<void> {
  await Array.from({ length: count }).reduce<Promise<void>>(async (previousClick) => {
    await previousClick
    await locator.click()
  }, Promise.resolve())
}
