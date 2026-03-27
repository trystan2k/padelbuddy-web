import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { ActiveMatchScreen } from '@/components/ActiveMatchScreen'
import { loadCurrentMatch, type CurrentMatchLoadResult } from '@/lib/current-match'
import { getViewTransitionNavigationOptions } from '@/lib/utils/view-transitions'

import { determineErrorType, resolveMatchRouteState } from './-match-route-state'
import { RouteErrorState, RouteLoadingState } from './-route-utils'

export const Route = createFileRoute('/match/$id')({
  component: MatchRoute,
  pendingComponent: RouteLoadingState,
  errorComponent: RouteErrorState,
  loader: async ({ params }) => {
    const matchData = await loadCurrentMatch()
    const routeState = resolveMatchRouteState(params.id, matchData, 'active')

    if (routeState.status === 'redirect-home') {
      throw redirect({
        to: '/',
        replace: true,
        search: { error: determineErrorType(params.id, matchData) }
      })
    }

    if (routeState.status === 'redirect-finish') {
      throw redirect({
        to: '/match/finish/$id',
        params: { id: routeState.matchId },
        replace: true
      })
    }

    if (routeState.status !== 'ready') {
      throw new Error('Expected active match route state to be ready after redirect guards.')
    }

    return {
      matchId: params.id,
      record: routeState.record
    }
  }
})

function MatchRoute() {
  const { matchId, record } = Route.useLoaderData()

  return <MatchRouteReadyContent matchId={matchId} record={record} />
}

export interface MatchRouteContentProps {
  matchId: string
  matchData: CurrentMatchLoadResult
}

function MatchRouteReadyContent({
  matchId,
  record
}: {
  matchId: string
  record: Extract<CurrentMatchLoadResult, { status: 'ok' }>['record']
}) {
  const { setup, actions, startedAt } = record

  return (
    <ActiveMatchScreen
      matchId={matchId}
      initialSetup={setup}
      initialActions={actions}
      startedAt={startedAt}
      {...(typeof record.finishedAt === 'number' ? { finishedAt: record.finishedAt } : {})}
    />
  )
}

export function MatchRouteContent({ matchId, matchData }: MatchRouteContentProps) {
  const navigate = useNavigate()
  const routeState = resolveMatchRouteState(matchId, matchData, 'active')

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

    if (routeState.status === 'redirect-finish') {
      void navigate({
        to: '/match/finish/$id',
        params: { id: routeState.matchId },
        replace: true,
        ...getViewTransitionNavigationOptions()
      })
    }
  }, [matchData, matchId, navigate, routeState])

  if (routeState.status !== 'ready') {
    return null
  }

  return <MatchRouteReadyContent matchId={matchId} record={routeState.record} />
}
