import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Layout } from '@/components/Layout'
import { TeamPanel } from './TeamPanel'
import { SetsCard } from './SetsCard'
import { InfoCard } from './InfoCard'
import { TimeChip } from './TimeChip'
import { SideSwitchPrompt } from './SideSwitchPrompt'
import { Button, TopBar } from '@/components/ui'
import { useMatchTimer } from './useMatchTimer'
import { useMatchSession } from './useMatchSession'

import type { MatchAction, MatchSetup, MatchTeamId } from '@/core/match'

import styles from './ActiveMatchScreen.module.css'

export interface ActiveMatchScreenProps {
  matchId: string
  initialSetup: MatchSetup
  initialActions: MatchAction[]
  startedAt: number
}

/**
 * ActiveMatchScreen component - Main screen for an active match.
 * Follows Pencil design node ID: VSRKf
 * Composed of TeamPanel, SetsCard, InfoCard, TimeChip, RevertButton, FinishButton, SideSwitchPrompt, TopBar
 */
export function ActiveMatchScreen({
  matchId: _matchId,
  initialSetup,
  initialActions,
  startedAt
}: ActiveMatchScreenProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [sideSwitchDismissed, setSideSwitchDismissed] = useState(false)

  // Session hook
  const { snapshot, scorePoint, undoScoreAction, isLoading } = useMatchSession({
    setup: initialSetup,
    initialActions,
    startedAt
  })

  // Timer hook
  const isMatchCompleted = snapshot.projection.derived.status === 'completed'
  const { formattedTime } = useMatchTimer({
    startedAt,
    isMatchCompleted
  })

  // Derive data from snapshot
  const { setup, state, derived } = snapshot.projection
  const team1Side = setup.sides.find((side) => side.id === 'team-1')
  const team2Side = setup.sides.find((side) => side.id === 'team-2')
  const team1Name = team1Side?.playerNames.join(' & ') || 'Team 1'
  const team2Name = team2Side?.playerNames.join(' & ') || 'Team 2'

  // Score display
  const { scoreDisplay, activeSetIndex, servingTeam, sideSwitch, winner } = derived

  // Reset dismissed flag when a new side switch prompt appears
  useEffect(() => {
    if (sideSwitch.shouldPrompt) {
      setSideSwitchDismissed(false)
    }
  }, [sideSwitch.shouldPrompt])

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
    if (isLoading) return
    // For now, navigate back to home
    await navigate({ to: '/' })
  }, [isLoading, navigate])

  const handleSideSwitchConfirm = useCallback(() => {
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

  // Footer content
  const footerContent = useMemo(
    () => (
      <Button
        variant="outline"
        size="lg"
        onClick={handleFinish}
        disabled={isLoading || !winner}
        testId="finish-button"
      >
        {t('match.actions.finishMatch')}
      </Button>
    ),
    [handleFinish, isLoading, winner, t]
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
            onClick={handleRevert}
            disabled={isLoading || snapshot.actions.length === 0}
            testId="revert-button-team-1"
          >
            {t('match.actions.revertPoint')}
          </Button>
        </div>

        {/* Center column: Sets, Info, Time */}
        <div className={styles.centerColumn}>
          <SetsCard sets={state.sets} currentSetIndex={activeSetIndex} />
          <InfoCard
            isGoldenPoint={setup.gameMode === 'golden-point'}
            isSuperTiebreak={setup.decidingSetSuperTiebreak}
            sideSwitchPrompts={setup.sideSwitchPrompts}
          />
          <TimeChip formattedTime={formattedTime} />
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
            onClick={handleRevert}
            disabled={isLoading || snapshot.actions.length === 0}
            testId="revert-button-team-2"
          >
            {t('match.actions.revertPoint')}
          </Button>
        </div>
      </div>

      {/* Side Switch Prompt */}
      <SideSwitchPrompt
        isOpen={shouldShowSideSwitch}
        reason={sideSwitch.reason}
        onConfirm={handleSideSwitchConfirm}
      />
    </Layout>
  )
}
