import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Layout } from '@/components/Layout/Layout'
import { TopBar } from '@/components/ui/TopBar'
import {
  createEmptyRemoteControllerBindings,
  loadRemoteControllerBindingsWithFallback,
  useInputHandler,
  type RemoteControllerBindings
} from '@/lib/input'
import { prepareCurrentMatchRouteNavigation } from '@/lib/router/current-match-route-flow'
import { cn } from '@/lib/utils/cn'
import { getViewTransitionNavigationOptions } from '@/lib/utils/view-transitions'

import {
  deriveMatchState,
  scorePoint as projectScorePoint,
  type MatchAction,
  type MatchProjection,
  type MatchSetup,
  type MatchTeamId
} from '@/core/match'
import { normalizeScoreValue } from '@/lib/speech/message-generator'
import { useSpeechService, type SpeechEventData } from '@/lib/speech'

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

function getCompletedSetCount(projection: MatchProjection): number {
  return projection.state.sets.filter((set) => set.completed).length
}

function getTotalGamesWon(projection: MatchProjection): Record<MatchTeamId, number> {
  return projection.state.sets.reduce<Record<MatchTeamId, number>>(
    (totals, set) => ({
      'team-1': totals['team-1'] + set.games['team-1'],
      'team-2': totals['team-2'] + set.games['team-2']
    }),
    { 'team-1': 0, 'team-2': 0 }
  )
}

function getGameWinner(
  previousProjection: MatchProjection,
  currentProjection: MatchProjection
): MatchTeamId | null {
  const previousGamesWon = getTotalGamesWon(previousProjection)
  const currentGamesWon = getTotalGamesWon(currentProjection)

  if (currentGamesWon['team-1'] > previousGamesWon['team-1']) {
    return 'team-1'
  }

  if (currentGamesWon['team-2'] > previousGamesWon['team-2']) {
    return 'team-2'
  }

  return null
}

function getPointPressure(projection: MatchProjection): SpeechEventData['pointPressure'] {
  const matchPointTeam = getPressureTeam(projection, 'match')

  if (matchPointTeam) {
    return 'match-point'
  }

  const setPointTeam = getPressureTeam(projection, 'set')

  if (setPointTeam) {
    return 'set-point'
  }

  if (
    projection.derived.scoreDisplay.kind !== 'standard' ||
    projection.derived.servingTeam === null
  ) {
    return undefined
  }

  const { points } = projection.derived.scoreDisplay
  const team1Score = normalizeScoreValue(points['team-1'])
  const team2Score = normalizeScoreValue(points['team-2'])

  if (projection.setup.gameMode === 'golden-point' && team1Score === '40' && team2Score === '40') {
    return undefined
  }

  const team1Leads =
    team1Score === 'Ad' || (team1Score === '40' && ['0', '15', '30'].includes(team2Score))
  const team2Leads =
    team2Score === 'Ad' || (team2Score === '40' && ['0', '15', '30'].includes(team1Score))

  if (team1Leads === team2Leads) {
    return undefined
  }

  const leadingTeam: MatchTeamId = team1Leads ? 'team-1' : 'team-2'

  return leadingTeam === projection.derived.servingTeam ? 'game-point' : 'break-point'
}

function getPressureTeam(
  projection: MatchProjection,
  pressureType: 'set' | 'match'
): MatchTeamId | null {
  for (const teamId of ['team-1', 'team-2'] as const) {
    const nextState = projectScorePoint(projection.setup, projection.state, teamId)
    const nextDerived = deriveMatchState(projection.setup, nextState)

    if (pressureType === 'match') {
      if (projection.derived.winner === null && nextDerived.winner?.teamId === teamId) {
        return teamId
      }

      continue
    }

    if (nextDerived.setsWon[teamId] > projection.derived.setsWon[teamId]) {
      return teamId
    }
  }

  return null
}

function createPointScoredEvent(
  projection: MatchProjection,
  team1Name: string,
  team2Name: string,
  isCorrection = false
): Omit<SpeechEventData, 'verbosity'> | null {
  const { scoreDisplay, servingTeam } = projection.derived

  if (scoreDisplay.kind === null) {
    return null
  }

  const pointPressure = getPointPressure(projection)
  const pointPressureTeam =
    pointPressure === 'set-point' || pointPressure === 'match-point'
      ? getPressureTeam(projection, pointPressure === 'match-point' ? 'match' : 'set')
      : undefined

  return {
    eventType: 'point-scored',
    team1Name,
    team2Name,
    team1Score: scoreDisplay.points['team-1'],
    team2Score: scoreDisplay.points['team-2'],
    isTiebreak: scoreDisplay.kind === 'tiebreak',
    gameMode: projection.setup.gameMode,
    isCorrection,
    ...(servingTeam === null ? {} : { servingTeam }),
    ...(pointPressure ? { pointPressure } : {}),
    ...(pointPressureTeam ? { pointPressureTeam } : {})
  }
}

function createSpeechEvent(
  previousProjection: MatchProjection,
  currentProjection: MatchProjection,
  previousActionCount: number,
  currentActionCount: number,
  team1Name: string,
  team2Name: string
): Omit<SpeechEventData, 'verbosity'> | null {
  let announcement: Omit<SpeechEventData, 'verbosity'> | null = null

  if (currentActionCount === previousActionCount) {
    announcement = null
  } else if (currentActionCount < previousActionCount) {
    announcement = createPointScoredEvent(currentProjection, team1Name, team2Name, true)
  } else if (
    previousProjection.derived.status !== 'completed' &&
    currentProjection.derived.winner
  ) {
    announcement = {
      eventType: 'match-won',
      team1Name,
      team2Name,
      winningTeam: currentProjection.derived.winner.teamId
    }
  } else if (getCompletedSetCount(currentProjection) > getCompletedSetCount(previousProjection)) {
    let winningTeam: MatchTeamId | null = null

    for (let index = currentProjection.state.sets.length - 1; index >= 0; index -= 1) {
      const set = currentProjection.state.sets[index]

      if (!set || !set.completed) {
        continue
      }

      winningTeam = set.winner
      break
    }

    announcement = winningTeam
      ? {
          eventType: 'set-won',
          team1Name,
          team2Name,
          winningTeam
        }
      : null
  } else {
    const gameWinner = getGameWinner(previousProjection, currentProjection)

    announcement = gameWinner
      ? {
          eventType: 'game-won',
          team1Name,
          team2Name,
          winningTeam: gameWinner
        }
      : createPointScoredEvent(currentProjection, team1Name, team2Name)
  }

  return announcement
}

export function ActiveMatchScreen({
  matchId,
  initialSetup,
  initialActions,
  startedAt,
  finishedAt
}: ActiveMatchScreenProps) {
  const navigate = useNavigate()
  const router = useRouter()
  const { t } = useTranslation()
  const [sideSwitchDismissed, setSideSwitchDismissed] = useState(false)
  const [isNavigatingToFinish, setIsNavigatingToFinish] = useState(false)
  const [remoteBindings, setRemoteBindings] = useState<RemoteControllerBindings>(
    createEmptyRemoteControllerBindings()
  )
  const speechService = useSpeechService()

  const { snapshot, scorePoint, undoScoreAction, undoScoreActionForTeam, finishMatch, isLoading } =
    useMatchSession({
      matchId,
      setup: initialSetup,
      initialActions,
      startedAt,
      ...(typeof finishedAt === 'number' ? { initialFinishedAt: finishedAt } : {})
    })
  const previousProjectionRef = useRef(snapshot.projection)
  const previousActionCountRef = useRef(snapshot.actions.length)
  const hasInitializedSpeechRef = useRef(false)
  const announceSpeechRef = useRef<(event: Omit<SpeechEventData, 'verbosity'>) => void>((event) =>
    speechService.announce(event)
  )
  const cancelRef = useRef<() => void>(() => {})
  const destroySpeechRef = useRef<() => void>(() => {
    speechService.destroy()
  })

  useLayoutEffect(() => {
    announceSpeechRef.current = (event) => {
      speechService.announce(event)
    }
    destroySpeechRef.current = () => {
      speechService.destroy()
    }
    cancelRef.current = () => {
      speechService.cancel()
    }
  }, [speechService])

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
    if (!hasInitializedSpeechRef.current) {
      hasInitializedSpeechRef.current = true
      previousProjectionRef.current = snapshot.projection
      previousActionCountRef.current = snapshot.actions.length

      return
    }

    const announcement = createSpeechEvent(
      previousProjectionRef.current,
      snapshot.projection,
      previousActionCountRef.current,
      snapshot.actions.length,
      team1Name,
      team2Name
    )

    previousProjectionRef.current = snapshot.projection
    previousActionCountRef.current = snapshot.actions.length

    if (!snapshot.projection.setup.audioAnnouncementsEnabled || announcement === null) {
      return
    }

    announceSpeechRef.current(announcement)
  }, [snapshot, team1Name, team2Name])

  useEffect(
    () => () => {
      cancelRef.current()
    },
    []
  )

  useEffect(() => {
    if (sideSwitch.shouldPrompt) {
      setSideSwitchDismissed(false)
    }
  }, [sideSwitch.shouldPrompt])

  useEffect(() => {
    let isMounted = true

    void (async () => {
      try {
        const storedBindings = await loadRemoteControllerBindingsWithFallback()

        if (!isMounted) {
          return
        }

        setRemoteBindings(storedBindings)
      } catch (error) {
        console.error('Failed to load remote controller bindings.', error)

        if (!isMounted) {
          return
        }

        setRemoteBindings(createEmptyRemoteControllerBindings())
      }
    })()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isMatchCompleted || isNavigatingToFinish) {
      return
    }

    setIsNavigatingToFinish(true)

    void (async () => {
      try {
        await prepareCurrentMatchRouteNavigation(
          router,
          {
            to: '/match/finish/$id',
            params: { id: matchId }
          },
          { invalidate: true }
        )
        await navigate({
          to: '/match/finish/$id',
          params: { id: matchId },
          replace: true,
          ...getViewTransitionNavigationOptions()
        })
      } catch (error) {
        console.error('Failed to navigate to the finished match route.', error)
        setIsNavigatingToFinish(false)
      }
    })()
  }, [isMatchCompleted, isNavigatingToFinish, matchId, navigate, router])

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

  const handleRevertTeam1 = useCallback(async () => {
    if (isLoading) {
      return
    }

    await undoScoreActionForTeam('team-1')
  }, [isLoading, undoScoreActionForTeam])

  const handleRevertTeam2 = useCallback(async () => {
    if (isLoading) {
      return
    }

    await undoScoreActionForTeam('team-2')
  }, [isLoading, undoScoreActionForTeam])

  const handleRemoteAdd = useCallback(
    async (teamId: MatchTeamId) => {
      if (isLoading || isMatchCompleted) {
        return
      }

      await scorePoint(teamId)
    },
    [isLoading, isMatchCompleted, scorePoint]
  )

  const handleRemoteUndoForTeam = useCallback(
    async (teamId: MatchTeamId) => {
      if (isLoading || isMatchCompleted) {
        return
      }

      await undoScoreActionForTeam(teamId)
    },
    [isLoading, isMatchCompleted, undoScoreActionForTeam]
  )

  useInputHandler(
    {
      actions: snapshot.actions,
      bindings: remoteBindings,
      enabled: !isMatchCompleted
    },
    {
      onAdd: handleRemoteAdd,
      onUndo: handleRevert,
      onUndoForTeam: handleRemoteUndoForTeam
    }
  )

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
  const canUndoTeam1 = useMemo(
    () =>
      snapshot.actions.some(
        (action) => action.type === 'score-point' && action.teamId === 'team-1'
      ),
    [snapshot.actions]
  )
  const canUndoTeam2 = useMemo(
    () =>
      snapshot.actions.some(
        (action) => action.type === 'score-point' && action.teamId === 'team-2'
      ),
    [snapshot.actions]
  )
  const isUndoTeam1Disabled = isLoading || !canUndoTeam1
  const isUndoTeam2Disabled = isLoading || !canUndoTeam2

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
            onClick={handleRevertTeam1}
            disabled={isUndoTeam1Disabled}
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
            onClick={handleRevertTeam2}
            disabled={isUndoTeam2Disabled}
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
