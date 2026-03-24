import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { SetupScreen } from '@/components/SetupScreen'
import { CurrentMatchStartupGate } from '@/components/CurrentMatchStartupGate/CurrentMatchStartupGate'
import { useToast } from '@/components/ui/Toast'

import { parseMatchRouteErrorType, type MatchRouteErrorType } from './-match-route-state'

interface HomeRouteSearch {
  error?: MatchRouteErrorType
}

const homeRouteErrorContent: Record<MatchRouteErrorType, string> = {
  'invalid-match': 'error.invalidMatch.body',
  corrupt: 'error.corruptMatch.body',
  'no-match': 'error.noMatch.body'
}

export const Route = createFileRoute('/')({
  validateSearch: (search): HomeRouteSearch => {
    const error = parseMatchRouteErrorType(search.error)

    return error ? { error } : {}
  },
  component: HomeRoute
})

export function HomeRoute() {
  const { t } = useTranslation()
  const search = Route.useSearch()
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
    addErrorToast(translatedMessage, { timeout: 10_000 })
  }, [error, addErrorToast, t])

  return (
    <CurrentMatchStartupGate>
      <SetupScreen />
    </CurrentMatchStartupGate>
  )
}
