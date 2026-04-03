import { describe, expect, test } from 'vitest'

import { projectMatch } from '@/core/match'
import { createMatchEndScreenSummary, getMatchDurationParts } from '@/components/MatchEndScreen'
import {
  createTestSetup,
  repeatAction,
  scorePoints,
  winQuickGame,
  winQuickSet
} from '../../core/match/test-helpers'

describe('MatchEndScreen view model', () => {
  test('builds a completed match summary from the projected match state', () => {
    const startedAt = 1_000
    const finishedAt = startedAt + 82 * 60 * 1000
    const now = finishedAt + 10 * 60 * 1000
    const setup = createTestSetup({
      sides: [
        { id: 'team-1', playerNames: ['Alvaro', 'Enrique'] },
        { id: 'team-2', playerNames: ['Pablo', 'Thiago'] }
      ]
    })
    const projection = projectMatch(setup, [
      ...winQuickSet('team-1'),
      ...winQuickSet('team-2'),
      ...winQuickSet('team-1')
    ])

    const summary = createMatchEndScreenSummary({ projection, startedAt, finishedAt, now })

    expect(summary).toEqual({
      winnerTeamId: 'team-1',
      winnerName: 'Alvaro & Enrique',
      isFinishedEarly: false,
      teamNames: {
        'team-1': 'Alvaro & Enrique',
        'team-2': 'Pablo & Thiago'
      },
      format: 'best-of-3',
      setRows: [
        {
          setNumber: 1,
          scores: {
            'team-1': 6,
            'team-2': 0
          },
          isSuperTiebreak: false
        },
        {
          setNumber: 2,
          scores: {
            'team-1': 0,
            'team-2': 6
          },
          isSuperTiebreak: false
        },
        {
          setNumber: 3,
          scores: {
            'team-1': 6,
            'team-2': 0
          },
          isSuperTiebreak: false
        }
      ],
      totalGames: 18,
      elapsedSeconds: 4_920
    })
  })

  test('marks manually finished matches without a winner as early finishes', () => {
    const projection = projectMatch(createTestSetup(), [])

    expect(
      createMatchEndScreenSummary({
        projection,
        startedAt: 10_000,
        finishedAt: 12_000,
        now: 15_000
      })
    ).toEqual({
      isFinishedEarly: true,
      teamNames: {
        'team-1': 'Ana & Bea',
        'team-2': 'Carla & Dani'
      },
      format: 'best-of-3',
      setRows: [
        {
          setNumber: 1,
          scores: {
            'team-1': 0,
            'team-2': 0
          },
          isSuperTiebreak: false
        }
      ],
      totalGames: 0,
      elapsedSeconds: 2
    })
  })

  test('falls back to completed-set wins and includes the partial set for early finishes', () => {
    const setup = createTestSetup({
      sides: [
        { id: 'team-1', playerNames: ['Alvaro', 'Enrique'] },
        { id: 'team-2', playerNames: ['Pablo', 'Thiago'] }
      ]
    })
    const projection = projectMatch(setup, [
      ...winQuickSet('team-1'),
      ...winQuickGame('team-1'),
      ...winQuickGame('team-2')
    ])

    expect(
      createMatchEndScreenSummary({
        projection,
        startedAt: 20_000,
        finishedAt: 80_000
      })
    ).toEqual({
      winnerTeamId: 'team-1',
      winnerName: 'Alvaro & Enrique',
      isFinishedEarly: false,
      teamNames: {
        'team-1': 'Alvaro & Enrique',
        'team-2': 'Pablo & Thiago'
      },
      format: 'best-of-3',
      setRows: [
        {
          setNumber: 1,
          scores: {
            'team-1': 6,
            'team-2': 0
          },
          isSuperTiebreak: false
        },
        {
          setNumber: 2,
          scores: {
            'team-1': 1,
            'team-2': 1
          },
          isSuperTiebreak: false
        }
      ],
      totalGames: 8,
      elapsedSeconds: 60
    })
  })

  test('splits elapsed time into hours and minutes', () => {
    expect(getMatchDurationParts(4_920)).toEqual({
      hours: 1,
      minutes: 22
    })
    expect(getMatchDurationParts(59)).toEqual({
      hours: 0,
      minutes: 0
    })
  })

  test('determineWinnerFromCompletedSets returns team-2 when team-2 wins more sets', () => {
    const setup = createTestSetup({
      sides: [
        { id: 'team-1', playerNames: ['Alvaro', 'Enrique'] },
        { id: 'team-2', playerNames: ['Pablo', 'Thiago'] }
      ]
    })
    const projection = projectMatch(setup, [
      ...winQuickSet('team-1'),
      ...winQuickSet('team-2'),
      ...winQuickSet('team-2')
    ])

    const summary = createMatchEndScreenSummary({
      projection,
      startedAt: 10_000,
      finishedAt: 50_000
    })

    expect(summary.winnerTeamId).toBe('team-2')
    expect(summary.winnerName).toBe('Pablo & Thiago')
  })

  test('determineWinnerFromCompletedSets returns null when sets are tied', () => {
    const setup = createTestSetup({
      sides: [
        { id: 'team-1', playerNames: ['Ana', 'Bea'] },
        { id: 'team-2', playerNames: ['Carla', 'Dani'] }
      ]
    })
    const projection = projectMatch(setup, [
      ...winQuickSet('team-1'),
      ...winQuickSet('team-2'),
      ...winQuickGame('team-1')
    ])

    const summary = createMatchEndScreenSummary({
      projection,
      startedAt: 10_000,
      finishedAt: 50_000
    })

    expect(summary.winnerTeamId).toBeUndefined()
    expect(summary.winnerName).toBeUndefined()
    expect(summary.isFinishedEarly).toBe(true)
  })

  test('determineWinnerFromCompletedSets returns null when no completed sets exist', () => {
    const projection = projectMatch(createTestSetup(), [...winQuickGame('team-1')])

    const summary = createMatchEndScreenSummary({
      projection,
      startedAt: 10_000,
      finishedAt: 50_000
    })

    expect(summary.winnerTeamId).toBeUndefined()
    expect(summary.isFinishedEarly).toBe(true)
  })

  test('returns empty string when side has no player names', () => {
    const setup = createTestSetup({
      sides: [
        { id: 'team-1', playerNames: [] },
        { id: 'team-2', playerNames: ['Carla'] }
      ]
    })
    const projection = projectMatch(setup, [
      ...winQuickSet('team-1'),
      ...winQuickSet('team-2'),
      ...winQuickSet('team-1')
    ])

    const summary = createMatchEndScreenSummary({
      projection,
      startedAt: 1_000,
      finishedAt: 10_000
    })

    expect(summary.teamNames['team-1']).toBe('')
    expect(summary.teamNames['team-2']).toBe('Carla')
  })

  test('uses now as fallback when finishedAt is not provided', () => {
    const startedAt = 1_000
    const now = startedAt + 120_000
    const projection = projectMatch(createTestSetup(), [])

    const summary = createMatchEndScreenSummary({
      projection,
      startedAt,
      now
    })

    expect(summary.elapsedSeconds).toBe(120)
  })

  test('clamps elapsed seconds to 0 when startedAt is in the future', () => {
    const projection = projectMatch(createTestSetup(), [])

    const summary = createMatchEndScreenSummary({
      projection,
      startedAt: 200_000,
      finishedAt: 100_000
    })

    expect(summary.elapsedSeconds).toBe(0)
  })

  test('getMatchDurationParts handles zero seconds', () => {
    expect(getMatchDurationParts(0)).toEqual({ hours: 0, minutes: 0 })
  })

  test('getMatchDurationParts handles negative seconds', () => {
    expect(getMatchDurationParts(-100)).toEqual({ hours: 0, minutes: 0 })
  })

  test('getMatchDurationParts handles exactly one hour', () => {
    expect(getMatchDurationParts(3600)).toEqual({ hours: 1, minutes: 0 })
  })

  test('displays super-tiebreak points instead of games for super-tiebreak sets', () => {
    const setup = createTestSetup({
      decidingSetSuperTiebreak: true,
      sides: [
        { id: 'team-1', playerNames: ['Alvaro', 'Enrique'] },
        { id: 'team-2', playerNames: ['Pablo', 'Thiago'] }
      ]
    })
    const projection = projectMatch(setup, [
      ...winQuickSet('team-1'),
      ...winQuickSet('team-2'),
      ...repeatAction('team-1', 9),
      ...repeatAction('team-2', 8),
      ...scorePoints('team-1')
    ])

    const summary = createMatchEndScreenSummary({
      projection,
      startedAt: 1_000,
      finishedAt: 10_000
    })

    expect(summary.winnerTeamId).toBe('team-1')
    expect(summary.setRows).toEqual([
      {
        setNumber: 1,
        scores: { 'team-1': 6, 'team-2': 0 },
        isSuperTiebreak: false
      },
      {
        setNumber: 2,
        scores: { 'team-1': 0, 'team-2': 6 },
        isSuperTiebreak: false
      },
      {
        setNumber: 3,
        scores: { 'team-1': 10, 'team-2': 8 },
        isSuperTiebreak: true
      }
    ])
  })
})
