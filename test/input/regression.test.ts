import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { projectMatch, type MatchTeamId } from '@/core/match'
import { currentMatchSchemaVersion } from '@/lib/current-match/persistence'
import { createCurrentMatchSession, type CurrentMatchPersistence } from '@/lib/current-match'
import { getActionFromKey, createDebounce } from '@/lib/input'

import { createTestSetup, scorePoints, winQuickGame, winQuickSet } from '../core/match/test-helpers'

describe('input regression', () => {
  const testStartedAt = Date.now()
  let persistence: CurrentMatchPersistence
  // Using Mock type for vitest mock to allow .mock.calls access
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let saveCurrentMatchMock: any

  beforeEach(() => {
    saveCurrentMatchMock = vi
      .fn<CurrentMatchPersistence['saveCurrentMatch']>()
      .mockImplementation(async ({ setup, actions, startedAt }) => ({
        schemaVersion: currentMatchSchemaVersion,
        setup,
        actions,
        startedAt: startedAt ?? testStartedAt
      }))

    persistence = {
      saveCurrentMatch: saveCurrentMatchMock,
      loadCurrentMatch: vi.fn(),
      clearCurrentMatch: vi.fn(async () => undefined)
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('input sequence produces same result as direct domain call', () => {
    test('single team-1 score via keyboard alias matches direct call', async () => {
      const setup = createTestSetup()

      // Via session (input path)
      const session = createCurrentMatchSession({
        setup,
        actions: [],
        startedAt: testStartedAt,
        persistence
      })
      await session.scorePoint('team-1')
      const sessionSnapshot = session.getSnapshot()

      // Direct domain call
      const directProjection = projectMatch(setup, scorePoints('team-1'))

      expect(sessionSnapshot.projection).toEqual(directProjection)
      expect(sessionSnapshot.actions).toEqual(scorePoints('team-1'))
    })

    test('single team-2 score via keyboard alias matches direct call', async () => {
      const setup = createTestSetup()

      const session = createCurrentMatchSession({
        setup,
        actions: [],
        startedAt: testStartedAt,
        persistence
      })
      await session.scorePoint('team-2')
      const sessionSnapshot = session.getSnapshot()

      const directProjection = projectMatch(setup, scorePoints('team-2'))

      expect(sessionSnapshot.projection).toEqual(directProjection)
    })

    test('multiple scores in sequence match direct domain projection', async () => {
      const setup = createTestSetup()
      const scoreSequence: MatchTeamId[] = [
        'team-1',
        'team-1',
        'team-2',
        'team-1',
        'team-2',
        'team-2'
      ]

      const session = createCurrentMatchSession({
        setup,
        actions: [],
        startedAt: testStartedAt,
        persistence
      })

      for (const teamId of scoreSequence) {
        await session.scorePoint(teamId) // eslint-disable-line no-await-in-loop
      }
      const sessionSnapshot = session.getSnapshot()

      const directActions = scorePoints(...scoreSequence)
      const directProjection = projectMatch(setup, directActions)

      expect(sessionSnapshot.projection).toEqual(directProjection)
      expect(sessionSnapshot.actions).toEqual(directActions)
    })

    test('undo after scores restores correct state', async () => {
      const setup = createTestSetup()

      const session = createCurrentMatchSession({
        setup,
        actions: [],
        startedAt: testStartedAt,
        persistence
      })

      await session.scorePoint('team-1')
      await session.scorePoint('team-2')
      await session.scorePoint('team-1')
      await session.undoScoreAction()

      const sessionSnapshot = session.getSnapshot()

      // Expected state: team-1, team-2 (last team-1 undone)
      const expectedActions = scorePoints('team-1', 'team-2')
      const expectedProjection = projectMatch(setup, expectedActions)

      expect(sessionSnapshot.projection).toEqual(expectedProjection)
      expect(sessionSnapshot.actions).toEqual(expectedActions)
    })

    test('multiple undos restore correct state', async () => {
      const setup = createTestSetup()

      const session = createCurrentMatchSession({
        setup,
        actions: [],
        startedAt: testStartedAt,
        persistence
      })

      await session.scorePoint('team-1')
      await session.scorePoint('team-2')
      await session.scorePoint('team-1')
      await session.scorePoint('team-2')
      await session.undoScoreAction()
      await session.undoScoreAction()

      const sessionSnapshot = session.getSnapshot()

      const expectedActions = scorePoints('team-1', 'team-2')
      const expectedProjection = projectMatch(setup, expectedActions)

      expect(sessionSnapshot.projection).toEqual(expectedProjection)
    })

    test('score after undo produces correct final state', async () => {
      const setup = createTestSetup()

      const session = createCurrentMatchSession({
        setup,
        actions: [],
        startedAt: testStartedAt,
        persistence
      })

      await session.scorePoint('team-1')
      await session.scorePoint('team-2')
      await session.undoScoreAction()
      await session.scorePoint('team-1')

      const sessionSnapshot = session.getSnapshot()

      // Expected: team-1 (original), then team-1 (new) after undo of team-2
      const expectedActions = scorePoints('team-1', 'team-1')
      const expectedProjection = projectMatch(setup, expectedActions)

      expect(sessionSnapshot.projection).toEqual(expectedProjection)
    })
  })

  describe('keyboard alias mapping consistency', () => {
    test('all team-1 aliases produce same result', () => {
      const team1Keys = ['ArrowLeft', 'a', 'A', '1', 'Home', 'PageUp']

      const actions = team1Keys.map((key) => getActionFromKey(key))

      expect(actions.every((action) => action === 'score-team-1')).toBe(true)
    })

    test('all team-2 aliases produce same result', () => {
      const team2Keys = ['ArrowRight', 'd', 'D', '2', 'End', 'PageDown']

      const actions = team2Keys.map((key) => getActionFromKey(key))

      expect(actions.every((action) => action === 'score-team-2')).toBe(true)
    })

    test('all undo aliases produce same result', () => {
      const undoKeys = ['ArrowUp', 'Backspace', 'u', 'U', 'Delete', 'Escape', 'r', 'R']

      const actions = undoKeys.map((key) => getActionFromKey(key))

      expect(actions.every((action) => action === 'undo')).toBe(true)
    })
  })

  describe('debounce does not affect final outcome', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    test('debounced input sequence produces same final state', async () => {
      const setup = createTestSetup()
      const debounce = createDebounce({ delay: 300 })

      const session = createCurrentMatchSession({
        setup,
        actions: [],
        startedAt: testStartedAt,
        persistence
      })

      // Simulate debounced input sequence
      const inputs: MatchTeamId[] = ['team-1', 'team-2', 'team-1']

      for (const teamId of inputs) {
        if (debounce.isReady()) {
          debounce.trigger()
          await session.scorePoint(teamId) // eslint-disable-line no-await-in-loop
        }
        // Advance time to allow next input
        vi.advanceTimersByTime(300)
      }

      const sessionSnapshot = session.getSnapshot()

      // All inputs should have been processed
      const expectedActions = scorePoints(...inputs)
      const expectedProjection = projectMatch(setup, expectedActions)

      expect(sessionSnapshot.projection).toEqual(expectedProjection)
    })

    test('rapid debounced inputs only register after delay', async () => {
      const setup = createTestSetup()
      const debounce = createDebounce({ delay: 300 })

      const session = createCurrentMatchSession({
        setup,
        actions: [],
        startedAt: testStartedAt,
        persistence
      })

      // First input should succeed
      if (debounce.isReady()) {
        debounce.trigger()
        await session.scorePoint('team-1')
      }

      // Rapid second input should be blocked
      let secondScored = false
      if (debounce.isReady()) {
        debounce.trigger()
        await session.scorePoint('team-2')
        secondScored = true
      }

      expect(secondScored).toBe(false)

      // After delay, third input should succeed
      vi.advanceTimersByTime(300)
      let thirdScored = false
      if (debounce.isReady()) {
        debounce.trigger()
        await session.scorePoint('team-2')
        thirdScored = true
      }

      expect(thirdScored).toBe(true)

      const sessionSnapshot = session.getSnapshot()
      const expectedActions = scorePoints('team-1', 'team-2')
      const expectedProjection = projectMatch(setup, expectedActions)

      expect(sessionSnapshot.projection).toEqual(expectedProjection)
    })
  })

  describe('full game simulation via input', () => {
    test('complete game via keyboard produces correct winner', async () => {
      const setup = createTestSetup({ format: 'best-of-1' })

      const session = createCurrentMatchSession({
        setup,
        actions: [],
        startedAt: testStartedAt,
        persistence
      })

      // Team 1 wins 4 points to win a game
      for (let i = 0; i < 4; i++) {
        await session.scorePoint('team-1') // eslint-disable-line no-await-in-loop
      }

      const sessionSnapshot = session.getSnapshot()

      const expectedActions = winQuickGame('team-1')
      const expectedProjection = projectMatch(setup, expectedActions)

      expect(sessionSnapshot.projection).toEqual(expectedProjection)
      // Game was won by team-1 (4-0), verify games count
      const activeSet = sessionSnapshot.projection.state.sets[0]!
      expect(activeSet.games).toEqual({
        'team-1': 1,
        'team-2': 0
      })
    })

    test('complete set via keyboard produces correct winner', async () => {
      const setup = createTestSetup({ format: 'best-of-1' })

      const session = createCurrentMatchSession({
        setup,
        actions: [],
        startedAt: testStartedAt,
        persistence
      })

      // Team 1 wins 6 games to win a set
      const winSetActions = winQuickSet('team-1')
      for (const _ of winSetActions) {
        await session.scorePoint('team-1') // eslint-disable-line no-await-in-loop
      }

      const sessionSnapshot = session.getSnapshot()

      const expectedProjection = projectMatch(setup, winSetActions)

      expect(sessionSnapshot.projection).toEqual(expectedProjection)
      expect(sessionSnapshot.projection.derived.status).toBe('completed')
      expect(sessionSnapshot.projection.derived.winner?.teamId).toBe('team-1')
    })

    test('match state is consistent after complex sequence', async () => {
      const setup = createTestSetup()

      const session = createCurrentMatchSession({
        setup,
        actions: [],
        startedAt: testStartedAt,
        persistence
      })

      // Complex sequence with scoring and undoing
      await session.scorePoint('team-1')
      await session.scorePoint('team-1')
      await session.scorePoint('team-2')
      await session.scorePoint('team-1')
      await session.scorePoint('team-2')
      await session.undoScoreAction()
      await session.scorePoint('team-1')
      await session.undoScoreAction()
      await session.scorePoint('team-1')

      const sessionSnapshot = session.getSnapshot()

      // Final state: team-1, team-1, team-2, team-1, team-1 (after undos and scores)
      const expectedActions = scorePoints('team-1', 'team-1', 'team-2', 'team-1', 'team-1')
      const expectedProjection = projectMatch(setup, expectedActions)

      expect(sessionSnapshot.projection).toEqual(expectedProjection)
      expect(sessionSnapshot.actions).toEqual(expectedActions)
    })
  })

  describe('persistence consistency', () => {
    test('session persistence matches direct persistence call', async () => {
      const setup = createTestSetup()

      const session = createCurrentMatchSession({
        setup,
        actions: [],
        startedAt: testStartedAt,
        persistence
      })

      await session.scorePoint('team-1')
      await session.scorePoint('team-2')

      expect(saveCurrentMatchMock).toHaveBeenCalledTimes(2)

      // Verify the last call matches expected state
      const lastCall = saveCurrentMatchMock.mock.calls[1][0]
      expect(lastCall.actions).toEqual(scorePoints('team-1', 'team-2'))
    })
  })
})
