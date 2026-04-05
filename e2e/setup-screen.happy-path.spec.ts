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

  test('supports happy-path setup configuration changes and locale switching', async ({ page }) => {
    const team1Input = page.getByRole('textbox', { name: /team 1/i })
    const team2Input = page.getByRole('textbox', { name: /team 2/i })

    await team1Input.fill('Lobos')
    await team2Input.fill('Rivais')
    await expect(team1Input).toHaveValue('Lobos')
    await expect(team2Input).toHaveValue('Rivais')

    await page.getByRole('button', { name: /best of 1/i }).click()
    await expect(page.getByRole('switch', { name: /super tiebreak/i })).toHaveCount(0)

    await page.getByRole('button', { name: /best of 5/i }).click()
    await expect(page.getByRole('button', { name: /best of 5/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    await page.getByRole('button', { name: /^team 2$/i }).click()
    await expect(page.getByRole('button', { name: /^team 2$/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    await page.getByRole('switch', { name: /golden point/i }).click()
    await page.getByRole('switch', { name: /side-switch prompts/i }).click()
    await page.getByRole('switch', { name: /countdown timer/i }).click()
    await page.getByRole('radio', { name: /2:00 h/i }).click()
    await page.getByRole('switch', { name: /super tiebreak/i }).click()

    await expect(page.getByRole('switch', { name: /golden point/i })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    await expect(page.getByRole('switch', { name: /side-switch prompts/i })).toHaveAttribute(
      'aria-checked',
      'false'
    )
    await expect(page.getByRole('switch', { name: /countdown timer/i })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    await expect(page.getByRole('radio', { name: /2:00 h/i })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    await expect(page.getByRole('switch', { name: /super tiebreak/i })).toHaveAttribute(
      'aria-checked',
      'true'
    )

    await page.getByRole('button', { name: /english|português|español/i }).click()
    await page.getByRole('button', { name: /português/i }).click()
    await expect(page.getByRole('button', { name: /português/i })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('button', { name: /português/i })).toBeVisible()
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
