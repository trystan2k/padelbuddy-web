import { redirect, type ErrorComponentProps } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button/Button'
import { loadCurrentMatch } from '@/lib/current-match/indexed-db'

import {
  resolveMatchRouteState,
  type MatchRouteMode,
  type MatchRouteState
} from './-match-route-state'

export function getErrorMessage(error: unknown): string | null {
  if (error instanceof Error && error.message.length > 0) {
    const message = error.message
    const isTechnical =
      /[\\]\(.*[\\]\]|IndexedDB|IDB|undefined|TypeError|SyntaxError|fetch|network/i.test(message)

    if (!isTechnical) {
      return message
    }
  }

  return null
}

export function RoutePendingBoundary() {
  return null
}

interface RouteErrorCardProps extends ErrorComponentProps {
  eyebrowKey?: string
}

export function RouteErrorCard({
  error,
  reset,
  eyebrowKey = 'error.loadMatch'
}: RouteErrorCardProps) {
  const { t } = useTranslation()
  const errorMessage = getErrorMessage(error)

  return (
    <section className="appStatusCard" aria-live="assertive">
      <p className="appStatusEyebrow">{t(eyebrowKey)}</p>
      <h1 className="appStatusTitle">{t('error.unexpectedTitle')}</h1>
      <p className="appStatusBody">{t('error.unexpectedBody')}</p>
      {errorMessage ? (
        <p className="appStatusDetail" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className="appStatusActions">
        <Button variant="outline" size="sm" accent="secondary" onClick={reset}>
          {t('common.retry')}
        </Button>
      </div>
    </section>
  )
}

type RouteErrorStateProps = RouteErrorCardProps

export function RouteErrorState(props: RouteErrorStateProps) {
  return (
    <main className="appStatusPage">
      <RouteErrorCard {...props} />
    </main>
  )
}

type ReadyMatchRouteState = Extract<MatchRouteState, { status: 'ready' }>

// PBW-68 Item 5 follow-up: keep the active and finish route loaders on the same
// ready-state mapping path so future redirect/loader changes stay aligned in one place.
export async function loadMappedReadyMatchRouteState<T>(
  matchId: string,
  mode: MatchRouteMode,
  mapReadyState: (routeState: ReadyMatchRouteState) => T
): Promise<T> {
  const routeState = await loadReadyMatchRouteState(matchId, mode)

  return mapReadyState(routeState)
}

// PBW-68 Item 5 follow-up: exactOptionalPropertyTypes means the routes cannot pass
// `finishedAt: undefined`, so this helper keeps the optional prop handling shared too.
export function getOptionalFinishedAt(
  finishedAt: number | undefined
): { finishedAt: number } | Record<string, never> {
  return typeof finishedAt === 'number' ? { finishedAt } : {}
}

export async function loadReadyMatchRouteState(matchId: string, mode: MatchRouteMode) {
  const matchData = await loadCurrentMatch()
  const routeState = resolveMatchRouteState(matchId, matchData, mode)

  switch (routeState.status) {
    case 'redirect-home':
      throw redirect({
        to: '/',
        replace: true,
        search: { error: routeState.error }
      })

    case 'redirect-active':
      throw redirect({
        to: '/match/$id',
        params: { id: routeState.matchId },
        replace: true
      })

    case 'redirect-finish':
      throw redirect({
        to: '/match/finish/$id',
        params: { id: routeState.matchId },
        replace: true
      })

    case 'ready':
      return routeState

    default:
      throw new Error(`Expected ${mode} match route state to be ready after redirect guards.`)
  }
}
