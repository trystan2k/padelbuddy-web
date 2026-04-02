import { test, expect } from './fixtures'

/**
 * Helper: start a match from the setup screen and navigate to the Active Match.
 * Disables side-switch prompts and serving indicator to keep the test focused.
 */
async function startMatch(page: import('@playwright/test').Page) {
  await page.goto('/')

  // Disable side-switch prompts to avoid dialog interruptions
  const sideSwitchToggle = page.getByRole('switch', { name: /side-switch prompts/i })
  await sideSwitchToggle.click()
  await expect(sideSwitchToggle).toHaveAttribute('aria-checked', 'false')

  // Disable serving indicator to simplify the match screen
  const servingIndicatorToggle = page.getByRole('switch', { name: /serving indicator/i })
  await servingIndicatorToggle.click()
  await expect(servingIndicatorToggle).toHaveAttribute('aria-checked', 'false')

  // Start the match
  const startButton = page.getByRole('button', { name: /start match/i })
  await startButton.click()

  // Wait for navigation to the active match route
  await expect(page).toHaveURL(/\/match\//)
  await expect(page).not.toHaveURL(/\/match\/finish\//)
}

/**
 * Helper: assert no horizontal overflow on the current page.
 * Checks that the page's scrollable content width does not exceed the viewport width.
 */
async function assertNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const hasHorizontalOverflow = await page.evaluate(() => {
    const { scrollWidth, clientWidth } = document.documentElement
    return scrollWidth > clientWidth
  })
  expect(hasHorizontalOverflow).toBe(false)
}

// ────────────────────────────────────────────────────────────────────────────
// Active Match orientation tests
// ────────────────────────────────────────────────────────────────────────────

test.describe('Active Match — Orientation Behavior', () => {
  // Portrait: taller than wide (phone in portrait)
  const PORTRAIT = { width: 390, height: 844 }
  // Landscape: wider than tall (phone in landscape)
  const LANDSCAPE = { width: 844, height: 390 }

  test('portrait viewport shows rotate-device blocker', async ({ page }) => {
    await page.setViewportSize(PORTRAIT)
    await startMatch(page)

    // Blocker should be visible
    await expect(page.getByTestId('rotate-device-blocker')).toBeVisible()

    // Blocker should contain the instructional heading and description
    await expect(page.getByRole('heading', { name: /rotate your device/i })).toBeVisible()
    await expect(page.getByText(/landscape mode/i)).toBeVisible()
  })

  test('landscape viewport shows scoreboard (no blocker)', async ({ page }) => {
    await page.setViewportSize(LANDSCAPE)
    await startMatch(page)

    // Blocker should NOT be visible
    await expect(page.getByTestId('rotate-device-blocker')).not.toBeVisible()

    // Score-related elements should be visible
    await expect(page.getByTestId('sets-card')).toBeVisible()
  })

  test('changing from portrait to landscape dismisses the blocker', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize(PORTRAIT)
    await startMatch(page)

    // Verify blocker is shown
    await expect(page.getByTestId('rotate-device-blocker')).toBeVisible()

    // Rotate to landscape by changing viewport dimensions
    await page.setViewportSize(LANDSCAPE)

    // Blocker should disappear
    await expect(page.getByTestId('rotate-device-blocker')).not.toBeVisible()

    // Score-related elements should now be visible
    await expect(page.getByTestId('sets-card')).toBeVisible()
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Phone viewport — no horizontal overflow
// ────────────────────────────────────────────────────────────────────────────

test.describe('Phone Viewport — No Horizontal Overflow', () => {
  // iPhone 13 / 14 dimensions
  const PHONE_PORTRAIT = { width: 390, height: 844 }
  const PHONE_LANDSCAPE = { width: 844, height: 390 }

  test('setup screen renders without horizontal overflow on phone portrait', async ({ page }) => {
    await page.setViewportSize(PHONE_PORTRAIT)
    await page.goto('/')

    // Wait for the main heading to confirm the setup screen rendered
    await expect(page.getByRole('heading', { name: /padel buddy/i, level: 1 })).toBeVisible()

    await assertNoHorizontalOverflow(page)
  })

  test('setup screen renders without horizontal overflow on phone landscape', async ({ page }) => {
    await page.setViewportSize(PHONE_LANDSCAPE)
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /padel buddy/i, level: 1 })).toBeVisible()

    await assertNoHorizontalOverflow(page)
  })

  test('home screen interactive elements fit within phone portrait width', async ({ page }) => {
    await page.setViewportSize(PHONE_PORTRAIT)
    await page.goto('/')

    // Verify key interactive elements are visible and not clipped
    await expect(page.getByRole('textbox', { name: /team 1/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /team 2/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /start match/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /best of 3/i })).toBeVisible()

    await assertNoHorizontalOverflow(page)
  })
})
