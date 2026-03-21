import type { ErrorComponentProps } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Button, Spinner } from '@/components/ui'

export function getErrorMessage(error: unknown): string | null {
  if (error instanceof Error && error.message.length > 0) {
    return error.message
  }

  return null
}

export function RouteLoadingState() {
  const { t } = useTranslation()

  return (
    <main className="appStatusPage">
      <section className="appStatusCard" aria-live="polite" aria-busy="true">
        <Spinner className="appStatusSpinner" size="lg" label={t('common.loading')} />
        <h1 className="appStatusTitle">{t('common.loading')}</h1>
        <p className="appStatusBody">{t('loadingState.routeBody')}</p>
      </section>
    </main>
  )
}

interface RouteErrorStateProps extends ErrorComponentProps {
  eyebrowKey?: string
}

export function RouteErrorState({
  error,
  reset,
  eyebrowKey = 'error.loadMatch'
}: RouteErrorStateProps) {
  const { t } = useTranslation()
  const errorMessage = getErrorMessage(error)

  return (
    <main className="appStatusPage">
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
    </main>
  )
}
