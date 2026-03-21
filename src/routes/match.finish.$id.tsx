import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { MatchEndScreen } from '@/components/MatchEndScreen'
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
    return { matchId: params.id, matchData }
  }
})

function MatchFinishRoute() {
  const { matchId, matchData } = Route.useLoaderData()

  return <MatchFinishRouteContent matchData={matchData} matchId={matchId} />
}

export interface MatchFinishRouteContentProps {
  matchId: string
  matchData: CurrentMatchLoadResult
}

export function MatchFinishRouteContent({ matchId, matchData }: MatchFinishRouteContentProps) {
  const navigate = useNavigate()
  const routeState = resolveMatchRouteState(matchId, matchData, 'finish')
  const routeStateStatus = routeState.status
  const redirectMatchId = routeStateStatus === 'redirect-active' ? routeState.matchId : null
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

    if (routeStateStatus === 'redirect-active' && redirectMatchId !== null) {
      void navigate({
        to: '/match/$id',
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

  return (
    <MatchEndScreen
      matchId={routeState.record.matchId}
      setup={routeState.record.setup}
      actions={routeState.record.actions}
      projection={routeState.projection}
      startedAt={routeState.record.startedAt}
      {...(typeof routeState.record.finishedAt === 'number'
        ? { finishedAt: routeState.record.finishedAt }
        : {})}
    />
  )
}
