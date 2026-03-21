import { projectMatch, type MatchProjection } from '@/core/match'
import type { CurrentMatchLoadResult, CurrentMatchRecord } from '@/lib/current-match'

export type MatchRouteMode = 'active' | 'finish'

const matchRouteErrorTypes = ['invalid-match', 'no-match', 'corrupt'] as const

export type MatchRouteErrorType = (typeof matchRouteErrorTypes)[number]

export type MatchRouteState =
  | {
      status: 'redirect-home'
    }
  | {
      status: 'redirect-active'
      matchId: string
    }
  | {
      status: 'redirect-finish'
      matchId: string
    }
  | {
      status: 'ready'
      record: CurrentMatchRecord
      projection: MatchProjection
    }

export function resolveMatchRouteState(
  matchId: string,
  matchData: CurrentMatchLoadResult,
  mode: MatchRouteMode
): MatchRouteState {
  if (
    matchData.status === 'empty' ||
    matchData.status === 'reset-required' ||
    matchData.status === 'corrupt'
  ) {
    return {
      status: 'redirect-home'
    }
  }

  if (matchData.record.matchId !== matchId) {
    return {
      status: 'redirect-home'
    }
  }

  const projection = projectMatch(matchData.record.setup, matchData.record.actions)

  if (mode === 'active' && projection.derived.status === 'completed') {
    return {
      status: 'redirect-finish',
      matchId
    }
  }

  if (
    mode === 'finish' &&
    projection.derived.status === 'in-progress' &&
    typeof matchData.record.finishedAt !== 'number'
  ) {
    return {
      status: 'redirect-active',
      matchId
    }
  }

  return {
    status: 'ready',
    record: matchData.record,
    projection
  }
}

export function determineErrorType(
  matchId: string,
  matchData: CurrentMatchLoadResult
): MatchRouteErrorType {
  if (matchData.status === 'corrupt') {
    return 'corrupt'
  }

  if (matchData.status === 'empty' || matchData.status === 'reset-required') {
    return 'no-match'
  }

  if (matchData.record.matchId !== matchId) {
    return 'invalid-match'
  }

  console.error('[determineErrorType] Unexpected state.', {
    matchId,
    matchDataStatus: matchData.status,
    recordMatchId: matchData.record.matchId
  })

  return 'no-match'
}

export function parseMatchRouteErrorType(value: unknown): MatchRouteErrorType | undefined {
  if (typeof value !== 'string') return undefined

  return matchRouteErrorTypes.find((errorType) => errorType === value)
}
