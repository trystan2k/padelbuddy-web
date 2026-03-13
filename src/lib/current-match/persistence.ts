import {
  createMatchSetup,
  matchTeamIds,
  projectMatch,
  type MatchAction,
  type MatchProjection,
  type MatchSetup,
  type MatchTeamId
} from '@/core/match'

export const currentMatchSchemaVersion = 1 as const

export interface CurrentMatchSaveInput {
  setup: MatchSetup
  actions: MatchAction[]
}

export interface CurrentMatchRecord {
  schemaVersion: typeof currentMatchSchemaVersion
  setup: MatchSetup
  actions: MatchAction[]
}

export interface CurrentMatchDecodeOkResult {
  status: 'ok'
  record: CurrentMatchRecord
}

export interface CurrentMatchDecodeResetRequiredResult {
  status: 'reset-required'
  reason: 'schema-version'
  storedSchemaVersion: number
}

export interface CurrentMatchDecodeCorruptResult {
  status: 'corrupt'
  message: string
}

export type CurrentMatchDecodeResult =
  | CurrentMatchDecodeOkResult
  | CurrentMatchDecodeResetRequiredResult
  | CurrentMatchDecodeCorruptResult

export function createCurrentMatchRecord(input: CurrentMatchSaveInput): CurrentMatchRecord {
  return {
    schemaVersion: currentMatchSchemaVersion,
    setup: parseMatchSetup(input.setup),
    actions: parseMatchActions(input.actions)
  }
}

export function parseCurrentMatchRecord(input: unknown): CurrentMatchRecord {
  const result = decodeCurrentMatchRecord(input)

  if (result.status === 'ok') {
    return result.record
  }

  if (result.status === 'reset-required') {
    throw new Error(`Unsupported current match schema version: ${result.storedSchemaVersion}`)
  }

  throw new Error(result.message)
}

export function replayCurrentMatchRecord(record: CurrentMatchRecord): MatchProjection {
  return projectMatch(record.setup, record.actions)
}

export function decodeCurrentMatchRecord(input: unknown): CurrentMatchDecodeResult {
  let record: Record<string, unknown>

  try {
    record = parseRecord(input)
  } catch (error) {
    return createCorruptResult(error)
  }

  const schemaVersion = record.schemaVersion

  if (schemaVersion !== currentMatchSchemaVersion) {
    if (typeof schemaVersion === 'number' && Number.isInteger(schemaVersion)) {
      return {
        status: 'reset-required',
        reason: 'schema-version',
        storedSchemaVersion: schemaVersion
      }
    }

    return {
      status: 'corrupt',
      message: `Invalid current match schema version: ${String(schemaVersion)}`
    }
  }

  try {
    return {
      status: 'ok',
      record: {
        schemaVersion: currentMatchSchemaVersion,
        setup: parseMatchSetup(record.setup),
        actions: parseMatchActions(record.actions)
      }
    }
  } catch (error) {
    return createCorruptResult(error)
  }
}

function parseMatchSetup(input: unknown): MatchSetup {
  const setup = parseRecord(input)
  const setupInput = {
    format: setup.format,
    gameMode: setup.gameMode,
    initialServer: setup.initialServer,
    decidingSetSuperTiebreak: setup.decidingSetSuperTiebreak,
    sideSwitchPrompts: setup.sideSwitchPrompts,
    sides: setup.sides
  }

  if (setup.format === 'best-of-1' && typeof setup.bestOfOneDecidingBehavior === 'string') {
    return createMatchSetup({
      ...setupInput,
      bestOfOneDecidingBehavior: setup.bestOfOneDecidingBehavior
    })
  }

  return createMatchSetup(setupInput)
}

function parseMatchActions(input: unknown): MatchAction[] {
  if (!Array.isArray(input)) {
    throw new Error('Current match actions must be an array.')
  }

  return input.map((action) => parseMatchAction(action))
}

function parseMatchAction(input: unknown): MatchAction {
  const action = parseRecord(input)

  if (action.type !== 'score-point') {
    throw new Error(`Unsupported current match action type: ${String(action.type)}`)
  }

  if (!isMatchTeamId(action.teamId)) {
    throw new Error(`Invalid current match action team: ${String(action.teamId)}`)
  }

  return {
    type: 'score-point',
    teamId: action.teamId
  }
}

function isMatchTeamId(value: unknown): value is MatchTeamId {
  return typeof value === 'string' && matchTeamIds.some((teamId) => teamId === value)
}

function parseRecord(input: unknown): Record<string, unknown> {
  if (!isRecord(input)) {
    throw new Error('Current match record must be an object.')
  }

  return input
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
}

function createCorruptResult(error: unknown): CurrentMatchDecodeCorruptResult {
  return {
    status: 'corrupt',
    message: error instanceof Error ? error.message : 'Current match payload is corrupt.'
  }
}
