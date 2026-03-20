import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { MatchEndScreen } from '@/components/MatchEndScreen'
import { loadCurrentMatch, type CurrentMatchLoadResult } from '@/lib/current-match'

import { resolveMatchRouteState } from './-match-route-state'

export const Route = createFileRoute('/match/finish/$id')({
  component: MatchFinishRoute,
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
  const { t } = useTranslation()
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
      void navigate({ to: '/' })
      return
    }

    if (routeStateStatus === 'redirect-active' && redirectMatchId !== null) {
      void navigate({
        to: '/match/$id',
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
