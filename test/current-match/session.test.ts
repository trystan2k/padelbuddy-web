import { describe, expect, test, vi } from 'vitest'

import { continueMatch, projectMatch, undoLastScoringAction } from '@/core/match'
import {
  createCurrentMatchSession,
  createCurrentMatchSessionSnapshot,
  currentMatchSchemaVersion,
  type CurrentMatchPersistence
} from '@/lib/current-match'

import { createTestSetup, scorePoints, winQuickGame, winQuickSet } from '../core/match/test-helpers'

describe('current match session', () => {
  const testMatchId = 'test-match'
  const testStartedAt = Date.now()
  const testFinishedAt = testStartedAt + 5 * 60 * 1000

  test('derives the initial projection from canonical setup and actions', () => {
    const setup = createTestSetup()
    const actions = [...winQuickGame('team-1'), ...scorePoints('team-2')]

    expect(
      createCurrentMatchSessionSnapshot({
        setup,
        actions,
        startedAt: testStartedAt
      })
    ).toEqual({
      setup,
      actions,
      startedAt: testStartedAt,
      projection: projectMatch(setup, actions)
    })
  })

  test('persists score mutations after replay projects the next state', async () => {
    const setup = createTestSetup()
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const session = createCurrentMatchSession({
      matchId: testMatchId,
      setup,
      actions: [],
      startedAt: testStartedAt,
      persistence
    })

    const snapshot = await session.scorePoint('team-1')

    expect(saveCurrentMatchMock).toHaveBeenCalledWith({
      matchId: testMatchId,
      setup,
      actions: scorePoints('team-1'),
      startedAt: testStartedAt
    })
    expect(snapshot.projection.state.actionCount).toBe(1)
    expect(snapshot.projection.derived.scoreDisplay).toEqual({
      kind: 'standard',
      points: {
        'team-1': '15',
        'team-2': '0'
      }
    })
  })

  test('undo replays without the latest score action and restores derived state', async () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    })
    const completedActions = winQuickSet('team-1')
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const session = createCurrentMatchSession({
      matchId: testMatchId,
      setup,
      actions: completedActions,
      startedAt: testStartedAt,
      persistence
    })

    const snapshot = await session.undoScoreAction()
    const undoneActions = undoLastScoringAction(completedActions)

    expect(saveCurrentMatchMock).toHaveBeenCalledWith({
      matchId: testMatchId,
      setup,
      actions: undoneActions,
      startedAt: testStartedAt
    })
    expect(snapshot.actions).toEqual(undoneActions)
    expect(snapshot.projection).toEqual(projectMatch(setup, undoneActions))
    expect(snapshot.projection.derived.status).toBe('in-progress')
    expect(snapshot.projection.derived.canContinuePlaying).toBe(false)
  })

  test('returns the existing snapshot when undo has no score actions to remove', async () => {
    const setup = createTestSetup()
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const session = createCurrentMatchSession({
      matchId: testMatchId,
      setup,
      actions: [],
      startedAt: testStartedAt,
      persistence
    })

    const snapshot = await session.undoScoreAction()

    expect(saveCurrentMatchMock).not.toHaveBeenCalled()
    expect(snapshot).toEqual(
      createCurrentMatchSessionSnapshot({ setup, actions: [], startedAt: testStartedAt })
    )
  })

  test('skips persisting score actions that replay ignores after match completion', async () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    })
    const completedActions = winQuickSet('team-1')
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const session = createCurrentMatchSession({
      matchId: testMatchId,
      setup,
      actions: completedActions,
      startedAt: testStartedAt,
      persistence
    })

    const snapshot = await session.scorePoint('team-2')

    expect(saveCurrentMatchMock).not.toHaveBeenCalled()
    expect(snapshot.actions).toEqual(completedActions)
    expect(snapshot.projection).toEqual(projectMatch(setup, completedActions))
  })

  test('captures finishedAt when a score mutation completes the match', async () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    })
    const actions = winQuickSet('team-1').slice(0, -1)
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const session = createCurrentMatchSession({
      matchId: testMatchId,
      setup,
      actions,
      startedAt: testStartedAt,
      persistence
    })

    const snapshot = await session.scorePoint('team-1')

    expect(saveCurrentMatchMock).toHaveBeenCalledWith({
      matchId: testMatchId,
      setup,
      actions: [...actions, { type: 'score-point', teamId: 'team-1' }],
      startedAt: testStartedAt,
      finishedAt: expect.any(Number)
    })
    expect(snapshot.projection.derived.status).toBe('completed')
    expect(snapshot.finishedAt).toEqual(expect.any(Number))
  })

  test('persists finishedAt when the match is manually finished early', async () => {
    const setup = createTestSetup()
    const actions = scorePoints('team-1', 'team-2')
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const finishedNow = testStartedAt + 2 * 60 * 1000
    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(finishedNow)

    try {
      const session = createCurrentMatchSession({
        matchId: testMatchId,
        setup,
        actions,
        startedAt: testStartedAt,
        persistence
      })

      const snapshot = await session.finishMatch()

      expect(saveCurrentMatchMock).toHaveBeenCalledWith({
        matchId: testMatchId,
        setup,
        actions,
        startedAt: testStartedAt,
        finishedAt: finishedNow
      })
      expect(snapshot.actions).toEqual(actions)
      expect(snapshot.projection.derived.status).toBe('in-progress')
      expect(snapshot.finishedAt).toBe(finishedNow)
    } finally {
      dateNowSpy.mockRestore()
    }
  })

  test('returns the existing snapshot when manually finishing an already finished match', async () => {
    const setup = createTestSetup()
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const session = createCurrentMatchSession({
      matchId: testMatchId,
      setup,
      actions: [],
      startedAt: testStartedAt,
      finishedAt: testFinishedAt,
      persistence
    })

    const snapshot = await session.finishMatch()

    expect(saveCurrentMatchMock).not.toHaveBeenCalled()
    expect(snapshot.finishedAt).toBe(testFinishedAt)
  })

  test('returns the existing snapshot when continue-playing is requested before the match is finished', async () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    })
    const actions = winQuickGame('team-1')
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const session = createCurrentMatchSession({
      matchId: testMatchId,
      setup,
      actions,
      startedAt: testStartedAt,
      persistence
    })

    const snapshot = await session.continuePlaying()

    expect(saveCurrentMatchMock).not.toHaveBeenCalled()
    expect(snapshot).toEqual(
      createCurrentMatchSessionSnapshot({
        setup,
        actions,
        startedAt: testStartedAt
      })
    )
  })

  test('persists continued matches using the uncapped setup', async () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    })
    const actions = winQuickSet('team-1')
    const completedProjection = projectMatch(setup, actions)
    const continuedSetup = continueMatch(setup, completedProjection.state)
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const resumedNow = testFinishedAt + 10 * 60 * 1000

    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(resumedNow)

    try {
      const session = createCurrentMatchSession({
        matchId: testMatchId,
        setup,
        actions,
        startedAt: testStartedAt,
        finishedAt: testFinishedAt,
        persistence
      })

      const snapshot = await session.continuePlaying()

      expect(saveCurrentMatchMock).toHaveBeenCalledWith({
        matchId: testMatchId,
        setup: continuedSetup,
        actions,
        startedAt: resumedNow - (testFinishedAt - testStartedAt)
      })
      expect(snapshot.setup).toEqual(continuedSetup)
      expect(snapshot.startedAt).toBe(resumedNow - (testFinishedAt - testStartedAt))
      expect(snapshot.finishedAt).toBeUndefined()
      expect(snapshot.projection).toEqual(projectMatch(continuedSetup, actions))
      expect(snapshot.projection.derived.activeSetIndex).toBe(2)
    } finally {
      dateNowSpy.mockRestore()
    }
  })

  test('continues early-finished matches without requiring a natural winner', async () => {
    const setup = createTestSetup()
    const actions = [...winQuickSet('team-1'), ...scorePoints('team-2')]
    const continuedSetup = continueMatch(setup, projectMatch(setup, actions).state)
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const resumedNow = testFinishedAt + 10 * 60 * 1000

    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(resumedNow)

    try {
      const session = createCurrentMatchSession({
        matchId: testMatchId,
        setup,
        actions,
        startedAt: testStartedAt,
        finishedAt: testFinishedAt,
        persistence
      })

      const snapshot = await session.continuePlaying()

      expect(saveCurrentMatchMock).toHaveBeenCalledWith({
        matchId: testMatchId,
        setup: continuedSetup,
        actions,
        startedAt: resumedNow - (testFinishedAt - testStartedAt)
      })
      expect(snapshot.setup).toEqual(continuedSetup)
      expect(snapshot.finishedAt).toBeUndefined()
      expect(snapshot.projection.derived.status).toBe('in-progress')
      expect(snapshot.projection.derived.winner).toBeNull()
    } finally {
      dateNowSpy.mockRestore()
    }
  })

  test('returns the existing snapshot when continue-playing is already uncapped', async () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    })
    const completedActions = winQuickSet('team-1')
    const continuedSetup = continueMatch(setup, projectMatch(setup, completedActions).state)
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const session = createCurrentMatchSession({
      matchId: testMatchId,
      setup: continuedSetup,
      actions: completedActions,
      startedAt: testStartedAt,
      persistence
    })

    const snapshot = await session.continuePlaying()

    expect(saveCurrentMatchMock).not.toHaveBeenCalled()
    expect(snapshot).toEqual(
      createCurrentMatchSessionSnapshot({
        setup: continuedSetup,
        actions: completedActions,
        startedAt: testStartedAt
      })
    )
  })

  test('undo restores replayed state after continue-playing starts a new set', async () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    })
    const completedActions = winQuickSet('team-1')
    const continuedSetup = continueMatch(setup, projectMatch(setup, completedActions).state)
    const actionsWithEndlessPoint = [...completedActions, ...scorePoints('team-2')]
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const session = createCurrentMatchSession({
      matchId: testMatchId,
      setup: continuedSetup,
      actions: actionsWithEndlessPoint,
      startedAt: testStartedAt,
      persistence
    })

    const snapshot = await session.undoScoreAction()

    expect(saveCurrentMatchMock).toHaveBeenCalledWith({
      matchId: testMatchId,
      setup: continuedSetup,
      actions: completedActions,
      startedAt: testStartedAt
    })
    expect(snapshot.projection).toEqual(projectMatch(continuedSetup, completedActions))
    expect(snapshot.projection.derived.status).toBe('in-progress')
    expect(snapshot.projection.derived.activeSetIndex).toBe(2)
    expect(snapshot.projection.derived.scoreDisplay).toEqual({
      kind: 'standard',
      points: {
        'team-1': '0',
        'team-2': '0'
      }
    })
  })

  test('serializes overlapping score mutations across async persistence writes', async () => {
    const setup = createTestSetup()
    const firstSave = createDeferred<void>()
    const secondSave = createDeferred<void>()
    const saveCurrentMatchMock = vi
      .fn<CurrentMatchPersistence['saveCurrentMatch']>()
      .mockImplementationOnce(async () => {
        await firstSave.promise

        return {
          schemaVersion: currentMatchSchemaVersion,
          matchId: testMatchId,
          setup,
          actions: scorePoints('team-1'),
          startedAt: testStartedAt
        }
      })
      .mockImplementationOnce(async () => {
        await secondSave.promise

        return {
          schemaVersion: currentMatchSchemaVersion,
          matchId: testMatchId,
          setup,
          actions: scorePoints('team-1', 'team-2'),
          startedAt: testStartedAt
        }
      })
    const session = createCurrentMatchSession({
      matchId: testMatchId,
      setup,
      actions: [],
      startedAt: testStartedAt,
      persistence: {
        saveCurrentMatch: saveCurrentMatchMock,
        loadCurrentMatch: vi.fn(),
        clearCurrentMatch: vi.fn(async () => undefined)
      }
    })

    const firstMutation = session.scorePoint('team-1')
    const secondMutation = session.scorePoint('team-2')

    await Promise.resolve()

    expect(saveCurrentMatchMock).toHaveBeenCalledTimes(1)
    expect(saveCurrentMatchMock).toHaveBeenNthCalledWith(1, {
      matchId: testMatchId,
      setup,
      actions: scorePoints('team-1'),
      startedAt: testStartedAt
    })

    firstSave.resolve()
    await firstMutation
    await Promise.resolve()

    expect(saveCurrentMatchMock).toHaveBeenCalledTimes(2)
    expect(saveCurrentMatchMock).toHaveBeenNthCalledWith(2, {
      matchId: testMatchId,
      setup,
      actions: scorePoints('team-1', 'team-2'),
      startedAt: testStartedAt
    })

    secondSave.resolve()

    await expect(secondMutation).resolves.toMatchObject({
      actions: scorePoints('team-1', 'team-2')
    })
    expect(session.getSnapshot().projection.state.actionCount).toBe(2)
  })
})

function createPersistenceStub(): {
  persistence: CurrentMatchPersistence
  saveCurrentMatchMock: ReturnType<typeof vi.fn>
} {
  const saveCurrentMatchMock = vi.fn(
    async ({ matchId = 'current-match', setup, actions, startedAt, finishedAt }) => ({
      schemaVersion: currentMatchSchemaVersion,
      matchId,
      setup,
      actions,
      startedAt,
      ...(typeof finishedAt === 'number' ? { finishedAt } : {})
    })
  )

  return {
    persistence: {
      saveCurrentMatch: saveCurrentMatchMock,
      loadCurrentMatch: vi.fn(),
      clearCurrentMatch: vi.fn(async () => undefined)
    },
    saveCurrentMatchMock
  }
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })

  return {
    promise,
    resolve
  }
}
