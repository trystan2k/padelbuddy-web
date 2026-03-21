import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
    // Load match data from persistence
    // Match ID is stored for future use (sharing, history)
    const matchData = await loadCurrentMatch()
    return { matchId: params.id, matchData }
  }
})

function MatchRoute() {
  const { matchId, matchData } = Route.useLoaderData()

  return <MatchRouteContent matchData={matchData} matchId={matchId} />
}

export interface MatchRouteContentProps {
  matchId: string
  matchData: CurrentMatchLoadResult
}

export function MatchRouteContent({ matchId, matchData }: MatchRouteContentProps) {
  const navigate = useNavigate()
  const routeState = resolveMatchRouteState(matchId, matchData, 'active')
  const routeStateStatus = routeState.status
  const redirectMatchId = routeStateStatus === 'redirect-finish' ? routeState.matchId : null
  const corruptMessage = matchData.status === 'corrupt' ? matchData.message : null

  useEffect(() => {
    if (corruptMessage !== null) {
      console.error('Corrupted match data:', corruptMessage)
    }

    if (routeStateStatus === 'redirect-home') {
      void navigate({
        to: '/',
        replace: true,
        search: { error: determineErrorType(matchId, matchData) },
        ...getViewTransitionNavigationOptions()
      })
      return
    }

    if (routeStateStatus === 'redirect-finish' && redirectMatchId !== null) {
      void navigate({
        to: '/match/finish/$id',
        params: { id: redirectMatchId },
        replace: true,
        ...getViewTransitionNavigationOptions()
      })
      return
    }
  }, [corruptMessage, matchData, matchId, navigate, redirectMatchId, routeStateStatus])

  if (routeStateStatus !== 'ready') {
    return <RouteLoadingState />
  }

  const { setup, actions, startedAt } = routeState.record

  return (
    <ActiveMatchScreen
      matchId={matchId}
      initialSetup={setup}
      initialActions={actions}
      startedAt={startedAt}
      {...(typeof routeState.record.finishedAt === 'number'
        ? { finishedAt: routeState.record.finishedAt }
        : {})}
    />
  )
}
