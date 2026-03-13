import { describe, expect, test } from 'vitest'

import { createMatchSetup, validateMatchSetup, type MatchSetupInput } from '@/core/match'

const baseInput: MatchSetupInput = {
  format: 'best-of-3',
  gameMode: 'advantage',
  initialServer: 'team-1',
  decidingSetSuperTiebreak: false,
  sideSwitchPrompts: true,
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
}

describe('match setup validation', () => {
  test('accepts every supported v1 setup format combination', () => {
    const standardBestOfThree = createMatchSetup(baseInput)
    const decidingBestOfFive = createMatchSetup({
      ...baseInput,
      format: 'best-of-5',
      initialServer: 'team-2',
      gameMode: 'golden-point',
      decidingSetSuperTiebreak: true,
      sideSwitchPrompts: false
    })
    const bestOfOneFullSet = createMatchSetup({
      ...baseInput,
      format: 'best-of-1'
    })
    const bestOfOneSuperTiebreak = createMatchSetup({
      ...baseInput,
      format: 'best-of-1',
      decidingSetSuperTiebreak: true,
      bestOfOneDecidingBehavior: 'super-tiebreak'
    })

    expect(standardBestOfThree.officialMaxSets).toBe(3)
    expect(decidingBestOfFive.decidingSetMode).toBe('super-tiebreak')
    expect(bestOfOneFullSet.decidingSetMode).toBe('standard')
    expect(bestOfOneSuperTiebreak.decidingSetMode).toBe('super-tiebreak')
    expect(bestOfOneSuperTiebreak.setCap).toBe(1)
  })

  test('treats best-of-1 deciding behavior as authoritative over the super-tiebreak toggle', () => {
    const setup = createMatchSetup({
      ...baseInput,
      format: 'best-of-1',
      decidingSetSuperTiebreak: true,
      bestOfOneDecidingBehavior: 'full-set'
    })

    expect(setup.decidingSetSuperTiebreak).toBe(true)
    expect(setup.bestOfOneDecidingBehavior).toBe('full-set')
    expect(setup.decidingSetMode).toBe('standard')
  })

  test('normalizes sides into the canonical team order', () => {
    const setup = createMatchSetup({
      ...baseInput,
      sides: [baseInput.sides[1], baseInput.sides[0]]
    })

    expect(setup.sides[0].id).toBe('team-1')
    expect(setup.sides[1].id).toBe('team-2')
  })

  test('rejects invalid side collections', () => {
    const missingSideResult = validateMatchSetup({
      ...baseInput,
      sides: [baseInput.sides[0]]
    })

    expect(missingSideResult.success).toBe(false)
  })

  test('returns validation issues instead of throwing for null or primitive inputs', () => {
    expect(validateMatchSetup(null)).toEqual({
      success: false,
      issues: [
        {
          field: 'setup',
          message: 'Match setup must be an object.'
        }
      ]
    })
    expect(validateMatchSetup('not-an-object')).toEqual({
      success: false,
      issues: [
        {
          field: 'setup',
          message: 'Match setup must be an object.'
        }
      ]
    })
    expect(() => createMatchSetup(null)).toThrowError('Match setup must be an object.')
  })

  test('rejects malformed side entries without throwing', () => {
    const result = validateMatchSetup(
      JSON.parse(
        JSON.stringify({
          ...baseInput,
          sides: [null, 'team-2']
        })
      )
    )

    expect(result.success).toBe(false)
    expect(result.success ? [] : result.issues).toContainEqual(
      expect.objectContaining({
        field: 'sides',
        message: 'Side identifiers must be team-1 and team-2.'
      })
    )
  })

  test('rejects non-boolean primitive values for boolean setup fields', () => {
    const result = validateMatchSetup(
      JSON.parse(
        JSON.stringify({
          ...baseInput,
          sideSwitchPrompts: 'true',
          decidingSetSuperTiebreak: 1
        })
      )
    )

    expect(result.success).toBe(false)
    expect(result.success ? [] : result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'sideSwitchPrompts' }),
        expect.objectContaining({ field: 'decidingSetSuperTiebreak' })
      ])
    )
  })

  test('rejects unsupported primitive values for constrained setup fields', () => {
    const result = validateMatchSetup(
      JSON.parse(
        JSON.stringify({
          ...baseInput,
          format: 'best-of-9',
          gameMode: 'no-ad',
          initialServer: 'team-3',
          bestOfOneDecidingBehavior: 'coin-flip'
        })
      )
    )

    expect(result.success).toBe(false)
    expect(result.success ? [] : result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'format' }),
        expect.objectContaining({ field: 'gameMode' }),
        expect.objectContaining({ field: 'initialServer' }),
        expect.objectContaining({ field: 'bestOfOneDecidingBehavior' })
      ])
    )
  })

  test('rejects missing best-of-1 deciding behavior when super tiebreak is enabled', () => {
    const result = validateMatchSetup({
      ...baseInput,
      format: 'best-of-1',
      decidingSetSuperTiebreak: true
    })

    expect(result.success).toBe(false)
    expect(result.success ? [] : result.issues).toContainEqual(
      expect.objectContaining({
        field: 'bestOfOneDecidingBehavior'
      })
    )
  })

  test('rejects contradictory best-of-1 deciding behavior values', () => {
    const contradictoryBehavior = validateMatchSetup({
      ...baseInput,
      format: 'best-of-1',
      bestOfOneDecidingBehavior: 'super-tiebreak'
    })

    expect(contradictoryBehavior.success).toBe(false)
  })

  test('rejects best-of-1 deciding behavior for best-of-3 and best-of-5 matches', () => {
    const result = validateMatchSetup({
      ...baseInput,
      bestOfOneDecidingBehavior: 'full-set'
    })

    expect(result.success).toBe(false)
    expect(result.success ? [] : result.issues).toContainEqual(
      expect.objectContaining({
        field: 'bestOfOneDecidingBehavior'
      })
    )
  })

  test('rejects duplicate side ids and createMatchSetup throws for invalid input', () => {
    const invalidInput = {
      ...baseInput,
      sides: [
        {
          id: 'team-1',
          playerNames: ['Ana', 'Bea']
        },
        {
          id: 'team-1',
          playerNames: ['Carla', 'Dani']
        }
      ]
    } satisfies MatchSetupInput
    const result = validateMatchSetup(invalidInput)

    expect(result.success).toBe(false)
    expect(result.success ? [] : result.issues).toContainEqual(
      expect.objectContaining({
        field: 'sides'
      })
    )
    expect(() => createMatchSetup(invalidInput)).toThrowError(
      'Duplicate side id team-1 is not allowed.'
    )
  })
})
