import { test, expect } from './fixtures'

test.describe('Setup Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page renders correctly with all sections', async ({ page }) => {
    // Verify page title contains app name
    await expect(page).toHaveTitle(/Padel Buddy/)

    // Verify main heading (app name) is visible with explicit text
    await expect(page.getByRole('heading', { name: /padel buddy/i, level: 1 })).toBeVisible()

    // Verify team name inputs are present
    await expect(page.getByRole('textbox', { name: /team 1/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /team 2/i })).toBeVisible()

    // Verify format options are present (Best of 1, Best of 3, Best of 5)
    await expect(page.getByRole('button', { name: /best of 1/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /best of 3/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /best of 5/i })).toBeVisible()

    // Verify Start Match button is present (use more specific locator)
    await expect(page.getByRole('button', { name: /start match/i })).toBeVisible()

    // Verify locale chip is present
    await expect(page.getByRole('button', { name: /english|português|español/i })).toBeVisible()
  })

  test('team name inputs accept text', async ({ page }) => {
    // Type into Team 1 input
    const team1Input = page.getByRole('textbox', { name: /team 1/i })
    await team1Input.fill('Player A')
    await expect(team1Input).toHaveValue('Player A')

    // Type into Team 2 input
    const team2Input = page.getByRole('textbox', { name: /team 2/i })
    await team2Input.fill('Player B')
    await expect(team2Input).toHaveValue('Player B')
  })

  test('format selection works', async ({ page }) => {
    // Click on "Best of 3" option
    const bestOf3Button = page.getByRole('button', { name: /best of 3/i })
    await bestOf3Button.click()
    await expect(bestOf3Button).toHaveAttribute('aria-pressed', 'true')

    // Click on "Best of 5" option
    const bestOf5Button = page.getByRole('button', { name: /best of 5/i })
    await bestOf5Button.click()
    await expect(bestOf5Button).toHaveAttribute('aria-pressed', 'true')
    await expect(bestOf3Button).toHaveAttribute('aria-pressed', 'false')

    // Click on "Best of 1" option
    const bestOf1Button = page.getByRole('button', { name: /best of 1/i })
    await bestOf1Button.click()
    await expect(bestOf1Button).toHaveAttribute('aria-pressed', 'true')
    await expect(bestOf5Button).toHaveAttribute('aria-pressed', 'false')
  })

  test('initial server selection works', async ({ page }) => {
    // Find server selection buttons by their text content
    const team1ServerButton = page.getByRole('button', { name: /^team 1$/i })
    const team2ServerButton = page.getByRole('button', { name: /^team 2$/i })

    // Click Team 2 server option
    await team2ServerButton.click()
    await expect(team2ServerButton).toHaveAttribute('aria-pressed', 'true')
    await expect(team1ServerButton).toHaveAttribute('aria-pressed', 'false')

    // Click Team 1 server option
    await team1ServerButton.click()
    await expect(team1ServerButton).toHaveAttribute('aria-pressed', 'true')
    await expect(team2ServerButton).toHaveAttribute('aria-pressed', 'false')
  })

  test('toggle options work', async ({ page }) => {
    // Find toggle switches by their accessible name (switch role, not button)
    const goldenPointToggle = page.getByRole('switch', { name: /golden point/i })
    const sideSwitchToggle = page.getByRole('switch', { name: /side-switch prompts/i })
    const servingIndicatorToggle = page.getByRole('switch', { name: /serving indicator/i })
    const countdownToggle = page.getByRole('switch', { name: /countdown timer/i })

    // Verify toggles are visible
    await expect(goldenPointToggle).toBeVisible()
    await expect(sideSwitchToggle).toBeVisible()
    await expect(servingIndicatorToggle).toBeVisible()
    await expect(countdownToggle).toBeVisible()

    // Get initial state of Golden Point toggle and click to toggle it
    const goldenPointInitialState = await goldenPointToggle.getAttribute('aria-checked')
    await goldenPointToggle.click()
    // Verify state changed
    await expect(goldenPointToggle).toHaveAttribute(
      'aria-checked',
      goldenPointInitialState === 'true' ? 'false' : 'true'
    )

    // Get initial state of Side-switch Prompts toggle and click to toggle it
    const sideSwitchInitialState = await sideSwitchToggle.getAttribute('aria-checked')
    await sideSwitchToggle.click()
    // Verify state changed
    await expect(sideSwitchToggle).toHaveAttribute(
      'aria-checked',
      sideSwitchInitialState === 'true' ? 'false' : 'true'
    )

    await expect(servingIndicatorToggle).toHaveAttribute('aria-checked', 'true')
    await servingIndicatorToggle.click()
    await expect(servingIndicatorToggle).toHaveAttribute('aria-checked', 'false')

    const ninetyMinuteDuration = page.getByRole('radio', { name: '1:30 h' })
    const twoHourDuration = page.getByRole('radio', { name: '2:00 h' })

    await expect(ninetyMinuteDuration).toBeDisabled()
    await countdownToggle.click()
    await expect(countdownToggle).toHaveAttribute('aria-checked', 'true')
    await expect(ninetyMinuteDuration).toBeEnabled()
    await twoHourDuration.click()
    await expect(twoHourDuration).toHaveAttribute('aria-checked', 'true')

    // For best-of-3 format (default), verify Super Tiebreak option is visible
    await expect(page.getByRole('switch', { name: /super tiebreak/i })).toBeVisible()

    const firstServerSection = page.getByTestId('first-server-section')
    const team1ServerButton = page.getByRole('button', { name: /^team 1$/i })
    const team2ServerButton = page.getByRole('button', { name: /^team 2$/i })

    await expect(firstServerSection).toHaveCSS('opacity', '0.35')
    await expect(team1ServerButton).toBeDisabled()
    await expect(team2ServerButton).toBeDisabled()

    await servingIndicatorToggle.click()
    await expect(servingIndicatorToggle).toHaveAttribute('aria-checked', 'true')
    await expect(team1ServerButton).toBeEnabled()
    await expect(team2ServerButton).toBeEnabled()
  })

  test('preserves first server selection while serving indicator is disabled', async ({ page }) => {
    const servingIndicatorToggle = page.getByRole('switch', { name: /serving indicator/i })
    const team1ServerButton = page.getByRole('button', { name: /^team 1$/i })
    const team2ServerButton = page.getByRole('button', { name: /^team 2$/i })

    await team2ServerButton.click()
    await expect(team2ServerButton).toHaveAttribute('aria-pressed', 'true')

    await servingIndicatorToggle.click()
    await expect(team2ServerButton).toBeDisabled()

    await servingIndicatorToggle.click()
    await expect(team2ServerButton).toBeEnabled()
    await expect(team2ServerButton).toHaveAttribute('aria-pressed', 'true')
    await expect(team1ServerButton).toHaveAttribute('aria-pressed', 'false')
  })

  test('locale switching works', async ({ page }) => {
    // Find and click locale chip to open menu
    const localeChip = page.getByRole('button', { name: /english|português|español/i })
    await localeChip.click()

    // Verify locale menu appears
    const localeMenu = page.getByRole('group', { name: /language|idioma/i })
    await expect(localeMenu).toBeVisible()

    // Click a different locale (e.g., Portuguese)
    const portugueseOption = page.getByRole('button', { name: /português/i })
    await portugueseOption.click()

    // Verify locale menu closes
    await expect(localeMenu).not.toBeVisible()

    // Verify UI language updates - the locale chip should show Portuguese
    await expect(page.getByRole('button', { name: /português/i })).toBeVisible()
  })

  test('validation: shows error when team names are empty on submit', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start match/i })
    const team1Input = page.getByRole('textbox', { name: /team 1/i })
    const team2Input = page.getByRole('textbox', { name: /team 2/i })

    // Clear both team name inputs
    await team1Input.clear()
    await team2Input.clear()

    // Click Start Match button to trigger validation
    await startButton.click()

    // Verify error message appears (there will be 2 error messages, one for each team)
    await expect(page.getByText(/team names are required/i).first()).toBeVisible()
  })

  test('start match navigation works when validation passes', async ({ page }) => {
    // Fill in team names to pass validation (using defaults or custom names)
    await page.getByRole('textbox', { name: /team 1/i }).fill('Team Alpha')
    await page.getByRole('textbox', { name: /team 2/i }).fill('Team Beta')

    // Click Start Match button
    const startButton = page.getByRole('button', { name: /start match/i })
    await expect(startButton).toBeEnabled()
    await startButton.click()

    // Verify navigation to /match/ route
    await expect(page).toHaveURL(/\/match\//)
  })
})
