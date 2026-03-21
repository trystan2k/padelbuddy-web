import { describe, expect, test } from 'vitest'

import { projectMatch } from '@/core/match'
import { createMatchEndScreenSummary, getMatchDurationParts } from '@/components/MatchEndScreen'
import { createTestSetup, winQuickGame, winQuickSet } from '../../core/match/test-helpers'

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
          }
        },
        {
          setNumber: 2,
          scores: {
            'team-1': 0,
            'team-2': 6
          }
        },
        {
          setNumber: 3,
          scores: {
            'team-1': 6,
            'team-2': 0
          }
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
          }
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
          }
        },
        {
          setNumber: 2,
          scores: {
            'team-1': 1,
            'team-2': 1
          }
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
})
