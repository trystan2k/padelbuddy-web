import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { projectMatch, type MatchTeamId } from '@/core/match'
import { currentMatchSchemaVersion } from '@/lib/current-match/persistence'
import { createCurrentMatchSession, type CurrentMatchPersistence } from '@/lib/current-match'
import { createDebounce, createRemoteControllerBindings, getActionFromKey } from '@/lib/input'

import { createTestSetup, scorePoints } from '../core/match/test-helpers'

describe('input regression', () => {
  const testMatchId = 'test-match'
  const testStartedAt = Date.now()
  let persistence: CurrentMatchPersistence

  beforeEach(() => {
    persistence = {
      saveCurrentMatch: vi
        .fn<CurrentMatchPersistence['saveCurrentMatch']>()
        .mockImplementation(async ({ matchId = testMatchId, setup, actions, startedAt }) => ({
          schemaVersion: currentMatchSchemaVersion,
          matchId,
          setup,
          actions,
          startedAt: startedAt ?? testStartedAt
        })),
      loadCurrentMatch: vi.fn(),
      clearCurrentMatch: vi.fn(async () => undefined)
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('session scoring still matches the direct domain projection', async () => {
    const setup = createTestSetup()
    const scoreSequence: MatchTeamId[] = ['team-1', 'team-1', 'team-2', 'team-2', 'team-1']

    const session = createCurrentMatchSession({
      matchId: testMatchId,
      setup,
      actions: [],
      startedAt: testStartedAt,
      persistence
    })

    for (const teamId of scoreSequence) {
      await session.scorePoint(teamId) // eslint-disable-line no-await-in-loop
    }

    expect(session.getSnapshot().projection).toEqual(
      projectMatch(setup, scorePoints(...scoreSequence))
    )
  })

  test('custom remote bindings resolve before the legacy shortcuts', () => {
    const bindings = createRemoteControllerBindings({
      'add-team-1': 'ArrowRight',
      'add-team-2': 'ArrowLeft',
      'revert-team-1': 'z',
      'revert-team-2': 'x'
    })

    expect(getActionFromKey('ArrowRight', bindings)).toBe('add-team-1')
    expect(getActionFromKey('ArrowLeft', bindings)).toBe('add-team-2')
    expect(getActionFromKey('z', bindings)).toBe('revert-team-1')
    expect(getActionFromKey('x', bindings)).toBe('revert-team-2')
    expect(getActionFromKey('Escape', bindings)).toBe('undo')
  })

  test('debounce utility still blocks rapid duplicate triggers', () => {
    vi.useFakeTimers()

    const debounce = createDebounce({ delay: 300 })

    expect(debounce.isReady()).toBe(true)
    debounce.trigger()
    expect(debounce.isReady()).toBe(false)

    vi.advanceTimersByTime(300)
    expect(debounce.isReady()).toBe(true)

    vi.useRealTimers()
  })
})
