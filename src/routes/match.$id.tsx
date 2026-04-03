import { createFileRoute } from '@tanstack/react-router'

import { ActiveMatchScreen } from '@/components/ActiveMatchScreen/ActiveMatchScreen'
import type { CurrentMatchRecord } from '@/lib/current-match/persistence'
import { currentMatchPersistenceRouteLoaderOptions } from '@/lib/router/current-match-route-flow'

import { RouteErrorState, loadReadyMatchRouteState } from './-route-utils'

export const Route = createFileRoute('/match/$id')({
  ...currentMatchPersistenceRouteLoaderOptions,
  component: MatchRoute,
  errorComponent: RouteErrorState,
  loader: async ({ params }) => {
    const routeState = await loadReadyMatchRouteState(params.id, 'active')

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
      {...(typeof record.finishedAt === 'number' ? { finishedAt: record.finishedAt } : {})}
    />
  )
}
