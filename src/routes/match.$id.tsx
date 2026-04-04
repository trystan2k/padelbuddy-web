import { createFileRoute } from '@tanstack/react-router'

import { ActiveMatchScreen } from '@/components/ActiveMatchScreen/ActiveMatchScreen'
import type { CurrentMatchRecord } from '@/lib/current-match/persistence'
import { currentMatchPersistenceRouteLoaderOptions } from '@/lib/router/current-match-route-flow'

import {
  getOptionalFinishedAt,
  RouteErrorState,
  loadMappedReadyMatchRouteState
} from './-route-utils'

export const Route = createFileRoute('/match/$id')({
  ...currentMatchPersistenceRouteLoaderOptions,
  component: MatchRoute,
  errorComponent: RouteErrorState,
  loader: ({ params }) =>
    loadMappedReadyMatchRouteState(params.id, 'active', (routeState) => ({
      matchId: params.id,
      record: routeState.record
    }))
})

function MatchRoute() {
  const { matchId, record } = Route.useLoaderData()

  return <MatchRouteReadyContent matchId={matchId} record={record} />
}

interface MatchRouteReadyContentProps {
  matchId: string
  record: CurrentMatchRecord
}

function MatchRouteReadyContent({ matchId, record }: MatchRouteReadyContentProps) {
  const { setup, actions, startedAt } = record

  return (
    <ActiveMatchScreen
      matchId={matchId}
      initialSetup={setup}
      initialActions={actions}
      startedAt={startedAt}
      // PBW-68 Item 5 follow-up: both match routes now share the exact optional-prop
      // wrapper so they stay aligned without duplicating the same conditional spread.
      {...getOptionalFinishedAt(record.finishedAt)}
    />
  )
}
