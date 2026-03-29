import { test as base, expect } from '@playwright/test'

const CURRENT_MATCH_DB = 'padel-buddy-web'

// Re-export for convenience
export { expect }

/**
 * Custom test fixture with automatic browser state cleanup.
 * Ensures tests are idempotent by clearing localStorage, sessionStorage,
 * and IndexedDB after each test.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Hide DebugPwa overlay before any page loads so it doesn't block clicks
    await page.addInitScript(() => {
      localStorage.setItem('debug-pwa-closed', 'true')
    })
    await use(page)
    // Teardown: clear all browser state so tests are idempotent
    await page.evaluate((dbName) => {
      localStorage.clear()
      sessionStorage.clear()
      return new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase(dbName)
        req.addEventListener('success', () => resolve())
        req.addEventListener('error', () => resolve())
        req.addEventListener('blocked', () => resolve())
      })
    }, CURRENT_MATCH_DB)
  }
})
