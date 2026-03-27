import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { SetupScreen } from '@/components/SetupScreen'
import { CurrentMatchStartupGate } from '@/components/CurrentMatchStartupGate/CurrentMatchStartupGate'
import { useToast } from '@/components/ui/Toast'
import { currentMatchPersistenceRouteLoaderOptions } from '@/lib/router/current-match-route-flow'

import { loadHomeStartup } from './-home-startup'
import { parseMatchRouteErrorType, type MatchRouteErrorType } from './-match-route-state'
import { RouteLoadingState } from './-route-utils'

interface HomeRouteSearch {
  error?: MatchRouteErrorType
}

const homeRouteErrorContent: Record<MatchRouteErrorType, string> = {
  'invalid-match': 'error.invalidMatch.body',
  corrupt: 'error.corruptMatch.body',
  'no-match': 'error.noMatch.body'
}

export const Route = createFileRoute('/')({
  ...currentMatchPersistenceRouteLoaderOptions,
  validateSearch: (search): HomeRouteSearch => {
    const error = parseMatchRouteErrorType(search.error)

    return error ? { error } : {}
  },
  loader: async () => loadHomeStartup(),
  pendingComponent: RouteLoadingState,
  component: HomeRoute
})

export function HomeRoute() {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const { startupState } = Route.useLoaderData()
  const { error } = search
  const { addErrorToast } = useToast()
  const toastShownRef = useRef(false)

  useEffect(() => {
    if (!error || toastShownRef.current) {
      return
    }

    toastShownRef.current = true
    const errorBodyKey = homeRouteErrorContent[error]
    const translatedMessage = t(errorBodyKey)
    addErrorToast(translatedMessage, { timeout: 10000 })
  }, [error, addErrorToast, t])

  return (
    <CurrentMatchStartupGate startupState={startupState}>
      <SetupScreen />
    </CurrentMatchStartupGate>
  )
}
