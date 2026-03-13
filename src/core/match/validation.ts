import {
  bestOfOneDecidingBehaviors,
  defaultBestOfOneDecidingBehavior,
  gameModes,
  matchFormats,
  matchTeamIds,
  setModes,
  type MatchSetup,
  type MatchSetupInput,
  type MatchSetupValidationIssue,
  type MatchSetupValidationResult,
  type MatchSide,
  type MatchTeamId
} from './types'

const officialMaxSetsByFormat = {
  'best-of-1': 1,
  'best-of-3': 3,
  'best-of-5': 5
} as const

const officialSetsToWinByFormat = {
  'best-of-1': 1,
  'best-of-3': 2,
  'best-of-5': 3
} as const

function isMatchSide(value: MatchSide | undefined): value is MatchSide {
  return value !== undefined && matchTeamIds.includes(value.id)
}

function normalizeSides(sides: MatchSetupInput['sides']): {
  normalizedSides: [MatchSide, MatchSide] | null
  issues: MatchSetupValidationIssue[]
} {
  const issues: MatchSetupValidationIssue[] = []

  if (!Array.isArray(sides) || sides.length !== 2) {
    issues.push({
      field: 'sides',
      message: 'Match setup must include exactly two sides.'
    })

    return {
      normalizedSides: null,
      issues
    }
  }

  const sideMap = new Map<MatchTeamId, MatchSide>()

  for (const side of sides) {
    if (!isMatchSide(side)) {
      issues.push({
        field: 'sides',
        message: 'Side identifiers must be team-1 and team-2.'
      })
      continue
    }

    if (sideMap.has(side.id)) {
      issues.push({
        field: 'sides',
        message: `Duplicate side id ${side.id} is not allowed.`
      })
      continue
    }

    sideMap.set(side.id, side)
  }

  if (issues.length > 0) {
    return {
      normalizedSides: null,
      issues
    }
  }

  const teamOne = sideMap.get('team-1')
  const teamTwo = sideMap.get('team-2')

  if (!teamOne || !teamTwo) {
    issues.push({
      field: 'sides',
      message: 'Both team-1 and team-2 sides are required.'
    })

    return {
      normalizedSides: null,
      issues
    }
  }

  return {
    normalizedSides: [teamOne, teamTwo],
    issues
  }
}

export function validateMatchSetup(input: MatchSetupInput): MatchSetupValidationResult {
  const issues: MatchSetupValidationIssue[] = []

  if (!matchFormats.includes(input.format)) {
    issues.push({
      field: 'format',
      message: `Unsupported match format: ${input.format}`
    })
  }

  if (!gameModes.includes(input.gameMode)) {
    issues.push({
      field: 'gameMode',
      message: `Unsupported game mode: ${input.gameMode}`
    })
  }

  if (!matchTeamIds.includes(input.initialServer)) {
    issues.push({
      field: 'initialServer',
      message: `Unsupported initial server: ${input.initialServer}`
    })
  }

  if (typeof input.sideSwitchPrompts !== 'boolean') {
    issues.push({
      field: 'sideSwitchPrompts',
      message: 'Side-switch prompts must be a boolean value.'
    })
  }

  if (typeof input.decidingSetSuperTiebreak !== 'boolean') {
    issues.push({
      field: 'decidingSetSuperTiebreak',
      message: 'Deciding-set super tiebreak must be a boolean value.'
    })
  }

  if (
    input.bestOfOneDecidingBehavior !== undefined &&
    !bestOfOneDecidingBehaviors.includes(input.bestOfOneDecidingBehavior)
  ) {
    issues.push({
      field: 'bestOfOneDecidingBehavior',
      message: `Unsupported best-of-1 deciding behavior: ${input.bestOfOneDecidingBehavior}`
    })
  }

  const { normalizedSides, issues: sideIssues } = normalizeSides(input.sides)
  issues.push(...sideIssues)

  if (input.format === 'best-of-1') {
    if (input.decidingSetSuperTiebreak && input.bestOfOneDecidingBehavior === undefined) {
      issues.push({
        field: 'bestOfOneDecidingBehavior',
        message:
          'Best-of-1 matches must define the deciding behavior when deciding-set super tiebreak is enabled.'
      })
    }
  } else if (input.bestOfOneDecidingBehavior !== undefined) {
    issues.push({
      field: 'bestOfOneDecidingBehavior',
      message: 'Best-of-1 deciding behavior is only allowed for best-of-1 matches.'
    })
  }

  if (input.bestOfOneDecidingBehavior === 'super-tiebreak' && !input.decidingSetSuperTiebreak) {
    issues.push({
      field: 'bestOfOneDecidingBehavior',
      message:
        'Best-of-1 super-tiebreak deciding behavior requires deciding-set super tiebreak to be enabled.'
    })
  }

  if (issues.length > 0 || normalizedSides === null) {
    return {
      success: false,
      issues
    }
  }

  const bestOfOneDecidingBehavior =
    input.format === 'best-of-1'
      ? (input.bestOfOneDecidingBehavior ?? defaultBestOfOneDecidingBehavior)
      : defaultBestOfOneDecidingBehavior

  const decidingSetMode =
    input.format === 'best-of-1'
      ? bestOfOneDecidingBehavior === 'super-tiebreak'
        ? setModes[1]
        : setModes[0]
      : input.decidingSetSuperTiebreak
        ? setModes[1]
        : setModes[0]

  return {
    success: true,
    data: {
      format: input.format,
      gameMode: input.gameMode,
      initialServer: input.initialServer,
      decidingSetSuperTiebreak: input.decidingSetSuperTiebreak,
      bestOfOneDecidingBehavior,
      sideSwitchPrompts: input.sideSwitchPrompts,
      sides: normalizedSides,
      decidingSetMode,
      officialMaxSets: officialMaxSetsByFormat[input.format],
      officialSetsToWin: officialSetsToWinByFormat[input.format],
      setCap: officialMaxSetsByFormat[input.format]
    }
  }
}

export function createMatchSetup(input: MatchSetupInput): MatchSetup {
  const result = validateMatchSetup(input)

  if (!result.success) {
    throw new Error(result.issues.map((issue) => issue.message).join(' '))
  }

  return result.data
}
