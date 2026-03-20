import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Layout } from '@/components/Layout/Layout'
import { TopBar } from '@/components/ui/TopBar'
import type { MatchAction, MatchFormat, MatchProjection, MatchSetup } from '@/core/match'
import { clearCurrentMatch, createCurrentMatchSession } from '@/lib/current-match'

import { createMatchEndScreenSummary, getMatchDurationParts } from './view-model'
import { MatchStatsCard } from './MatchStatsCard'
import { MatchSummaryCard } from './MatchSummaryCard'
import { WinnerCard } from './WinnerCard'

import styles from './MatchEndScreen.module.css'

export interface MatchEndScreenProps {
  matchId: string
  setup: MatchSetup
  actions: MatchAction[]
  projection: MatchProjection
  startedAt: number
  finishedAt?: number
}

const formatTranslationKeys: Record<MatchFormat, 'bestOf1' | 'bestOf3' | 'bestOf5'> = {
  'best-of-1': 'bestOf1',
  'best-of-3': 'bestOf3',
  'best-of-5': 'bestOf5'
}

const activeMatchRouteId = '/match/$id'

export function MatchEndScreen({
  matchId,
  setup,
  actions,
  projection,
  startedAt,
  finishedAt
}: MatchEndScreenProps) {
  const navigate = useNavigate()
  const router = useRouter()
  const { t } = useTranslation()
  const [isStartingNewMatch, setIsStartingNewMatch] = useState(false)
  const [isContinuingMatch, setIsContinuingMatch] = useState(false)

  const summary = useMemo(
    () =>
      createMatchEndScreenSummary({
        projection,
        startedAt,
        ...(typeof finishedAt === 'number' ? { finishedAt } : {})
      }),
    [finishedAt, projection, startedAt]
  )

  const formatLabel = t(`setup.format.${formatTranslationKeys[summary.format]}`)
  const durationParts = getMatchDurationParts(summary.elapsedSeconds)
  const durationValue =
    durationParts.hours > 0
      ? t('match.end.stats.durationHoursMinutes', {
          hours: durationParts.hours,
          minutes: durationParts.minutes
        })
      : t('match.end.stats.durationMinutes', {
          minutes: durationParts.minutes
        })

  const handleNewMatch = useCallback(async () => {
    if (isStartingNewMatch) {
      return
    }

    setIsStartingNewMatch(true)

    try {
      await clearCurrentMatch()
      await navigate({ to: '/' })
    } catch (error) {
      console.error('Failed to clear the current match before starting a new one.', error)
      setIsStartingNewMatch(false)
    }
  }, [isStartingNewMatch, navigate])

  const handleContinue = useCallback(async () => {
    if (isContinuingMatch) {
      return
    }

    setIsContinuingMatch(true)

    try {
      const session = createCurrentMatchSession({
        matchId,
        setup,
        actions,
        startedAt,
        ...(typeof finishedAt === 'number' ? { finishedAt } : {})
      })

      await session.continuePlaying()
      router.clearCache({
        filter: (routeMatch) =>
          routeMatch.routeId === activeMatchRouteId && routeMatch.params.id === matchId
      })
      await navigate({
        to: '/match/$id',
        params: { id: matchId },
        replace: true
      })
    } catch (error) {
      console.error('Failed to continue the current match.', error)
      setIsContinuingMatch(false)
    }
  }, [actions, finishedAt, isContinuingMatch, matchId, navigate, router, setup, startedAt])

  const headerContent = useMemo(
    () => (
      <TopBar
        iconSrc="/icon.png"
        iconAlt=""
        title={t('match.end.header.appName')}
        subtitle={t('match.end.header.subtitle')}
        showLocaleSelector
      />
    ),
    [t]
  )

  const footerContent = useMemo(
    () => <MatchStatsCard durationValue={durationValue} totalGames={summary.totalGames} />,
    [durationValue, summary.totalGames]
  )

  return (
    <Layout header={headerContent} footer={footerContent} bodyClassName={styles.body ?? ''}>
      <div className={styles.content} data-testid="match-end-screen">
        <section className={styles.hero} aria-label={t('match.end.aria.summaryRegion')}>
          <WinnerCard
            winnerName={summary.winnerName}
            winnerTeamId={summary.winnerTeamId}
            isStartingNewMatch={isStartingNewMatch}
            isContinuingMatch={isContinuingMatch}
            onNewMatch={handleNewMatch}
            onContinue={handleContinue}
          />

          <MatchSummaryCard
            formatLabel={formatLabel}
            teamNames={summary.teamNames}
            setRows={summary.setRows}
          />
        </section>
      </div>
    </Layout>
  )
}
