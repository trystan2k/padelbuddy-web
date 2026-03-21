import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Layout } from '@/components/Layout/Layout'
import { TeamPanel } from './TeamPanel'
import { SetsCard } from './SetsCard'
import { InfoCard } from './InfoCard'
import { SideSwitchPrompt } from './SideSwitchPrompt'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { TopBar } from '@/components/ui/TopBar'
import { useMatchTimer } from './useMatchTimer'
import { useMatchSession } from './useMatchSession'
import { getViewTransitionNavigationOptions } from '@/lib/utils/view-transitions'

import type { MatchAction, MatchSetup, MatchTeamId } from '@/core/match'

import styles from './ActiveMatchScreen.module.css'

export interface ActiveMatchScreenProps {
  matchId: string
  initialSetup: MatchSetup
  initialActions: MatchAction[]
  startedAt: number
  finishedAt?: number
}

/**
 * ActiveMatchScreen component - Main screen for an active match.
 * Follows Pencil design node ID: VSRKf
 * Composed of TeamPanel, SetsCard, InfoCard, Chip (timer), Button-based match controls, SideSwitchPrompt, TopBar
 */
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

  // Session hook
  const { snapshot, scorePoint, undoScoreAction, finishMatch, isLoading } = useMatchSession({
    matchId,
    setup: initialSetup,
    initialActions,
    startedAt,
    ...(typeof finishedAt === 'number' ? { initialFinishedAt: finishedAt } : {})
  })

  // Timer hook
  const isMatchCompleted =
    snapshot.projection.derived.status === 'completed' || typeof snapshot.finishedAt === 'number'
  const { formattedTime } = useMatchTimer({
    startedAt: snapshot.startedAt,
    ...(typeof snapshot.finishedAt === 'number' ? { finishedAt: snapshot.finishedAt } : {}),
    isMatchCompleted
  })

  // Derive data from snapshot
  const { setup, state, derived } = snapshot.projection
  const team1Side = setup.sides.find((side) => side.id === 'team-1')
  const team2Side = setup.sides.find((side) => side.id === 'team-2')
  const team1Name = team1Side?.playerNames.join(' & ') || 'Team 1'
  const team2Name = team2Side?.playerNames.join(' & ') || 'Team 2'

  // Score display
  const { scoreDisplay, activeSetIndex, servingTeam, sideSwitch } = derived

  // Reset dismissed flag when a new side switch prompt appears
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

  // Get score for each team
  const getTeamScore = (teamId: MatchTeamId): string => {
    if (scoreDisplay.kind === 'standard') {
      return scoreDisplay.points[teamId]
    }
    if (scoreDisplay.kind === 'tiebreak') {
      return String(scoreDisplay.points[teamId])
    }
    return '0'
  }

  // Get current games for each team from active set
  const getTeamGames = (teamId: MatchTeamId): number => {
    const activeSet = state.sets[activeSetIndex ?? 0]
    if (activeSet) {
      return activeSet.games[teamId]
    }
    return 0
  }

  // Handlers
  const handleScoreTeam1 = useCallback(async () => {
    if (isLoading) return
    await scorePoint('team-1')
  }, [isLoading, scorePoint])

  const handleScoreTeam2 = useCallback(async () => {
    if (isLoading) return
    await scorePoint('team-2')
  }, [isLoading, scorePoint])

  const handleRevert = useCallback(async () => {
    if (isLoading) return
    await undoScoreAction()
  }, [isLoading, undoScoreAction])

  const handleFinish = useCallback(async () => {
    if (isLoading || isMatchCompleted) return
    await finishMatch()
  }, [finishMatch, isLoading, isMatchCompleted])

  const handleSideSwitchClose = useCallback(() => {
    setSideSwitchDismissed(true)
  }, [])

  // Show side switch prompt when needed (not dismissed)
  const shouldShowSideSwitch =
    sideSwitch.shouldPrompt && setup.sideSwitchPrompts && !sideSwitchDismissed

  // Header content
  const headerContent = useMemo(
    () => (
      <TopBar
        iconSrc="/icon.png"
        iconAlt=""
        title={t('match.header.appName')}
        subtitle={t('match.header.subtitle')}
        showLocaleSelector
      />
    ),
    [t]
  )

  const footerContent = useMemo(
    () => (
      <Button
        className={styles.finishButton}
        variant="outline"
        size="lg"
        onClick={handleFinish}
        disabled={isLoading || isMatchCompleted}
        data-testid="finish-button"
      >
        {t('match.actions.finishMatch')}
      </Button>
    ),
    [handleFinish, isLoading, isMatchCompleted, t]
  )

  return (
    <Layout header={headerContent} footer={footerContent}>
      <div className={styles.scorePanel}>
        {/* Team 1 Panel */}
        <div className={styles.team1Panel}>
          <TeamPanel
            teamId="team-1"
            teamName={team1Name}
            score={getTeamScore('team-1')}
            games={getTeamGames('team-1')}
            isServing={servingTeam === 'team-1'}
            isGoldenPointActive={setup.gameMode === 'golden-point'}
            onClick={handleScoreTeam1}
            disabled={isLoading || isMatchCompleted}
          />
          <Button
            variant="soft"
            size="sm"
            accent="primary"
            className={styles.revertButton}
            onClick={handleRevert}
            disabled={isLoading || snapshot.actions.length === 0}
            data-testid="revert-button-team-1"
          >
            {t('match.actions.revertPoint')}
          </Button>
        </div>

        <div className={styles.setsOverlay}>
          <SetsCard sets={state.sets} currentSetIndex={activeSetIndex} />
        </div>

        <Chip
          readonly
          size="sm"
          role="timer"
          aria-label={t('match.timer.label', { time: formattedTime })}
          className={styles.timerChip ?? ''}
          data-testid="time-chip"
        >
          {formattedTime}
        </Chip>

        <div className={styles.infoOverlay}>
          <InfoCard
            isGoldenPoint={setup.gameMode === 'golden-point'}
            isSuperTiebreak={setup.decidingSetSuperTiebreak}
            sideSwitchPrompts={setup.sideSwitchPrompts}
          />
        </div>

        {/* Team 2 Panel */}
        <div className={styles.team2Panel}>
          <TeamPanel
            teamId="team-2"
            teamName={team2Name}
            score={getTeamScore('team-2')}
            games={getTeamGames('team-2')}
            isServing={servingTeam === 'team-2'}
            isGoldenPointActive={setup.gameMode === 'golden-point'}
            onClick={handleScoreTeam2}
            disabled={isLoading || isMatchCompleted}
          />
          <Button
            variant="soft"
            size="sm"
            accent="secondary"
            className={styles.revertButton}
            onClick={handleRevert}
            disabled={isLoading || snapshot.actions.length === 0}
            data-testid="revert-button-team-2"
          >
            {t('match.actions.revertPoint')}
          </Button>
        </div>
      </div>

      {/* Side Switch Prompt */}
      <SideSwitchPrompt
        isOpen={shouldShowSideSwitch}
        reason={sideSwitch.reason}
        onClose={handleSideSwitchClose}
      />
    </Layout>
  )
}
