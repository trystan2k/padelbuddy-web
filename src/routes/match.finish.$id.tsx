import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { MatchEndScreen } from '@/components/MatchEndScreen'
import type { MatchProjection } from '@/core/match'
import { loadCurrentMatch, type CurrentMatchLoadResult } from '@/lib/current-match'
import { getViewTransitionNavigationOptions } from '@/lib/utils/view-transitions'

import { determineErrorType, resolveMatchRouteState } from './-match-route-state'
import { RouteErrorState, RouteLoadingState } from './-route-utils'

export const Route = createFileRoute('/match/finish/$id')({
  component: MatchFinishRoute,
  pendingComponent: RouteLoadingState,
  errorComponent: RouteErrorState,
  loader: async ({ params }) => {
    const matchData = await loadCurrentMatch()
    const routeState = resolveMatchRouteState(params.id, matchData, 'finish')

    if (routeState.status === 'redirect-home') {
      throw redirect({
        to: '/',
        replace: true,
        search: { error: determineErrorType(params.id, matchData) }
      })
    }

    if (routeState.status === 'redirect-active') {
      throw redirect({
        to: '/match/$id',
        params: { id: routeState.matchId },
        replace: true
      })
    }

    if (routeState.status !== 'ready') {
      throw new Error('Expected finish match route state to be ready after redirect guards.')
    }

    return {
      matchId: params.id,
      record: routeState.record,
      projection: routeState.projection
    }
  }
})

function MatchFinishRoute() {
  const { record, projection } = Route.useLoaderData()

  return <MatchFinishRouteReadyContent record={record} projection={projection} />
}

export interface MatchFinishRouteContentProps {
  matchId: string
  matchData: CurrentMatchLoadResult
}

function MatchFinishRouteReadyContent({
  record,
  projection
}: {
  record: Extract<CurrentMatchLoadResult, { status: 'ok' }>['record']
  projection: MatchProjection
}) {
  return (
    <MatchEndScreen
      matchId={record.matchId}
      setup={record.setup}
      actions={record.actions}
      projection={projection}
      startedAt={record.startedAt}
      {...(typeof record.finishedAt === 'number' ? { finishedAt: record.finishedAt } : {})}
    />
  )
}

export function MatchFinishRouteContent({ matchId, matchData }: MatchFinishRouteContentProps) {
  const navigate = useNavigate()
  const routeState = resolveMatchRouteState(matchId, matchData, 'finish')

  useEffect(() => {
    if (matchData.status === 'corrupt') {
      console.error('Corrupted match data:', matchData.message)
    }

    if (routeState.status === 'redirect-home') {
      void navigate({
        to: '/',
        replace: true,
        search: { error: determineErrorType(matchId, matchData) },
        ...getViewTransitionNavigationOptions()
      })
      return
    }

    if (routeState.status === 'redirect-active') {
      void navigate({
        to: '/match/$id',
        params: { id: routeState.matchId },
        replace: true,
        ...getViewTransitionNavigationOptions()
      })
    }
  }, [matchData, matchId, navigate, routeState])

  if (routeState.status !== 'ready') {
    return null
  }

  return (
    <MatchFinishRouteReadyContent record={routeState.record} projection={routeState.projection} />
  )
}
