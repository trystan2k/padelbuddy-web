import { describe, expect, test, vi } from 'vitest'

import {
  currentMatchSchemaVersion,
  hydrateCurrentMatchStartup,
  queueCurrentMatchResetNotice
} from '@/lib/current-match'
import type { CurrentMatchPersistence } from '@/lib/current-match'

import { createTestSetup, scorePoints, winQuickSet } from '../core/match/test-helpers'

describe('current match startup hydration', () => {
  test('returns ready when no stored record exists', async () => {
    const result = await hydrateCurrentMatchStartup({
      persistence: createPersistenceStub({
        loadCurrentMatch: async () => ({
          status: 'empty'
        })
      })
    })

    expect(result).toEqual({
      status: 'ready',
      notice: null,
      session: null
    })
  })

  test('returns resume-required for an in-progress saved match', async () => {
    const setup = createTestSetup()
    const actions = scorePoints('team-1', 'team-1')

    const result = await hydrateCurrentMatchStartup({
      persistence: createPersistenceStub({
        loadCurrentMatch: async () => ({
          status: 'ok',
          record: {
            schemaVersion: currentMatchSchemaVersion,
            setup,
            actions
          }
        })
      })
    })

    expect(result.status).toBe('resume-required')

    if (result.status !== 'resume-required') {
      throw new Error('Expected startup hydration to require a resume decision.')
    }

    expect(result.session.getSnapshot().actions).toEqual(actions)
    expect(result.session.getSnapshot().projection.derived.status).toBe('in-progress')
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
            actions
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
