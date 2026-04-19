import { expect, test } from './fixtures';

import { assertNoHorizontalOverflow, gotoSetupScreen } from './helpers/match-flow';

test.describe('@happy-path @help Help page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/help');
    await expect(page).toHaveURL('/help');
  });

  test('renders the page title and TOC heading', async ({ page }) => {
    await expect(page).toHaveTitle(/padel buddy/i);
    await expect(page.getByRole('heading', { name: /on this page/i })).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test('renders all TOC links', async ({ page }) => {
    const tocNav = page.locator('nav[aria-labelledby="toc-heading"]');

    await expect(tocNav.getByRole('link', { name: /what is padel buddy/i })).toBeVisible();
    await expect(tocNav.getByRole('link', { name: /the main flow/i })).toBeVisible();
    await expect(tocNav.getByRole('link', { name: /setting up a match/i })).toBeVisible();
    await expect(tocNav.getByRole('link', { name: /live match screen/i })).toBeVisible();
    await expect(tocNav.getByRole('link', { name: /match end screen/i })).toBeVisible();
    await expect(tocNav.getByRole('link', { name: /match history/i })).toBeVisible();
    await expect(tocNav.getByRole('link', { name: /recovery and reliability/i })).toBeVisible();
    await expect(tocNav.getByRole('link', { name: /built-in help system/i })).toBeVisible();
    await expect(tocNav.getByRole('link', { name: /languages and accessibility/i })).toBeVisible();
    await expect(tocNav.getByRole('link', { name: /web, pwa, and native apps/i })).toBeVisible();
    await expect(tocNav.getByRole('link', { name: /small but important details/i })).toBeVisible();
  });

  test('renders all section headings', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /what is padel buddy\?/i, level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /the main flow of the app/i, level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /setting up a match/i, level: 2 })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: /live match screen/i, level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /match end screen/i, level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /match history/i, level: 2 })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /recovery, safety, and reliability/i, level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /help system inside the app/i, level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /languages and accessibility/i, level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /pwa, offline use, web, and native apps/i, level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /small but important details/i, level: 2 })
    ).toBeVisible();
  });

  test('TOC link scrolls to the correct section', async ({ page }) => {
    const tocNav = page.locator('nav[aria-labelledby="toc-heading"]');

    await tocNav.getByRole('link', { name: /match history/i }).click();

    await expect(page).toHaveURL('/help#history');
    await expect(page.locator('#history')).toBeVisible();
  });

  test('back button navigates to the previous page', async ({ page }) => {
    await gotoSetupScreen(page);
    await page.goto('/help');

    await page.getByRole('button', { name: /back/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: /start match/i })).toBeVisible();
  });

  test('language selector is visible and shows the current locale', async ({ page }) => {
    const localeButton = page.getByRole('button', { name: /english/i });

    await expect(localeButton).toBeVisible();
    await expect(localeButton).toHaveAttribute('aria-haspopup', 'true');
  });

  test('switching language to Spanish updates page content', async ({ page }) => {
    await page.getByRole('button', { name: /english/i }).click();

    const menu = page.locator('#locale-menu');
    await expect(menu).toBeVisible();

    await menu.getByRole('button', { name: /español/i }).click();

    await expect(page.getByRole('button', { name: /español/i })).toBeVisible();
    await expect(
      page.locator('nav[aria-labelledby="toc-heading"]').getByRole('link', {
        name: /¿qué es padel buddy\?/i
      })
    ).toBeVisible();
  });

  test('switching language to Portuguese updates page content', async ({ page }) => {
    await page.getByRole('button', { name: /english/i }).click();

    const menu = page.locator('#locale-menu');
    await expect(menu).toBeVisible();

    await menu.getByRole('button', { name: /português/i }).click();

    await expect(page.getByRole('button', { name: /português/i })).toBeVisible();
    await expect(
      page.locator('nav[aria-labelledby="toc-heading"]').getByRole('link', {
        name: /o que é o padel buddy\?/i
      })
    ).toBeVisible();
  });

  test('help trigger button is not shown on the help page', async ({ page }) => {
    await expect(page.getByTestId('help-trigger')).toBeHidden();
  });
});
