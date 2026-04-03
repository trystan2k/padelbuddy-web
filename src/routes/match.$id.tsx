import { createFileRoute, redirect } from '@tanstack/react-router'

import { ActiveMatchScreen } from '@/components/ActiveMatchScreen/ActiveMatchScreen'
import { loadCurrentMatch } from '@/lib/current-match/indexed-db'
import type { CurrentMatchRecord } from '@/lib/current-match/persistence'
import { currentMatchPersistenceRouteLoaderOptions } from '@/lib/router/current-match-route-flow'

import { resolveMatchRouteState } from './-match-route-state'
import { RouteErrorState } from './-route-utils'

export const Route = createFileRoute('/match/$id')({
  ...currentMatchPersistenceRouteLoaderOptions,
  component: MatchRoute,
  errorComponent: RouteErrorState,
  loader: async ({ params }) => {
    const matchData = await loadCurrentMatch()
    const routeState = resolveMatchRouteState(params.id, matchData, 'active')

    if (routeState.status === 'redirect-home') {
      throw redirect({
        to: '/',
        replace: true,
        search: { error: routeState.error }
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
