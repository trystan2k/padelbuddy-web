import { describe, expect, test } from 'vitest'

import {
  createMatchSetup,
  defaultMatchFormat,
  gameModes,
  matchFormats,
  projectMatch
} from '@/core/match'

describe('match domain public exports', () => {
  test('exposes the supported setup baselines and replay entrypoint', () => {
    const setup = createMatchSetup({
      format: defaultMatchFormat,
      gameMode: gameModes[0],
      initialServer: 'team-1',
      decidingSetSuperTiebreak: false,
      sideSwitchPrompts: false,
      sides: [
        {
          id: 'team-1',
          playerNames: ['Ana', 'Bea']
        },
        {
          id: 'team-2',
          playerNames: ['Carla', 'Dani']
        }
      ]
    })

    expect(matchFormats).toEqual(['best-of-1', 'best-of-3', 'best-of-5'])
    expect(defaultMatchFormat).toBe('best-of-3')
    expect(projectMatch(setup, []).derived.status).toBe('in-progress')
  })
})
