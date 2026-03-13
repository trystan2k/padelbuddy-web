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
  test('derives the initial projection from canonical setup and actions', () => {
    const setup = createTestSetup()
    const actions = [...winQuickGame('team-1'), ...scorePoints('team-2')]

    expect(createCurrentMatchSessionSnapshot({ setup, actions })).toEqual({
      setup,
      actions,
      projection: projectMatch(setup, actions)
    })
  })

  test('persists score mutations after replay projects the next state', async () => {
    const setup = createTestSetup()
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const session = createCurrentMatchSession({
      setup,
      actions: [],
      persistence
    })

    const snapshot = await session.scorePoint('team-1')

    expect(saveCurrentMatchMock).toHaveBeenCalledWith({
      setup,
      actions: scorePoints('team-1')
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
      setup,
      actions: completedActions,
      persistence
    })

    const snapshot = await session.undoScoreAction()
    const undoneActions = undoLastScoringAction(completedActions)

    expect(saveCurrentMatchMock).toHaveBeenCalledWith({
      setup,
      actions: undoneActions
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
      setup,
      actions: [],
      persistence
    })

    const snapshot = await session.undoScoreAction()

    expect(saveCurrentMatchMock).not.toHaveBeenCalled()
    expect(snapshot).toEqual(createCurrentMatchSessionSnapshot({ setup, actions: [] }))
  })

  test('skips persisting score actions that replay ignores after match completion', async () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    })
    const completedActions = winQuickSet('team-1')
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const session = createCurrentMatchSession({
      setup,
      actions: completedActions,
      persistence
    })

    const snapshot = await session.scorePoint('team-2')

    expect(saveCurrentMatchMock).not.toHaveBeenCalled()
    expect(snapshot.actions).toEqual(completedActions)
    expect(snapshot.projection).toEqual(projectMatch(setup, completedActions))
  })

  test('persists continued matches using the uncapped setup', async () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    })
    const actions = winQuickSet('team-1')
    const completedProjection = projectMatch(setup, actions)
    const continuedSetup = continueMatch(setup, completedProjection.state)
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const session = createCurrentMatchSession({
      setup,
      actions,
      persistence
    })

    const snapshot = await session.continuePlaying()

    expect(saveCurrentMatchMock).toHaveBeenCalledWith({
      setup: continuedSetup,
      actions
    })
    expect(snapshot.setup).toEqual(continuedSetup)
    expect(snapshot.projection).toEqual(projectMatch(continuedSetup, actions))
    expect(snapshot.projection.derived.activeSetIndex).toBe(2)
  })

  test('returns the existing snapshot when continue-playing is already uncapped', async () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    })
    const completedActions = winQuickSet('team-1')
    const continuedSetup = continueMatch(setup, projectMatch(setup, completedActions).state)
    const { persistence, saveCurrentMatchMock } = createPersistenceStub()
    const session = createCurrentMatchSession({
      setup: continuedSetup,
      actions: completedActions,
      persistence
    })

    const snapshot = await session.continuePlaying()

    expect(saveCurrentMatchMock).not.toHaveBeenCalled()
    expect(snapshot).toEqual(
      createCurrentMatchSessionSnapshot({
        setup: continuedSetup,
        actions: completedActions
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
      setup: continuedSetup,
      actions: actionsWithEndlessPoint,
      persistence
    })

    const snapshot = await session.undoScoreAction()

    expect(saveCurrentMatchMock).toHaveBeenCalledWith({
      setup: continuedSetup,
      actions: completedActions
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
})

function createPersistenceStub(): {
  persistence: CurrentMatchPersistence
  saveCurrentMatchMock: ReturnType<typeof vi.fn>
} {
  const saveCurrentMatchMock = vi.fn(async ({ setup, actions }) => ({
    schemaVersion: currentMatchSchemaVersion,
    setup,
    actions
  }))

  return {
    persistence: {
      saveCurrentMatch: saveCurrentMatchMock,
      loadCurrentMatch: vi.fn(),
      clearCurrentMatch: vi.fn(async () => undefined)
    },
    saveCurrentMatchMock
  }
}
