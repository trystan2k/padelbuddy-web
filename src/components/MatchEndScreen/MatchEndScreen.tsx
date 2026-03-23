import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Layout } from '@/components/Layout/Layout'
import { ShareScreen } from '@/components/ShareScreen'
import { TopBar } from '@/components/ui/TopBar'
import type { MatchAction, MatchFormat, MatchProjection, MatchSetup } from '@/core/match'
import { clearCurrentMatch, createCurrentMatchSession } from '@/lib/current-match'
import { cn } from '@/lib/utils/cn'
import { getViewTransitionNavigationOptions } from '@/lib/utils/view-transitions'

import { createMatchEndScreenSummary, getMatchDurationParts } from './view-model'
import { MatchStatsCard } from './MatchStatsCard'
import { MatchSummaryCard } from './MatchSummaryCard'
import { WinnerCard } from './WinnerCard'
import { useMatchEndShare } from './useMatchEndShare'

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

const hiddenScreenStyle = {
  position: 'fixed',
  top: 0,
  left: '-9999px',
  pointerEvents: 'none'
} as const

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
  const { t, i18n } = useTranslation()
  const [isStartingNewMatch, setIsStartingNewMatch] = useState(false)
  const [isContinuingMatch, setIsContinuingMatch] = useState(false)
  const [shareScreenReady, setShareScreenReady] = useState(false)
  const captureRef = useRef<HTMLDivElement | null>(null)

  const summary = useMemo(
    () =>
      createMatchEndScreenSummary({
        projection,
        startedAt,
        ...(typeof finishedAt === 'number' ? { finishedAt } : {})
      }),
    [finishedAt, projection, startedAt]
  )
  const winnerLabel = summary.isFinishedEarly
    ? t('match.end.winner.finishedEarlyLabel')
    : t('match.end.winner.label')
  const winnerName = summary.isFinishedEarly
    ? t('match.end.winner.finishedEarlyName')
    : (summary.winnerName ?? '')

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

  // Formats date using locale-aware Intl.DateTimeFormat
  const dateValue = useMemo(() => {
    if (typeof finishedAt !== 'number') {
      return ''
    }
    return new Intl.DateTimeFormat(i18n.language, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).format(new Date(finishedAt))
  }, [finishedAt, i18n.language])

  // Compute ShareScreen props
  const shareScreenProps = useMemo(() => {
    const winnerTeamId = summary.winnerTeamId ?? 'team-1'
    const loserTeamId = winnerTeamId === 'team-1' ? 'team-2' : 'team-1'
    const winnerNameValue = summary.isFinishedEarly
      ? t('match.end.winner.finishedEarlyName')
      : (summary.winnerName ?? '')
    const loserNameValue = summary.teamNames[loserTeamId]

    return {
      winnerName: winnerNameValue,
      loserName: loserNameValue,
      winnerTeamId,
      formatLabel,
      setRows: summary.setRows.map((row) => ({
        setNumber: row.setNumber,
        team1Games: row.scores['team-1'],
        team2Games: row.scores['team-2']
      })),
      durationValue,
      dateValue
    }
  }, [
    durationValue,
    dateValue,
    formatLabel,
    summary.isFinishedEarly,
    summary.setRows,
    summary.teamNames,
    summary.winnerName,
    summary.winnerTeamId,
    t
  ])

  const shareText = summary.isFinishedEarly
    ? ''
    : t('match.end.share.text', {
        winnerName: summary.winnerName,
        formatLabel,
        durationValue,
        totalGames: summary.totalGames,
        teamOneName: summary.teamNames['team-1'],
        teamTwoName: summary.teamNames['team-2']
      })
  const finishedEarlyShareText = t('match.end.share.textFinishedEarly', {
    formatLabel,
    durationValue,
    totalGames: summary.totalGames,
    teamOneName: summary.teamNames['team-1'],
    teamTwoName: summary.teamNames['team-2']
  })
  const shareActionLabel = t('match.end.actions.share')
  const sharingActionLabel = t('match.end.actions.sharing')
  const handleCaptureComplete = useCallback(() => {
    setShareScreenReady(false)
  }, [])

  const labels = useMemo(
    () => ({
      shareText,
      finishedEarlyShareText,
      errorMessage: t('match.end.share.error'),
      downloadMessage: t('match.end.share.download')
    }),
    [finishedEarlyShareText, shareText, t]
  )
  const { downloadMessage, errorMessage, handleShareClick, isSharing } = useMatchEndShare({
    captureRef,
    finishedAt: finishedAt ?? Date.now(),
    summary,
    labels,
    shareScreenReady,
    onCaptureComplete: handleCaptureComplete
  })

  const handleNewMatch = useCallback(async () => {
    if (isStartingNewMatch) {
      return
    }

    setIsStartingNewMatch(true)

    try {
      await clearCurrentMatch()
      await navigate({ to: '/', ...getViewTransitionNavigationOptions() })
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
        replace: true,
        ...getViewTransitionNavigationOptions()
      })
    } catch (error) {
      console.error('Failed to continue the current match.', error)
      setIsContinuingMatch(false)
    }
  }, [actions, finishedAt, isContinuingMatch, matchId, navigate, router, setup, startedAt])

  const handleShareButtonClick = useCallback(() => {
    handleShareClick()
    setShareScreenReady(true)
  }, [handleShareClick])

  const headerContent = useMemo(
    () => (
      <TopBar
        iconSrc="/icon.png"
        iconAlt=""
        title={t('match.end.header.appName')}
        subtitle={t('match.end.header.subtitle')}
      >
        <button
          type="button"
          className={cn(styles.shareButton)}
          disabled={isSharing}
          aria-busy={isSharing || undefined}
          data-share-button="true"
          data-share-loading={isSharing ? 'true' : 'false'}
          onClick={handleShareButtonClick}
        >
          <ShareIcon />
          <span data-share-label="true">{isSharing ? sharingActionLabel : shareActionLabel}</span>
        </button>
      </TopBar>
    ),
    [handleShareButtonClick, isSharing, shareActionLabel, sharingActionLabel, t]
  )

  const footerContent = useMemo(
    () => <MatchStatsCard durationValue={durationValue} totalGames={summary.totalGames} />,
    [durationValue, summary.totalGames]
  )

  return (
    <>
      {/* ShareScreen is rendered off-screen when share button is clicked, then unmounted after capture */}
      {shareScreenReady && (
        <div aria-hidden="true" style={hiddenScreenStyle}>
          <ShareScreen ref={captureRef} {...shareScreenProps} />
        </div>
      )}

      <div data-testid="match-end-screen">
        <Layout
          className={styles.screen}
          bodyClassName={styles.body ?? ''}
          header={headerContent}
          footer={footerContent}
        >
          <div className={styles.content}>
            <section className={styles.hero} aria-label={t('match.end.aria.summaryRegion')}>
              <WinnerCard
                winnerLabel={winnerLabel}
                winnerName={winnerName}
                {...(summary.winnerTeamId ? { winnerTeamId: summary.winnerTeamId } : {})}
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
      </div>
      {errorMessage ? (
        <p className={cn(styles.shareStatus, styles.shareStatusError)} role="alert">
          {errorMessage}
        </p>
      ) : null}
      <p
        className={cn(styles.shareStatus, !downloadMessage && styles.srOnly)}
        aria-live="polite"
        role="status"
      >
        {downloadMessage ?? ''}
      </p>
    </>
  )
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.shareIcon}
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98" />
      <path d="m15.41 6.51-6.82 3.98" />
    </svg>
  )
}
