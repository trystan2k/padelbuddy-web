import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { test as base, expect, type Page } from '@playwright/test';

import { persistenceDatabaseName } from '../src/lib/persistence/indexed-db';
import { helpSpotlightSeenStorageKey } from '../src/lib/user/help_spotlight_storage';

export { expect };

const defaultDatabaseName = persistenceDatabaseName;
const maxBaseNavigationAttempts = 3;

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

async function gotoBaseUrlWithRetry(page: Page, baseURL: string): Promise<void> {
  async function navigate(attempt: number): Promise<void> {
    try {
      await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    } catch (error) {
      const isLastAttempt = attempt === maxBaseNavigationAttempts;

      if (isLastAttempt || !isTransientNavigationError(error)) {
        throw error;
      }

      await page.waitForTimeout(400 * attempt);
      await navigate(attempt + 1);
    }
  }

  await navigate(1);
}

async function clearBrowserState(page: Page, baseURL: string) {
  type SpotlightInitContext = Awaited<ReturnType<Page['context']>> & {
    helpSpotlightInitScriptRegistered?: boolean;
  };

  const context = page.context() as SpotlightInitContext;

  // Register the init script only once per browser context.
  // This keeps the first-visit spotlight storage stable without stacking duplicates
  // when clearBrowserState() runs before and after each test.
  if (!context.helpSpotlightInitScriptRegistered) {
    await context.addInitScript(
      async ({ spotlightSeenKey }) => {
        localStorage.setItem(spotlightSeenKey, 'true');
      },
      { spotlightSeenKey: helpSpotlightSeenStorageKey }
    );

    context.helpSpotlightInitScriptRegistered = true;
  }

  await page.context().clearCookies();
  await gotoBaseUrlWithRetry(page, baseURL);

  // Clear remaining state after navigation
  await page.evaluate(
    async ({ databaseName, spotlightSeenKey }) => {
      // Save spotlight key before clearing
      const spotlightValue = localStorage.getItem(spotlightSeenKey);

      localStorage.clear();
      sessionStorage.clear();

      // Restore spotlight key
      if (spotlightValue !== null) {
        localStorage.setItem(spotlightSeenKey, spotlightValue);
      }

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
    { databaseName: defaultDatabaseName, spotlightSeenKey: helpSpotlightSeenStorageKey }
  );

  await page.goto('about:blank');
}

function sanitizePathSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const test = base.extend({
  page: async ({ page, baseURL }, use, testInfo) => {
    const resolvedBaseUrl = baseURL ?? 'http://localhost:4000';

    await clearBrowserState(page, resolvedBaseUrl);

    try {
      await use(page);
    } finally {
      try {
        const screenshotPath = path.resolve(
          process.cwd(),
          'playwright-report/screenshots',
          sanitizePathSegment(testInfo.project.name),
          `${sanitizePathSegment(testInfo.titlePath.slice(1).join(' '))}.png`
        );

        await mkdir(path.dirname(screenshotPath), { recursive: true });

        // Wait for view transitions and animations to complete before screenshot
        await page.waitForTimeout(1000);

        await page.screenshot({ path: screenshotPath, fullPage: true });
        await testInfo.attach('final-screenshot', {
          path: screenshotPath,
          contentType: 'image/png'
        });
      } catch (error) {
        console.error('Failed to persist final E2E screenshot.', {
          projectName: testInfo.project.name,
          testTitle: testInfo.title,
          screenshotPath: path.resolve(
            process.cwd(),
            'playwright-report/screenshots',
            sanitizePathSegment(testInfo.project.name),
            `${sanitizePathSegment(testInfo.titlePath.slice(1).join(' '))}.png`
          ),
          error
        });
      } finally {
        try {
          await clearBrowserState(page, resolvedBaseUrl);
        } catch (cleanupError) {
          console.warn('Failed to reset browser state during teardown.', cleanupError);
        }
      }
    }
  }
});
