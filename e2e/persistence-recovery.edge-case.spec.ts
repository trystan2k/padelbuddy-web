import type { Locator, Page } from '@playwright/test';

import { expect, test } from './fixtures';

import {
  expectCurrentMatchCleared,
  seedInProgressMatchRecord,
  seedInvalidCurrentMatchRecord,
  seedSchemaMismatchRecord
} from './helpers/persistence';

const mirroredResumeActions = Array.from({ length: 4 }, () => ({
  type: 'score-point' as const,
  teamId: 'team-1' as const
}));

const startupReadyAttemptTimeoutMs = 8_000;
const startupReadyBudgetMs = 26_000;
const maxStartupNavigationAttempts = 3;

function isTransientNavigationError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes('ERR_CONNECTION_REFUSED') ||
    message.includes('ERR_CONNECTION_RESET') ||
    message.includes('ERR_NETWORK_CHANGED') ||
    message.includes('ECONNREFUSED') ||
    message.includes('Navigation timeout')
  );
}

function isRetryableStartupReadinessError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes('expect(locator).toBeVisible() failed') ||
    message.includes('element(s) not found')
  );
}

async function gotoHomeAndWaitForVisible(page: Page, locator: Locator): Promise<void> {
  const startedAt = Date.now();

  async function navigate(attempt: number): Promise<void> {
    const elapsedMs = Date.now() - startedAt;
    const remainingBudgetMs = startupReadyBudgetMs - elapsedMs;

    if (remainingBudgetMs <= 0) {
      throw new Error(
        `Home startup UI not ready within ${String(startupReadyBudgetMs)}ms total retry budget.`
      );
    }

    const readinessTimeoutMs = Math.min(startupReadyAttemptTimeoutMs, remainingBudgetMs);

    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(locator).toBeVisible({ timeout: readinessTimeoutMs });
    } catch (error) {
      const isLastAttempt = attempt === maxStartupNavigationAttempts;
      const nextAttemptElapsedMs = Date.now() - startedAt;
      const hasBudgetForRetry = nextAttemptElapsedMs < startupReadyBudgetMs;

      if (
        isLastAttempt ||
        !hasBudgetForRetry ||
        (!isTransientNavigationError(error) && !isRetryableStartupReadinessError(error))
      ) {
        throw error;
      }

      await page.waitForTimeout(250 * attempt);
      await navigate(attempt + 1);
    }
  }

  await navigate(1);
}

async function expectVisualTeamOrder(
  page: Page,
  expectedOrder: readonly [
    'team-panel-team-1' | 'team-panel-team-2',
    'team-panel-team-1' | 'team-panel-team-2'
  ]
) {
  const teamPanels = page.locator('[data-testid^="team-panel-"]');

  await expect(teamPanels).toHaveCount(2);
  await expect
    .poll(async () => {
      return Promise.all([
        teamPanels.nth(0).getAttribute('data-testid'),
        teamPanels.nth(1).getAttribute('data-testid')
      ]);
    })
    .toEqual([...expectedOrder]);
}

test.describe('@edge-case @setup @active-match @match-end Persistence recovery', () => {
  test('shows the resume or discard dialog for an in-progress record', async ({ page }) => {
    await seedInProgressMatchRecord(page);

    await gotoHomeAndWaitForVisible(
      page,
      page.getByRole('heading', { name: /resume saved match/i })
    );
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

    await gotoHomeAndWaitForVisible(page, page.getByRole('button', { name: /resume match/i }));
    await page.getByRole('button', { name: /resume match/i }).click();

    await expect(page).toHaveURL(new RegExp(`/match/${record.matchId}$`));
    await expect(page.getByTestId('set-row-current')).toContainText('1-0');

    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/match/${record.matchId}$`));
    await expect(page.getByRole('heading', { name: /resume saved match/i })).toHaveCount(0);
  });

  test('resumes and reloads into the same mirrored layout when side switch parity is due', async ({
    page
  }) => {
    const record = await seedInProgressMatchRecord(page, {
      matchId: 'mirrored-resume-match',
      setupOverrides: {
        sideSwitchPrompts: true
      },
      actions: mirroredResumeActions
    });

    await gotoHomeAndWaitForVisible(page, page.getByRole('button', { name: /resume match/i }));
    await page.getByRole('button', { name: /resume match/i }).click();

    await expect(page).toHaveURL(new RegExp(`/match/${record.matchId}$`));
    await expect(page.getByTestId('side-switch-prompt')).toBeVisible();
    await expect(page.getByTestId('set-row-current')).toContainText('0-1');
    await expectVisualTeamOrder(page, ['team-panel-team-2', 'team-panel-team-1']);

    await page.getByRole('button', { name: /switched/i }).click();
    await expect(page.getByTestId('side-switch-prompt')).toBeHidden();

    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/match/${record.matchId}$`));
    await expect(page.getByRole('heading', { name: /resume saved match/i })).toHaveCount(0);
    await expect(page.getByTestId('set-row-current')).toContainText('0-1');
    await expectVisualTeamOrder(page, ['team-panel-team-2', 'team-panel-team-1']);
  });

  test('recovers from a corrupt record and clears persistence after reset', async ({ page }) => {
    await seedInvalidCurrentMatchRecord(page);

    await gotoHomeAndWaitForVisible(
      page,
      page.getByRole('heading', { name: /saved match needs recovery/i })
    );
    await page.getByRole('button', { name: /reset and continue/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: /start match/i })).toBeVisible();
    await expectCurrentMatchCleared(page);

    await page.reload();
    await expect(page.getByRole('heading', { name: /saved match needs recovery/i })).toHaveCount(0);
  });

  test('shows the schema-mismatch notice only once after auto-reset', async ({ page }) => {
    await seedSchemaMismatchRecord(page);

    await gotoHomeAndWaitForVisible(page, page.getByText(/saved match was reset/i));
    await expectCurrentMatchCleared(page);

    await page.reload();
    await expect(page.getByText(/saved match was reset/i)).toHaveCount(0);
  });
});
