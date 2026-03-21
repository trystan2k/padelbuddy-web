import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { SetupScreen } from '@/components/SetupScreen'
import { CurrentMatchStartupGate } from '@/components/CurrentMatchStartupGate/CurrentMatchStartupGate'
import { Button } from '@/components/ui'

import { parseMatchRouteErrorType, type MatchRouteErrorType } from './-match-route-state'
import styles from './index.module.css'

interface HomeRouteSearch {
  error?: MatchRouteErrorType
}

const homeRouteErrorContent: Record<
  MatchRouteErrorType,
  {
    titleKey: string
    bodyKey: string
  }
> = {
  'invalid-match': {
    titleKey: 'error.invalidMatch.title',
    bodyKey: 'error.invalidMatch.body'
  },
  corrupt: {
    titleKey: 'error.corruptMatch.title',
    bodyKey: 'error.corruptMatch.body'
  },
  'no-match': {
    titleKey: 'error.noMatch.title',
    bodyKey: 'error.noMatch.body'
  }
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
  const navigate = useNavigate()
  const { error } = Route.useSearch()
  const noticeRef = useRef<HTMLElement | null>(null)

  const handleDismissError = useCallback(() => {
    void navigate({
      to: '/',
      replace: true,
      search: {}
    })
  }, [navigate])

  useEffect(() => {
    if (!error) {
      return
    }

    noticeRef.current?.focus()
  }, [error])

  const errorContent = error ? homeRouteErrorContent[error] : null

  if (errorContent) {
    return (
      <>
        <aside className={styles.notice} role="status" tabIndex={-1} ref={noticeRef}>
          <div className={styles.noticeCopy}>
            <p className={styles.noticeTitle}>{t(errorContent.titleKey)}</p>
            <p className={styles.noticeText}>{t(errorContent.bodyKey)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleDismissError}>
            {t('common.dismiss')}
          </Button>
        </aside>
        <CurrentMatchStartupGate>
          <SetupScreen />
        </CurrentMatchStartupGate>
      </>
    )
  }

  return (
    <CurrentMatchStartupGate>
      <SetupScreen />
    </CurrentMatchStartupGate>
  )
}
