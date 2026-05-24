import type { Locator, Page } from '@playwright/test';

import { expect } from '../fixtures';

import type {
  CountdownTimerDuration,
  MatchFormat,
  MatchGameMode,
  MatchTeamId,
  SuperTiebreakTargetPoints
} from '../../src/core/match/types';
import { persistenceDatabaseName } from '../../src/lib/persistence/indexed-db';

interface StartMatchOptions {
  team1Name?: string;
  team2Name?: string;
  format?: MatchFormat;
  gameMode?: MatchGameMode;
  initialServer?: MatchTeamId;
  decidingSetSuperTiebreak?: boolean;
  superTiebreakTargetPoints?: SuperTiebreakTargetPoints;
  autoOpenSetsHistoryModal?: boolean;
  sideSwitchPrompts?: boolean;
  servingIndicatorEnabled?: boolean;
  countdownTimerEnabled?: boolean;
  countdownTimerDuration?: CountdownTimerDuration;
}

interface GotoSetupScreenOptions {
  resetPersistence?: boolean;
}

const formatButtonLabels: Record<MatchFormat, RegExp> = {
  'best-of-1': /best of 1/i,
  'best-of-3': /best of 3/i,
  'best-of-5': /best of 5/i
};

const countdownDurationLabels: Record<CountdownTimerDuration, RegExp> = {
  60: /1:00 h/i,
  90: /1:30 h/i,
  120: /2:00 h/i
};

const setupReadyAttemptTimeoutMs = 8_000;
const setupReadyBudgetMs = 26_000;
const maxSetupNavigationAttempts = 3;

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

function isRetryableSetupReadinessError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes('expect(locator).toBeVisible() failed') ||
    message.includes('expect(locator).toHaveCount() failed') ||
    message.includes("getByTestId('rules-card')")
  );
}

async function resetClientPersistenceForSetup(page: Page): Promise<void> {
  await page.evaluate(
    async ({ databaseName }) => {
      localStorage.clear();
      sessionStorage.clear();

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
      }

      await new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase(databaseName);

        request.addEventListener('success', () => resolve());
        request.addEventListener('error', () => resolve());
        request.addEventListener('blocked', () => resolve());
      });
    },
    { databaseName: persistenceDatabaseName }
  );
}

async function waitForSetupScreenReady(page: Page, timeoutMs: number): Promise<void> {
  // Keep setup readiness locale-agnostic: labels can change with i18n, but
  // structure stays stable (rules card + two team inputs).
  const rulesCard = page.getByTestId('rules-card');
  const teamNameInputs = page.getByRole('textbox');

  await expect(rulesCard).toBeVisible({ timeout: timeoutMs });
  await expect(teamNameInputs).toHaveCount(2, { timeout: timeoutMs });
  await expect(teamNameInputs.nth(0)).toBeVisible({ timeout: timeoutMs });
  await expect(teamNameInputs.nth(1)).toBeVisible({ timeout: timeoutMs });
}

async function setToggle(page: Page, label: RegExp, checked: boolean): Promise<void> {
  const toggle = page.getByRole('switch', { name: label });
  const currentValue = await toggle.getAttribute('aria-checked');

  if ((currentValue === 'true') !== checked) {
    await toggle.click();
  }

  await expect(toggle).toHaveAttribute('aria-checked', checked ? 'true' : 'false');
}

export async function gotoSetupScreen(
  page: Page,
  options: GotoSetupScreenOptions = {}
): Promise<void> {
  const { resetPersistence = false } = options;
  const startedAt = Date.now();
  let didInitialOriginPersistenceReset = false;

  async function navigate(attempt: number): Promise<void> {
    const elapsedMs = Date.now() - startedAt;
    const remainingBudgetMs = setupReadyBudgetMs - elapsedMs;

    if (remainingBudgetMs <= 0) {
      throw new Error(
        `Setup screen not ready within ${String(setupReadyBudgetMs)}ms total retry budget.`
      );
    }

    const readinessTimeoutMs = Math.min(setupReadyAttemptTimeoutMs, remainingBudgetMs);

    try {
      if (resetPersistence && !didInitialOriginPersistenceReset) {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await resetClientPersistenceForSetup(page);
        didInitialOriginPersistenceReset = true;
      }

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await waitForSetupScreenReady(page, readinessTimeoutMs);
    } catch (error) {
      const isLastAttempt = attempt === maxSetupNavigationAttempts;
      const nextAttemptElapsedMs = Date.now() - startedAt;
      const hasBudgetForRetry = nextAttemptElapsedMs < setupReadyBudgetMs;

      if (
        isLastAttempt ||
        !hasBudgetForRetry ||
        (!isTransientNavigationError(error) && !isRetryableSetupReadinessError(error))
      ) {
        throw error;
      }

      await page.waitForTimeout(250 * attempt);
      await navigate(attempt + 1);
    }
  }

  await navigate(1);
}

export async function startMatch(page: Page, options: StartMatchOptions = {}): Promise<void> {
  const {
    team1Name = 'Team A',
    team2Name = 'Team B',
    format = 'best-of-3',
    gameMode = 'advantage',
    initialServer = 'team-1',
    decidingSetSuperTiebreak = false,
    superTiebreakTargetPoints = 11,
    autoOpenSetsHistoryModal = true,
    sideSwitchPrompts = false,
    servingIndicatorEnabled = false,
    countdownTimerEnabled = false,
    countdownTimerDuration = 90
  } = options;

  await gotoSetupScreen(page, { resetPersistence: true });

  await page.getByRole('textbox', { name: /team 1/i }).fill(team1Name);
  await page.getByRole('textbox', { name: /team 2/i }).fill(team2Name);

  if (format !== 'best-of-3') {
    await page.getByRole('button', { name: formatButtonLabels[format] }).click();
  }

  await setToggle(page, /golden point/i, gameMode === 'golden-point');

  if (initialServer === 'team-2') {
    await page.getByRole('button', { name: /^team 2$/i }).click();
    await expect(page.getByRole('button', { name: /^team 2$/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  }

  await setToggle(page, /auto-open sets history/i, autoOpenSetsHistoryModal);
  await setToggle(page, /side-switch prompts/i, sideSwitchPrompts);
  await setToggle(page, /serving indicator/i, servingIndicatorEnabled);
  await setToggle(page, /countdown timer/i, countdownTimerEnabled);

  if (countdownTimerEnabled) {
    await page
      .getByRole('radio', { name: countdownDurationLabels[countdownTimerDuration] })
      .click();
  }

  await setToggle(page, /super tiebreak/i, decidingSetSuperTiebreak);

  if (decidingSetSuperTiebreak) {
    await page
      .locator(`[data-super-tiebreak-target="${String(superTiebreakTargetPoints)}"]`)
      .click();
  }

  await page.getByRole('button', { name: /start match/i }).click();
  await expect(page).toHaveURL(/\/match\//);
  await expect(page).not.toHaveURL(/\/match\/finish\//);
}

export async function clickNTimes(locator: Locator, count: number): Promise<void> {
  if (count <= 0) {
    return;
  }

  await locator.click();
  await clickNTimes(locator, count - 1);
}

export async function winQuickGame(teamPanel: Locator): Promise<void> {
  await clickNTimes(teamPanel, 4);
}

export async function winQuickSet(teamPanel: Locator, games = 6): Promise<void> {
  if (games <= 0) {
    return;
  }

  await winQuickGame(teamPanel);
  await winQuickSet(teamPanel, games - 1);
}

export async function dismissSideSwitchPromptIfVisible(page: Page): Promise<void> {
  const prompt = page.getByTestId('side-switch-prompt');

  if (!(await prompt.isVisible())) {
    return;
  }

  await page.getByRole('button', { name: /switched/i }).click();
  await expect(prompt).toBeHidden();
}

export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  expect(hasOverflow, 'Page should not have horizontal overflow at current viewport size').toBe(
    false
  );
}
