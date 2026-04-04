import { describe, expect, test } from 'vitest'

import { getActiveSet } from '@/core/match/derived-state'
import { projectMatch } from '@/core/match/replay'

import { createTestSetup, scorePoints, winQuickSet } from './test-helpers'

describe('core scoring transitions', () => {
  test('resolves deuce with advantage scoring', () => {
    const setup = createTestSetup()
    const actions = scorePoints(
      'team-1',
      'team-1',
      'team-1',
      'team-2',
      'team-2',
      'team-2',
      'team-1',
      'team-2',
      'team-2',
      'team-2'
    )

    const projection = projectMatch(setup, actions)
    const activeSet = getActiveSet(projection.state)

    expect(activeSet).not.toBeNull()
    expect(activeSet?.games).toEqual({
      'team-1': 0,
      'team-2': 1
    })
    expect(projection.derived.scoreDisplay).toEqual({
      kind: 'standard',
      points: {
        'team-1': '0',
        'team-2': '0'
      }
    })
  })

  test('shows advantage score display for both teams', () => {
    const setup = createTestSetup()
    const teamOneAdvantage = projectMatch(
      setup,
      scorePoints('team-1', 'team-1', 'team-1', 'team-2', 'team-2', 'team-2', 'team-1')
    )
    const teamTwoAdvantage = projectMatch(
      setup,
      scorePoints('team-1', 'team-1', 'team-1', 'team-2', 'team-2', 'team-2', 'team-2')
    )

    expect(teamOneAdvantage.derived.scoreDisplay).toEqual({
      kind: 'standard',
      points: {
        'team-1': 'ad',
        'team-2': '40'
      }
    })
    expect(teamTwoAdvantage.derived.scoreDisplay).toEqual({
      kind: 'standard',
      points: {
        'team-1': '40',
        'team-2': 'ad'
      }
    })
  })

  test('uses golden point to finish the game at deuce', () => {
    const setup = createTestSetup({
      gameMode: 'golden-point'
    })
    const actions = scorePoints(
      'team-1',
      'team-1',
      'team-1',
      'team-2',
      'team-2',
      'team-2',
      'team-1'
    )

    const projection = projectMatch(setup, actions)
    const activeSet = getActiveSet(projection.state)

    expect(activeSet).not.toBeNull()
    expect(activeSet?.games).toEqual({
      'team-1': 1,
      'team-2': 0
    })
  })

  test('rolls completed sets into the next set when the match is still active', () => {
    const setup = createTestSetup()
    const projection = projectMatch(setup, winQuickSet('team-1'))

    expect(projection.derived.setsWon).toEqual({
      'team-1': 1,
      'team-2': 0
    })
    expect(projection.derived.status).toBe('in-progress')
    expect(projection.derived.activeSetIndex).toBe(2)
    expect(projection.state.sets).toHaveLength(2)
    expect(projection.state.sets[0]).toMatchObject({
      completed: true,
      winner: 'team-1',
      games: {
        'team-1': 6,
        'team-2': 0
      }
    })
  })

  test('stops official scoring once the match completion condition is reached', () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    })
    const actions = [
      ...winQuickSet('team-1'),
      ...scorePoints('team-2', 'team-2', 'team-2', 'team-2')
    ]
    const projection = projectMatch(setup, actions)

    expect(projection.derived.status).toBe('completed')
    expect(projection.derived.winner?.teamId).toBe('team-1')
    expect(projection.derived.activeSetIndex).toBeNull()
    expect(projection.state.actionCount).toBe(24)
    expect(projection.state.sets).toHaveLength(1)
  })
})
