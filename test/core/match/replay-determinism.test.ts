import { describe, expect, test } from 'vitest'

import { continueMatch, projectMatch, undoLastScoringAction } from '@/core/match'

import { createTestSetup, scorePoints, winQuickGame, winQuickSet } from './test-helpers'

describe('replay and determinism', () => {
  test('projects the same canonical state for identical setup and action history', () => {
    const setup = createTestSetup({
      decidingSetSuperTiebreak: true
    })
    const actions = [
      ...winQuickSet('team-1'),
      ...winQuickSet('team-2'),
      ...scorePoints('team-1', 'team-2', 'team-1', 'team-2', 'team-1', 'team-1')
    ]

    const firstProjection = projectMatch(setup, actions)
    const secondProjection = projectMatch(setup, actions)

    expect(secondProjection.state).toEqual(firstProjection.state)
    expect(secondProjection.derived).toEqual(firstProjection.derived)
  })

  test('undo is equivalent to replaying without the latest scoring action', () => {
    const setup = createTestSetup()
    const actions = [...winQuickGame('team-1'), ...scorePoints('team-2', 'team-2')]

    const projection = projectMatch(setup, actions)
    const undoneProjection = projectMatch(setup, undoLastScoringAction(actions))

    expect(projection.state.actionCount).toBe(6)
    expect(undoneProjection.state.actionCount).toBe(5)
    expect(undoneProjection.derived.scoreDisplay).toEqual({
      kind: 'standard',
      points: {
        'team-1': '0',
        'team-2': '15'
      }
    })
  })

  test('undo removes the completion boundary and endless-play eligibility from the last point', () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    })
    const completedActions = winQuickSet('team-1')
    const beforeMatchPointActions = undoLastScoringAction(completedActions)
    const completedProjection = projectMatch(setup, completedActions)
    const beforeMatchPointProjection = projectMatch(setup, beforeMatchPointActions)

    expect(completedProjection.derived.status).toBe('completed')
    expect(completedProjection.derived.canContinuePlaying).toBe(true)
    expect(beforeMatchPointProjection.derived.status).toBe('in-progress')
    expect(beforeMatchPointProjection.derived.canContinuePlaying).toBe(false)
    expect(beforeMatchPointProjection.derived.scoreDisplay).toEqual({
      kind: 'standard',
      points: {
        'team-1': '40',
        'team-2': '0'
      }
    })
  })

  test('guards continue-playing transitions to completed capped matches', () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    })
    const activeState = projectMatch(setup, winQuickGame('team-1')).state
    const completedState = projectMatch(setup, winQuickSet('team-1')).state
    const uncappedSetup = continueMatch(setup, completedState)

    expect(() => continueMatch(setup, activeState)).toThrowError(
      'Only a completed official match can continue playing.'
    )
    expect(continueMatch(uncappedSetup, completedState)).toBe(uncappedSetup)
  })
})
