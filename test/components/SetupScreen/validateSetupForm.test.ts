import { describe, expect, test } from 'vitest'

import { validateSetupForm } from '@/components/SetupScreen/validateSetupForm'
import type { SetupFormData } from '@/components/SetupScreen/types'

describe('validateSetupForm', () => {
  const validData: SetupFormData = {
    team1Name: 'Team Alpha',
    team2Name: 'Team Beta',
    format: 'best-of-3',
    gameMode: 'advantage',
    initialServer: 'team-1',
    decidingSetSuperTiebreak: false,
    countdownTimerEnabled: false,
    countdownTimerDuration: 90,
    sideSwitchPrompts: true
  }

  test('returns valid for correct data', () => {
    const result = validateSetupForm(validData)

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  test('returns invalid when team1Name is empty', () => {
    const result = validateSetupForm({
      ...validData,
      team1Name: ''
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.team1Name).toBe('setup.validation.teamNamesRequired')
  })

  test('returns invalid when team1Name is whitespace only', () => {
    const result = validateSetupForm({
      ...validData,
      team1Name: '   '
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.team1Name).toBe('setup.validation.teamNamesRequired')
  })

  test('returns invalid when team2Name is empty', () => {
    const result = validateSetupForm({
      ...validData,
      team2Name: ''
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.team2Name).toBe('setup.validation.teamNamesRequired')
  })

  test('returns invalid when team2Name is whitespace only', () => {
    const result = validateSetupForm({
      ...validData,
      team2Name: '   '
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.team2Name).toBe('setup.validation.teamNamesRequired')
  })

  test('returns invalid when both team names are empty', () => {
    const result = validateSetupForm({
      ...validData,
      team1Name: '',
      team2Name: ''
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.team1Name).toBe('setup.validation.teamNamesRequired')
    expect(result.errors.team2Name).toBe('setup.validation.teamNamesRequired')
  })

  test('accepts team names with leading/trailing whitespace', () => {
    const result = validateSetupForm({
      ...validData,
      team1Name: '  Team Alpha  ',
      team2Name: '  Team Beta  '
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  test('accepts all match formats', () => {
    const formats: SetupFormData['format'][] = ['best-of-1', 'best-of-3', 'best-of-5']

    formats.forEach((format) => {
      const result = validateSetupForm({
        ...validData,
        format
      })

      expect(result.isValid).toBe(true)
    })
  })

  test('accepts all game modes', () => {
    const gameModes: SetupFormData['gameMode'][] = ['advantage', 'golden-point']

    gameModes.forEach((gameMode) => {
      const result = validateSetupForm({
        ...validData,
        gameMode
      })

      expect(result.isValid).toBe(true)
    })
  })

  test('accepts all initial server options', () => {
    const servers: SetupFormData['initialServer'][] = ['team-1', 'team-2']

    servers.forEach((initialServer) => {
      const result = validateSetupForm({
        ...validData,
        initialServer
      })

      expect(result.isValid).toBe(true)
    })
  })

  test('accepts any boolean values for decidingSetSuperTiebreak', () => {
    const trueResult = validateSetupForm({
      ...validData,
      decidingSetSuperTiebreak: true
    })

    const falseResult = validateSetupForm({
      ...validData,
      decidingSetSuperTiebreak: false
    })

    expect(trueResult.isValid).toBe(true)
    expect(falseResult.isValid).toBe(true)
  })

  test('accepts any boolean values for sideSwitchPrompts', () => {
    const trueResult = validateSetupForm({
      ...validData,
      sideSwitchPrompts: true
    })

    const falseResult = validateSetupForm({
      ...validData,
      sideSwitchPrompts: false
    })

    expect(trueResult.isValid).toBe(true)
    expect(falseResult.isValid).toBe(true)
  })

  test('accepts supported countdown durations', () => {
    const durations: SetupFormData['countdownTimerDuration'][] = [60, 90, 120]

    durations.forEach((countdownTimerDuration) => {
      const result = validateSetupForm({
        ...validData,
        countdownTimerDuration
      })

      expect(result.isValid).toBe(true)
    })
  })

  test('rejects unsupported countdown durations', () => {
    const result = validateSetupForm({
      ...validData,
      countdownTimerDuration: 75 as SetupFormData['countdownTimerDuration']
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.countdownTimerDuration).toBe('setup.validation.invalidCountdownDuration')
  })
})
