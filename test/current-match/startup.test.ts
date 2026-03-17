import { describe, expect, test, vi } from 'vitest'

import { currentMatchSchemaVersion } from '@/lib/current-match/persistence'
import { hydrateCurrentMatchStartup } from '@/lib/current-match/startup'
import { queueCurrentMatchResetNotice } from '@/lib/current-match/reset-notice'
import { type CurrentMatchPersistence } from '@/lib/current-match'

import { createTestSetup, winQuickSet } from '../core/match/test-helpers'

describe('current match startup', () => {
  const testStartedAt = Date.now()

  test('treats completed saved matches as ready without a resume prompt', async () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    })
    const actions = winQuickSet('team-1')

    const result = await hydrateCurrentMatchStartup({
      persistence: createPersistenceStub({
        loadCurrentMatch: async () => ({
          status: 'ok',
          record: {
            schemaVersion: currentMatchSchemaVersion,
            setup,
            actions,
            startedAt: testStartedAt
          }
        })
      })
    })

    expect(result.status).toBe('ready')

    if (result.status !== 'ready') {
      throw new Error('Expected startup hydration to enter the ready state.')
    }

    expect(result.session?.getSnapshot().projection.derived.status).toBe('completed')
  })

  test('returns corrupt when the stored record cannot be decoded', async () => {
    const result = await hydrateCurrentMatchStartup({
      persistence: createPersistenceStub({
        loadCurrentMatch: async () => ({
          status: 'corrupt',
          message: 'Current match payload is corrupt.'
        })
      })
    })

    expect(result).toEqual({
      status: 'corrupt',
      notice: null,
      message: 'Current match payload is corrupt.'
    })
  })

  test('consumes the one-time reset notice after a reset-required load', async () => {
    queueCurrentMatchResetNotice({
      reason: 'schema-version'
    })

    const persistence = createPersistenceStub({
      loadCurrentMatch: async () => ({
        status: 'reset-required',
        reason: 'schema-version',
        storedSchemaVersion: currentMatchSchemaVersion + 1
      })
    })

    await expect(hydrateCurrentMatchStartup({ persistence })).resolves.toEqual({
      status: 'ready',
      notice: {
        reason: 'schema-version'
      },
      session: null
    })
    await expect(hydrateCurrentMatchStartup({ persistence })).resolves.toEqual({
      status: 'ready',
      notice: null,
      session: null
    })
  })

  test('returns resume-required for in-progress matches', async () => {
    const setup = createTestSetup({
      format: 'best-of-3'
    })
    const actions = [{ type: 'score-point', teamId: 'team-1' }] as const

    const result = await hydrateCurrentMatchStartup({
      persistence: createPersistenceStub({
        loadCurrentMatch: async () => ({
          status: 'ok',
          record: {
            schemaVersion: currentMatchSchemaVersion,
            setup,
            actions: [...actions],
            startedAt: testStartedAt
          }
        })
      })
    })

    expect(result.status).toBe('resume-required')

    if (result.status !== 'resume-required') {
      throw new Error('Expected startup hydration to require a resume decision.')
    }

    expect(result.session.getSnapshot().actions).toEqual([...actions])
    expect(result.session.getSnapshot().projection.derived.status).toBe('in-progress')
  })
})

function createPersistenceStub(overrides: {
  loadCurrentMatch: CurrentMatchPersistence['loadCurrentMatch']
}): CurrentMatchPersistence {
  return {
    saveCurrentMatch: vi.fn(),
    loadCurrentMatch: overrides.loadCurrentMatch,
    clearCurrentMatch: vi.fn(async () => undefined)
  }
}
