import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { test as base, expect, type Page } from '@playwright/test';

import { defaultDatabaseName } from '../src/lib/current-match/indexed-db';

export { expect };

async function clearBrowserState(page: Page, baseURL: string) {
  await page.goto(baseURL);
  await page.evaluate(async (databaseName) => {
    localStorage.clear();
    sessionStorage.clear();

    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase(databaseName);

      request.addEventListener('success', () => resolve());
      request.addEventListener('error', () => resolve());
      request.addEventListener('blocked', () => resolve());
    });
  }, defaultDatabaseName);
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

    await page.addInitScript(() => {
      localStorage.setItem('debug-pwa-closed', 'true');
    });

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
