import { expect, test } from './fixtures'

import { assertNoHorizontalOverflow, gotoSetupScreen } from './helpers/match-flow'

test.describe('@happy-path @setup Setup screen', () => {
  test.beforeEach(async ({ page }) => {
    await gotoSetupScreen(page)
  })

  test('renders the setup form with all primary controls visible', async ({ page }) => {
    await expect(page).toHaveTitle(/padel buddy/i)
    await expect(page.getByRole('textbox', { name: /team 1/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /team 2/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /best of 1/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /best of 3/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await expect(page.getByRole('switch', { name: /golden point/i })).toBeVisible()
    await expect(page.getByRole('switch', { name: /side-switch prompts/i })).toBeVisible()
    await expect(page.getByRole('switch', { name: /serving indicator/i })).toBeVisible()
    await expect(page.getByRole('switch', { name: /countdown timer/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /start match/i })).toBeVisible()
    await assertNoHorizontalOverflow(page)
  })

  test('validates empty team names before starting a match', async ({ page }) => {
    await page.getByRole('textbox', { name: /team 1/i }).fill('')
    await page.getByRole('textbox', { name: /team 2/i }).fill('')
    await page.getByRole('button', { name: /start match/i }).click()

    await expect(page.getByText(/both team names are required/i)).toHaveCount(2)
    await expect(page).toHaveURL('/')
  })

  test('starts a match successfully with a valid setup', async ({ page }) => {
    await page.getByRole('textbox', { name: /team 1/i }).fill('Alpha')
    await page.getByRole('textbox', { name: /team 2/i }).fill('Beta')

    await page.getByRole('button', { name: /start match/i }).click()

    await expect(page).toHaveURL(/\/match\/[^/]+$/)
    await expect(page.getByTestId('sets-card')).toBeVisible()
  })
})
