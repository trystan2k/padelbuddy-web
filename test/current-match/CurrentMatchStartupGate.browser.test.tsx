import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { CurrentMatchStartupGate } from '@/components/CurrentMatchStartupGate/CurrentMatchStartupGate'
import {
  clearCurrentMatch,
  consumeCurrentMatchResetNotice,
  createCurrentMatchPersistence,
  currentMatchSchemaVersion,
  saveCurrentMatch,
  type CurrentMatchPersistence
} from '@/lib/current-match'

import { createTestSetup, scorePoints } from '../core/match/test-helpers'

describe('CurrentMatchStartupGate browser', () => {
  let databaseName = ''
  let persistence: CurrentMatchPersistence

  beforeEach(() => {
    databaseName = `padel-buddy-startup-gate-${crypto.randomUUID()}`
    persistence = createCurrentMatchPersistence({
      databaseName,
      objectStoreName: 'current-match'
    })
  })

  afterEach(async () => {
    consumeCurrentMatchResetNotice()
    await clearCurrentMatch()
    await deleteDatabase(databaseName)
  })

  test('renders the shell directly when no saved match exists', async () => {
    const screen = await render(
      <CurrentMatchStartupGate persistence={persistence}>
        <TestShell />
      </CurrentMatchStartupGate>
    )

    await expect
      .element(screen.getByRole('heading', { level: 1, name: 'Padel Buddy' }))
      .toBeVisible()
    expect(document.body.textContent).not.toContain('Resume saved match?')
  })

  test('prompts to resume or discard an in-progress match and emphasizes resume', async () => {
    await persistence.saveCurrentMatch({
      setup: createTestSetup(),
      actions: scorePoints('team-1', 'team-2')
    })

    const screen = await render(
      <CurrentMatchStartupGate persistence={persistence}>
        <TestShell />
      </CurrentMatchStartupGate>
    )
    const resumeDialog = screen.getByRole('dialog', { name: 'Resume saved match?' })
    const resumeButton = screen.getByRole('button', { name: 'Resume saved match' })

    await expect.element(resumeDialog).toBeVisible()
    await expect.element(resumeDialog).toHaveAttribute('aria-modal', 'true')
    await expect.element(resumeButton).toHaveAttribute('data-emphasis', 'primary')
    await expect.element(resumeButton).toHaveFocus()
    await expect.element(screen.getByRole('button', { name: 'Discard saved match' })).toBeVisible()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toHaveTextContent('Discard saved match')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toHaveTextContent('Resume saved match')
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
    )
    expect(document.activeElement).toHaveTextContent('Discard saved match')

    await resumeButton.click()

    expect(document.body.textContent).not.toContain('Resume saved match?')
    await expect
      .element(screen.getByRole('heading', { level: 1, name: 'Padel Buddy' }))
      .toBeVisible()

    await screen.unmount()

    const repeatedStartupScreen = await render(
      <CurrentMatchStartupGate persistence={persistence}>
        <TestShell />
      </CurrentMatchStartupGate>
    )

    await expect
      .element(
        repeatedStartupScreen.getByRole('heading', { level: 2, name: 'Resume saved match?' })
      )
      .toBeVisible()
  })

  test('discard clears the saved match so the next startup does not prompt again', async () => {
    await persistence.saveCurrentMatch({
      setup: createTestSetup(),
      actions: scorePoints('team-1')
    })

    const firstScreen = await render(
      <CurrentMatchStartupGate persistence={persistence}>
        <TestShell />
      </CurrentMatchStartupGate>
    )

    await firstScreen.getByRole('button', { name: 'Discard saved match' }).click()
    await expect
      .element(firstScreen.getByRole('heading', { level: 1, name: 'Padel Buddy' }))
      .toBeVisible()

    await firstScreen.unmount()

    const secondScreen = await render(
      <CurrentMatchStartupGate persistence={persistence}>
        <TestShell />
      </CurrentMatchStartupGate>
    )

    await expect
      .element(secondScreen.getByRole('heading', { level: 1, name: 'Padel Buddy' }))
      .toBeVisible()
    expect(document.body.textContent).not.toContain('Resume saved match?')
  })

  test('renders corrupted-state recovery with only reset and continue', async () => {
    await writeRawRecord({
      databaseName,
      value: {
        schemaVersion: currentMatchSchemaVersion,
        setup: createTestSetup(),
        actions: [{ type: 'score-point', teamId: 'team-3' }]
      }
    })

    const screen = await render(
      <CurrentMatchStartupGate persistence={persistence}>
        <TestShell />
      </CurrentMatchStartupGate>
    )

    await expect
      .element(screen.getByRole('heading', { level: 1, name: 'Saved match needs recovery' }))
      .toBeVisible()
    await expect.element(screen.getByRole('button', { name: 'Reset and continue' })).toBeVisible()
    expect(document.body.textContent).not.toContain('Resume saved match')
    expect(document.body.textContent).not.toContain('Discard saved match')
  })

  test('reset and continue clears the corrupted record for the next startup', async () => {
    await writeRawRecord({
      databaseName,
      value: {
        schemaVersion: currentMatchSchemaVersion,
        setup: createTestSetup(),
        actions: [{ type: 'score-point', teamId: 'team-3' }]
      }
    })

    const firstScreen = await render(
      <CurrentMatchStartupGate persistence={persistence}>
        <TestShell />
      </CurrentMatchStartupGate>
    )

    await firstScreen.getByRole('button', { name: 'Reset and continue' }).click()
    await expect
      .element(firstScreen.getByRole('heading', { level: 1, name: 'Padel Buddy' }))
      .toBeVisible()

    await firstScreen.unmount()

    const secondScreen = await render(
      <CurrentMatchStartupGate persistence={persistence}>
        <TestShell />
      </CurrentMatchStartupGate>
    )

    await expect
      .element(secondScreen.getByRole('heading', { level: 1, name: 'Padel Buddy' }))
      .toBeVisible()
    expect(document.body.textContent).not.toContain('Saved match needs recovery')
  })

  test('shows the reset notice once after startup clears an incompatible record', async () => {
    await writeRawRecord({
      databaseName,
      value: {
        schemaVersion: currentMatchSchemaVersion + 1,
        setup: createTestSetup(),
        actions: []
      }
    })

    const firstScreen = await render(
      <CurrentMatchStartupGate persistence={persistence}>
        <TestShell />
      </CurrentMatchStartupGate>
    )

    await expect.element(firstScreen.getByRole('status')).toHaveTextContent('Saved match was reset')
    await firstScreen.getByRole('button', { name: 'Dismiss' }).click()
    expect(document.body.textContent).not.toContain('Saved match was reset')

    await firstScreen.unmount()

    const secondScreen = await render(
      <CurrentMatchStartupGate persistence={persistence}>
        <TestShell />
      </CurrentMatchStartupGate>
    )

    await expect
      .element(secondScreen.getByRole('heading', { level: 1, name: 'Padel Buddy' }))
      .toBeVisible()
    expect(document.body.textContent).not.toContain('Saved match was reset')
  })

  test('uses the default persistence path when no persistence prop is provided', async () => {
    await saveCurrentMatch({
      setup: createTestSetup(),
      actions: scorePoints('team-1')
    })

    const firstScreen = await render(
      <CurrentMatchStartupGate>
        <TestShell />
      </CurrentMatchStartupGate>
    )

    await expect
      .element(firstScreen.getByRole('heading', { level: 2, name: 'Resume saved match?' }))
      .toBeVisible()
    await firstScreen.getByRole('button', { name: 'Discard saved match' }).click()
    await expect
      .element(firstScreen.getByRole('heading', { level: 1, name: 'Padel Buddy' }))
      .toBeVisible()

    await firstScreen.unmount()

    const secondScreen = await render(
      <CurrentMatchStartupGate>
        <TestShell />
      </CurrentMatchStartupGate>
    )

    await expect
      .element(secondScreen.getByRole('heading', { level: 1, name: 'Padel Buddy' }))
      .toBeVisible()
    expect(document.body.textContent).not.toContain('Resume saved match?')
  })

  test('keeps the resume dialog open and shows an error when discarding fails', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <CurrentMatchStartupGate
        persistence={createPersistenceStub({
          loadCurrentMatch: async () => ({
            status: 'ok',
            record: {
              schemaVersion: currentMatchSchemaVersion,
              setup,
              actions: scorePoints('team-1')
            }
          }),
          clearCurrentMatch: async () => {
            throw new Error('Failed to clear saved match.')
          }
        })}
      >
        <TestShell />
      </CurrentMatchStartupGate>
    )

    await screen.getByRole('button', { name: 'Discard saved match' }).click()

    await expect.element(screen.getByRole('dialog', { name: 'Resume saved match?' })).toBeVisible()
    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('Failed to clear saved match.')
  })

  test('keeps the recovery screen visible and shows an error when reset fails', async () => {
    const screen = await render(
      <CurrentMatchStartupGate
        persistence={createPersistenceStub({
          loadCurrentMatch: async () => ({
            status: 'corrupt',
            notice: null,
            message: 'Current match payload is corrupt.'
          }),
          clearCurrentMatch: async () => {
            throw new Error('Failed to clear saved match.')
          }
        })}
      >
        <TestShell />
      </CurrentMatchStartupGate>
    )

    await screen.getByRole('button', { name: 'Reset and continue' }).click()

    await expect
      .element(screen.getByRole('heading', { level: 1, name: 'Saved match needs recovery' }))
      .toBeVisible()
    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('Failed to clear saved match.')
  })
})

async function writeRawRecord(input: { databaseName: string; value: unknown }): Promise<void> {
  const database = await openDatabase(input.databaseName)

  try {
    const transaction = database.transaction('current-match', 'readwrite')

    transaction.objectStore('current-match').put(input.value, 'current-match')
    await waitForTransaction(transaction)
  } finally {
    database.close()
  }
}

function openDatabase(databaseName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1)

    request.addEventListener('upgradeneeded', () => {
      const database = request.result

      if (!database.objectStoreNames.contains('current-match')) {
        database.createObjectStore('current-match')
      }
    })

    request.addEventListener('success', () => {
      resolve(request.result)
    })

    request.addEventListener('error', () => {
      reject(request.error ?? new Error('Unable to open test IndexedDB database.'))
    })
  })
}

function deleteDatabase(databaseName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName)

    request.addEventListener('success', () => {
      resolve()
    })

    request.addEventListener('error', () => {
      reject(request.error ?? new Error('Unable to delete test IndexedDB database.'))
    })

    request.addEventListener('blocked', () => {
      reject(new Error('Deleting the test IndexedDB database was blocked.'))
    })
  })
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.addEventListener('complete', () => {
      resolve()
    })

    transaction.addEventListener('error', () => {
      reject(transaction.error ?? new Error('IndexedDB transaction failed.'))
    })

    transaction.addEventListener('abort', () => {
      reject(transaction.error ?? new Error('IndexedDB transaction was aborted.'))
    })
  })
}

function createPersistenceStub(overrides: {
  loadCurrentMatch: CurrentMatchPersistence['loadCurrentMatch']
  clearCurrentMatch: CurrentMatchPersistence['clearCurrentMatch']
}): CurrentMatchPersistence {
  return {
    saveCurrentMatch: async () => {
      throw new Error('saveCurrentMatch should not be called in this test.')
    },
    loadCurrentMatch: overrides.loadCurrentMatch,
    clearCurrentMatch: overrides.clearCurrentMatch
  }
}

function TestShell() {
  return <h1>Padel Buddy</h1>
}
