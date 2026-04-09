import type { Locator, Page } from '@playwright/test';

import { expect } from '../fixtures';

import type {
  CountdownTimerDuration,
  MatchFormat,
  MatchGameMode,
  MatchTeamId
} from '../../src/core/match/types';

interface StartMatchOptions {
  team1Name?: string;
  team2Name?: string;
  format?: MatchFormat;
  gameMode?: MatchGameMode;
  initialServer?: MatchTeamId;
  decidingSetSuperTiebreak?: boolean;
  sideSwitchPrompts?: boolean;
  servingIndicatorEnabled?: boolean;
  countdownTimerEnabled?: boolean;
  countdownTimerDuration?: CountdownTimerDuration;
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

async function setToggle(page: Page, label: RegExp, checked: boolean): Promise<void> {
  const toggle = page.getByRole('switch', { name: label });
  const currentValue = await toggle.getAttribute('aria-checked');

  if ((currentValue === 'true') !== checked) {
    await toggle.click();
  }

  await expect(toggle).toHaveAttribute('aria-checked', checked ? 'true' : 'false');
}

export async function gotoSetupScreen(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /start match/i })).toBeVisible();
}

export async function startMatch(page: Page, options: StartMatchOptions = {}): Promise<void> {
  const {
    team1Name = 'Team A',
    team2Name = 'Team B',
    format = 'best-of-3',
    gameMode = 'advantage',
    initialServer = 'team-1',
    decidingSetSuperTiebreak = false,
    sideSwitchPrompts = false,
    servingIndicatorEnabled = false,
    countdownTimerEnabled = false,
    countdownTimerDuration = 90
  } = options;

  await gotoSetupScreen(page);

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

  await setToggle(page, /side-switch prompts/i, sideSwitchPrompts);
  await setToggle(page, /serving indicator/i, servingIndicatorEnabled);
  await setToggle(page, /countdown timer/i, countdownTimerEnabled);

  if (countdownTimerEnabled) {
    await page
      .getByRole('radio', { name: countdownDurationLabels[countdownTimerDuration] })
      .click();
  }

  if (format !== 'best-of-1') {
    await setToggle(page, /super tiebreak/i, decidingSetSuperTiebreak);
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
