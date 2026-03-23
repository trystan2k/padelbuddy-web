import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Layout } from '@/components/Layout/Layout'
import { TopBar } from '@/components/ui/TopBar'
import { cn } from '@/lib/utils/cn'
import { getViewTransitionNavigationOptions } from '@/lib/utils/view-transitions'

import type { MatchAction, MatchSetup, MatchTeamId } from '@/core/match'

import { SetsCard } from './SetsCard'
import { SideSwitchPrompt } from './SideSwitchPrompt'
import { TeamPanel } from './TeamPanel'
import { useMatchSession } from './useMatchSession'
import { useMatchTimer } from './useMatchTimer'

import styles from './ActiveMatchScreen.module.css'

export interface ActiveMatchScreenProps {
  matchId: string
  initialSetup: MatchSetup
  initialActions: MatchAction[]
  startedAt: number
  finishedAt?: number
}

export function ActiveMatchScreen({
  matchId,
  initialSetup,
  initialActions,
  startedAt,
  finishedAt
}: ActiveMatchScreenProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [sideSwitchDismissed, setSideSwitchDismissed] = useState(false)

  const { snapshot, scorePoint, undoScoreAction, finishMatch, isLoading } = useMatchSession({
    matchId,
    setup: initialSetup,
    initialActions,
    startedAt,
    ...(typeof finishedAt === 'number' ? { initialFinishedAt: finishedAt } : {})
  })

  const isMatchCompleted =
    snapshot.projection.derived.status === 'completed' || typeof snapshot.finishedAt === 'number'
  const countdownEnabled = snapshot.projection.setup.countdownTimerEnabled
  const { formattedTime } = useMatchTimer({
    startedAt: snapshot.startedAt,
    ...(typeof snapshot.finishedAt === 'number' ? { finishedAt: snapshot.finishedAt } : {}),
    isMatchCompleted,
    countdownEnabled,
    countdownDuration: snapshot.projection.setup.countdownTimerDuration
  })

  const { setup, state, derived } = snapshot.projection
  const team1Side = setup.sides.find((side) => side.id === 'team-1')
  const team2Side = setup.sides.find((side) => side.id === 'team-2')
  const team1Name = team1Side?.playerNames.join(' & ') || 'Team 1'
  const team2Name = team2Side?.playerNames.join(' & ') || 'Team 2'

  const { scoreDisplay, activeSetIndex, sideSwitch, servingTeam } = derived
  const showServingIndicator = setup.servingIndicatorEnabled

  useEffect(() => {
    if (sideSwitch.shouldPrompt) {
      setSideSwitchDismissed(false)
    }
  }, [sideSwitch.shouldPrompt])

  useEffect(() => {
    if (!isMatchCompleted) {
      return
    }

    void navigate({
      to: '/match/finish/$id',
      params: { id: matchId },
      replace: true,
      ...getViewTransitionNavigationOptions()
    })
  }, [isMatchCompleted, matchId, navigate])

  const getTeamScore = (teamId: MatchTeamId): string => {
    if (scoreDisplay.kind === 'standard') {
      return scoreDisplay.points[teamId]
    }
    if (scoreDisplay.kind === 'tiebreak') {
      return String(scoreDisplay.points[teamId])
    }
    return '0'
  }

  const handleScoreTeam1 = useCallback(async () => {
    if (isLoading) {
      return
    }

    await scorePoint('team-1')
  }, [isLoading, scorePoint])

  const handleScoreTeam2 = useCallback(async () => {
    if (isLoading) {
      return
    }

    await scorePoint('team-2')
  }, [isLoading, scorePoint])

  const handleRevert = useCallback(async () => {
    if (isLoading) {
      return
    }

    await undoScoreAction()
  }, [isLoading, undoScoreAction])

  const handleFinish = useCallback(async () => {
    if (isLoading || isMatchCompleted) {
      return
    }

    await finishMatch()
  }, [finishMatch, isLoading, isMatchCompleted])

  const handleSideSwitchClose = useCallback(() => {
    setSideSwitchDismissed(true)
  }, [])

  const shouldShowSideSwitch =
    sideSwitch.shouldPrompt && setup.sideSwitchPrompts && !sideSwitchDismissed
  const timerLabelKey = countdownEnabled ? 'match.timer.countdownLabel' : 'match.timer.label'
  const isUndoDisabled = isLoading || snapshot.actions.length === 0

  const headerContent = useMemo(
    () => (
      <TopBar
        iconSrc="/icon.png"
        iconAlt=""
        title={t('match.header.appName')}
        subtitle={t('match.header.subtitle')}
      >
        <div
          role="timer"
          aria-label={t(timerLabelKey, { time: formattedTime })}
          className={styles.timerChip}
          data-testid="time-chip"
        >
          {formattedTime}
        </div>
      </TopBar>
    ),
    [formattedTime, t, timerLabelKey]
  )

  const footerContent = useMemo(
    () => (
      <button
        type="button"
        className={styles.finishButton}
        onClick={handleFinish}
        disabled={isLoading || isMatchCompleted}
        data-testid="finish-button"
      >
        {t('match.actions.finishMatch')}
      </button>
    ),
    [handleFinish, isLoading, isMatchCompleted, t]
  )

  return (
    <Layout header={headerContent} footer={footerContent}>
      <div className={styles.scorePanel}>
        <div className={styles.teamColumn}>
          <TeamPanel
            teamId="team-1"
            teamName={team1Name}
            score={getTeamScore('team-1')}
            isServing={servingTeam === 'team-1'}
            showServingIndicator={showServingIndicator}
            onClick={handleScoreTeam1}
            disabled={isLoading || isMatchCompleted}
          />
          <button
            type="button"
            className={cn(styles.revertButton, styles.revertButtonTeam1)}
            onClick={handleRevert}
            disabled={isUndoDisabled}
            data-testid="revert-button-team-1"
          >
            {t('match.actions.revertPoint')}
          </button>
        </div>

        <div className={styles.teamColumn}>
          <TeamPanel
            teamId="team-2"
            teamName={team2Name}
            score={getTeamScore('team-2')}
            isServing={servingTeam === 'team-2'}
            showServingIndicator={showServingIndicator}
            onClick={handleScoreTeam2}
            disabled={isLoading || isMatchCompleted}
          />
          <button
            type="button"
            className={cn(styles.revertButton, styles.revertButtonTeam2)}
            onClick={handleRevert}
            disabled={isUndoDisabled}
            data-testid="revert-button-team-2"
          >
            {t('match.actions.revertPoint')}
          </button>
        </div>

        <div className={styles.setsOverlay}>
          <SetsCard sets={state.sets} currentSetIndex={activeSetIndex} />
        </div>
      </div>

      <SideSwitchPrompt
        isOpen={shouldShowSideSwitch}
        reason={sideSwitch.reason}
        onClose={handleSideSwitchClose}
      />
    </Layout>
  )
}
