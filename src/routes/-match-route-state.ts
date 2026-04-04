import { projectMatch } from '@/core/match/replay'
import type { MatchProjection } from '@/core/match/types'
import type { CurrentMatchLoadResult } from '@/lib/current-match/indexed-db'
import type { CurrentMatchRecord } from '@/lib/current-match/persistence'

export type MatchRouteMode = 'active' | 'finish'

const matchRouteErrorTypes = ['invalid-match', 'no-match', 'corrupt'] as const

export type MatchRouteErrorType = (typeof matchRouteErrorTypes)[number]

export type MatchRouteState =
  | {
      status: 'redirect-home'
      error: MatchRouteErrorType
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
  const homeRedirectError = getHomeRedirectError(matchId, matchData)

  if (homeRedirectError) {
    return {
      status: 'redirect-home',
      error: homeRedirectError
    }
  }

  if (matchData.status !== 'ok') {
    throw new Error('Expected persisted match data after match route entry validation.')
  }

  const { record } = matchData
  const projection = projectMatch(record.setup, record.actions)

  if (mode === 'active' && projection.derived.status === 'completed') {
    return {
      status: 'redirect-finish',
      matchId
    }
  }

  if (
    mode === 'finish' &&
    projection.derived.status === 'in-progress' &&
    typeof record.finishedAt !== 'number'
  ) {
    return {
      status: 'redirect-active',
      matchId
    }
  }

  return {
    status: 'ready',
    record,
    projection
  }
}

function getHomeRedirectError(
  matchId: string,
  matchData: CurrentMatchLoadResult
): MatchRouteErrorType | undefined {
  if (matchData.status === 'corrupt') {
    return 'corrupt'
  }

  if (matchData.status === 'empty' || matchData.status === 'reset-required') {
    return 'no-match'
  }

  if (matchData.status !== 'ok') {
    return undefined
  }

  if (matchData.record.matchId !== matchId) {
    return 'invalid-match'
  }

  return undefined
}

export function parseMatchRouteErrorType(value: unknown): MatchRouteErrorType | undefined {
  if (typeof value !== 'string') return undefined

  return matchRouteErrorTypes.find((errorType) => errorType === value)
}
