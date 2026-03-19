import { describe, expect, test } from 'vitest'

import { projectMatch } from '@/core/match'
import { createMatchEndScreenSummary, getMatchDurationParts } from '@/components/MatchEndScreen'
import { createTestSetup, winQuickSet } from '../../core/match/test-helpers'

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

  test('throws when the projection is not completed', () => {
    const projection = projectMatch(createTestSetup(), [])

    expect(() =>
      createMatchEndScreenSummary({
        projection,
        startedAt: 10_000,
        now: 10_000
      })
    ).toThrow('Match end screen summary requires a completed match projection.')
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
