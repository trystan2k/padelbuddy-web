import { createFileRoute } from '@tanstack/react-router'

import { MatchEndScreen } from '@/components/MatchEndScreen/MatchEndScreen'
import type { MatchProjection } from '@/core/match/types'
import type { CurrentMatchRecord } from '@/lib/current-match/persistence'
import { currentMatchPersistenceRouteLoaderOptions } from '@/lib/router/current-match-route-flow'

import { RouteErrorState, loadReadyMatchRouteState } from './-route-utils'

export const Route = createFileRoute('/match/finish/$id')({
  ...currentMatchPersistenceRouteLoaderOptions,
  component: MatchFinishRoute,
  errorComponent: RouteErrorState,
  loader: async ({ params }) => {
    const routeState = await loadReadyMatchRouteState(params.id, 'finish')

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
