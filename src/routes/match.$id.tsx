import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { ActiveMatchScreen } from '@/components/ActiveMatchScreen'
import { loadCurrentMatch, type CurrentMatchLoadResult } from '@/lib/current-match'

import { resolveMatchRouteState } from './-match-route-state'

export const Route = createFileRoute('/match/$id')({
  component: MatchRoute,
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
  const { t } = useTranslation()
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
      void navigate({ to: '/' })
      return
    }

    if (routeStateStatus === 'redirect-finish' && redirectMatchId !== null) {
      void navigate({
        to: '/match/finish/$id',
        params: { id: redirectMatchId },
        replace: true
      })
      return
    }
  }, [corruptMessage, navigate, redirectMatchId, routeStateStatus])

  if (routeStateStatus !== 'ready') {
    return (
      <main>
        <p>{t('common.loading')}</p>
      </main>
    )
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
