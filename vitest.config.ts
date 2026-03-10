import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html']
      },
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            environment: 'node',
            include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
            exclude: ['test/**/*.browser.test.ts', 'test/**/*.browser.test.tsx'],
            setupFiles: ['./test/setup/shared.ts']
          }
        },
        {
          extends: true,
          test: {
            name: 'browser',
            include: ['test/**/*.browser.test.ts', 'test/**/*.browser.test.tsx'],
            setupFiles: ['./test/setup/browser.ts'],
            browser: {
              enabled: false,
              headless: true,
              instances: [{ browser: 'chromium' }]
            }
          }
        }
      ]
    }
  })
)
