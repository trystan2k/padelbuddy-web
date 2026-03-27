import type { ErrorComponentProps } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Button, TopBar } from '@/components/ui'
import { Layout } from '@/components/Layout'
import { PadelCourtSpinner } from '@/components/PadelCourtSpinner'

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

const HeaderContent = <TopBar iconSrc="/icon.png" iconAlt="Padel Buddy" title="Padel Buddy" />
const LoaderPadelCourt = () => (
  <Layout header={HeaderContent}>
    <PadelCourtSpinner />
  </Layout>
)

export function RouteLoadingState() {
  return <LoaderPadelCourt />
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
