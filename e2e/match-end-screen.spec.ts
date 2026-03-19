import type { Page } from '@playwright/test'

import { test, expect } from './fixtures'

const CURRENT_MATCH_DATABASE_NAME = 'padel-buddy-web'
// Keep in sync with `defaultDatabaseVersion` in `src/lib/current-match/indexed-db.ts`.
const CURRENT_MATCH_DATABASE_VERSION = 4
// Keep in sync with `currentMatchSchemaVersion` in `src/lib/current-match/persistence.ts`.
const CURRENT_MATCH_SCHEMA_VERSION = 4
const SEEDED_MATCH_STARTED_AT = 1_700_000_000_000
const SEEDED_MATCH_FINISHED_AT = SEEDED_MATCH_STARTED_AT + 5 * 60 * 1000

test.describe('Match End Screen', () => {
  const frozenMatchDurationMinutes = 5

  test('renders a completed match summary and starts a new match', async ({ page }) => {
    await page.goto('/')
    await seedCompletedMatch(page)

    await page.goto('/match/completed-match')

    await expect(page).toHaveURL(/\/match\/finish\/completed-match$/)

    await expect(page.getByText(/match complete/i)).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Alvaro & Enrique' })).toBeVisible()
    await expect(page.getByRole('button', { name: /new match/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible()
    await expect(page.getByText(/set summary/i)).toBeVisible()
    await expect(page.getByTestId('match-end-duration')).toHaveText(
      `${frozenMatchDurationMinutes}m`
    )
    await expect(page.getByTestId('match-end-total-games')).toHaveText('12')

    await page.reload()
    await expect(page).toHaveURL(/\/match\/finish\/completed-match$/)
    await expect(page.getByTestId('match-end-duration')).toHaveText(
      `${frozenMatchDurationMinutes}m`
    )

    await page.getByRole('button', { name: /new match/i }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('button', { name: /start match/i })).toBeVisible()
    expect(
      await page.evaluate(
        async ({ dbName, dbVersion }) => {
          const request = indexedDB.open(dbName, dbVersion)

          return new Promise<boolean>((resolve) => {
            request.addEventListener('success', () => {
              const database = request.result
              const transaction = database.transaction('current-match', 'readonly')
              const getRequest = transaction.objectStore('current-match').get('current-match')

              getRequest.addEventListener('success', () => {
                resolve(typeof getRequest.result === 'undefined')
                database.close()
              })
              getRequest.addEventListener('error', () => {
                resolve(true)
                database.close()
              })
            })

            request.addEventListener('error', () => resolve(true))
          })
        },
        { dbName: CURRENT_MATCH_DATABASE_NAME, dbVersion: CURRENT_MATCH_DATABASE_VERSION }
      )
    ).toBe(true)
  })

  test('continues the finished match on the active route with persisted data intact', async ({
    page
  }) => {
    await page.goto('/')
    await seedCompletedMatch(page)

    await page.goto('/match/completed-match')

    await expect(page).toHaveURL(/\/match\/finish\/completed-match$/)

    await page.getByRole('button', { name: /continue/i }).click()

    await expect(page).toHaveURL(/\/match\/completed-match$/)
    await expect(page.getByTestId('time-chip')).toHaveText(`${frozenMatchDurationMinutes} min`)
    await expect(page.getByTestId('time-chip')).toBeVisible()

    await page.reload()

    await expect(page).toHaveURL(/\/match\/completed-match$/)
    await expect(page.getByTestId('time-chip')).toHaveText(`${frozenMatchDurationMinutes} min`)
    await expect(page.getByTestId('time-chip')).toBeVisible()
    await expect(
      page.getByRole('button', {
        name: /score point for alvaro & enrique/i
      })
    ).toBeEnabled()
  })
})

async function seedCompletedMatch(page: Page) {
  await page.evaluate(
    async ({ dbName, dbVersion, schemaVersion, startedAt, finishedAt }) => {
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion)

        request.addEventListener('upgradeneeded', () => {
          const nextDatabase = request.result

          if (!nextDatabase.objectStoreNames.contains('current-match')) {
            nextDatabase.createObjectStore('current-match')
          }
          if (!nextDatabase.objectStoreNames.contains('locale-preference')) {
            nextDatabase.createObjectStore('locale-preference')
          }
          if (!nextDatabase.objectStoreNames.contains('speech-preference')) {
            nextDatabase.createObjectStore('speech-preference')
          }
        })

        request.addEventListener('success', () => resolve(request.result))
        request.addEventListener('error', () => {
          reject(request.error ?? new Error('Failed to open the current match database.'))
        })
      })

      try {
        const transaction = database.transaction('current-match', 'readwrite')
        transaction.objectStore('current-match').put(
          {
            schemaVersion,
            matchId: 'completed-match',
            setup: {
              format: 'best-of-3',
              gameMode: 'advantage',
              initialServer: 'team-1',
              decidingSetSuperTiebreak: false,
              bestOfOneDecidingBehavior: 'full-set',
              sideSwitchPrompts: false,
              sides: [
                { id: 'team-1', playerNames: ['Alvaro', 'Enrique'] },
                { id: 'team-2', playerNames: ['Pablo', 'Thiago'] }
              ],
              decidingSetMode: 'standard',
              officialMaxSets: 3,
              officialSetsToWin: 2,
              setCap: 3
            },
            actions: Array.from({ length: 48 }, () => ({
              type: 'score-point',
              teamId: 'team-1'
            })),
            startedAt,
            finishedAt
          },
          'current-match'
        )
        await new Promise<void>((resolve, reject) => {
          transaction.addEventListener('complete', () => resolve())
          transaction.addEventListener('error', () => {
            reject(transaction.error ?? new Error('IndexedDB transaction failed.'))
          })
          transaction.addEventListener('abort', () => {
            reject(transaction.error ?? new Error('IndexedDB transaction was aborted.'))
          })
        })
      } finally {
        database.close()
      }
    },
    {
      dbName: CURRENT_MATCH_DATABASE_NAME,
      dbVersion: CURRENT_MATCH_DATABASE_VERSION,
      schemaVersion: CURRENT_MATCH_SCHEMA_VERSION,
      startedAt: SEEDED_MATCH_STARTED_AT,
      finishedAt: SEEDED_MATCH_FINISHED_AT
    }
  )
}
