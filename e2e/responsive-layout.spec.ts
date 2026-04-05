import { expect, test } from './fixtures'

import { assertNoHorizontalOverflow, gotoSetupScreen, startMatch } from './helpers/match-flow'
import { isPortraitViewport, viewportCatalog } from './helpers/viewports'

test.describe('@responsive Responsive layout', () => {
  for (const viewport of viewportCatalog) {
    test(`setup screen stays usable on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await gotoSetupScreen(page)

      await expect(page.getByRole('textbox', { name: /team 1/i })).toBeVisible()
      await expect(page.getByRole('textbox', { name: /team 2/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /start match/i })).toBeVisible()
      await assertNoHorizontalOverflow(page)
    })

    test(`active match renders the expected orientation treatment on ${viewport.name}`, async ({
      page
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await startMatch(page, {
        format: 'best-of-1',
        sideSwitchPrompts: false,
        servingIndicatorEnabled: false
      })

      if (isPortraitViewport(viewport)) {
        await expect(page.getByTestId('rotate-device-blocker')).toBeVisible()
        await expect(page.getByRole('heading', { name: /rotate your device/i })).toBeVisible()
        return
      }

      await expect(page.getByTestId('rotate-device-blocker')).toHaveCount(0)
      await expect(page.getByTestId('sets-card')).toBeVisible()
    })
  }
})
