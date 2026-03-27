import { createFileRoute, redirect } from '@tanstack/react-router'

import { MatchEndScreen } from '@/components/MatchEndScreen'
import type { MatchProjection } from '@/core/match'
import { loadCurrentMatch, type CurrentMatchRecord } from '@/lib/current-match'
import { currentMatchPersistenceRouteLoaderOptions } from '@/lib/router/current-match-route-flow'

import { resolveMatchRouteState } from './-match-route-state'
import { RouteErrorState, RouteLoadingState } from './-route-utils'

export const Route = createFileRoute('/match/finish/$id')({
  ...currentMatchPersistenceRouteLoaderOptions,
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
        search: { error: routeState.error }
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

interface MatchFinishRouteReadyContentProps {
  record: CurrentMatchRecord
  projection: MatchProjection
}

function MatchFinishRouteReadyContent({ record, projection }: MatchFinishRouteReadyContentProps) {
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
