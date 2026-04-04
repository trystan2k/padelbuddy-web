import { deriveMatchState } from '@/core/match/derived-state'
import { scorePoint as projectScorePoint } from '@/core/match/engine'
import { matchTeamIds, type MatchProjection, type MatchTeamId } from '@/core/match/types'

import { normalizeScoreValue } from './message-generator'
import type { SpeechEventData } from './types'

export type MatchSpeechEvent = Omit<SpeechEventData, 'verbosity'>

export interface MatchPointPressureContext {
  pressure: SpeechEventData['pointPressure']
  team: MatchTeamId | null
}

export function getCompletedSetCount(projection: MatchProjection): number {
  return projection.state.sets.filter((set) => set.completed).length
}

export function getTotalGamesWon(projection: MatchProjection): Record<MatchTeamId, number> {
  return projection.state.sets.reduce<Record<MatchTeamId, number>>(
    (totals, set) => ({
      'team-1': totals['team-1'] + set.games['team-1'],
      'team-2': totals['team-2'] + set.games['team-2']
    }),
    { 'team-1': 0, 'team-2': 0 }
  )
}

export function getGameWinner(
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

export function getLeadingTeam(projection: MatchProjection): MatchTeamId | null {
  if (projection.derived.scoreDisplay.kind !== 'standard') {
    return null
  }

  const { points } = projection.derived.scoreDisplay
  const team1Score = normalizeScoreValue(points['team-1'])
  const team2Score = normalizeScoreValue(points['team-2'])

  if (projection.setup.gameMode === 'golden-point' && team1Score === '40' && team2Score === '40') {
    return null
  }

  const team1Leads =
    team1Score === 'Ad' || (team1Score === '40' && ['0', '15', '30'].includes(team2Score))
  const team2Leads =
    team2Score === 'Ad' || (team2Score === '40' && ['0', '15', '30'].includes(team1Score))

  if (team1Leads === team2Leads) {
    return null
  }

  return team1Leads ? 'team-1' : 'team-2'
}

export function getPointPressureContext(projection: MatchProjection): MatchPointPressureContext {
  const matchPointTeam = getPressureTeam(projection, 'match')

  if (matchPointTeam) {
    return {
      pressure: 'match-point',
      team: matchPointTeam
    }
  }

  const setPointTeam = getPressureTeam(projection, 'set')

  if (setPointTeam) {
    return {
      pressure: 'set-point',
      team: setPointTeam
    }
  }

  const leadingTeam = getLeadingTeam(projection)

  if (!leadingTeam) {
    return {
      pressure: undefined,
      team: null
    }
  }

  if (!projection.setup.servingIndicatorEnabled) {
    return {
      pressure: 'game-point',
      team: leadingTeam
    }
  }

  return {
    pressure: leadingTeam === projection.derived.servingTeam ? 'game-point' : 'break-point',
    team: null
  }
}

export function getPressureTeam(
  projection: MatchProjection,
  pressureType: 'set' | 'match'
): MatchTeamId | null {
  for (const teamId of matchTeamIds) {
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

export function createPointScoredEvent(
  projection: MatchProjection,
  team1Name: string,
  team2Name: string,
  isCorrection = false
): MatchSpeechEvent | null {
  const { scoreDisplay, servingTeam } = projection.derived

  if (scoreDisplay.kind === null) {
    return null
  }

  const { pressure: pointPressure, team: pointPressureTeam } = getPointPressureContext(projection)

  return {
    eventType: 'point-scored',
    team1Name,
    team2Name,
    team1Score: scoreDisplay.points['team-1'],
    team2Score: scoreDisplay.points['team-2'],
    isTiebreak: scoreDisplay.kind === 'tiebreak',
    gameMode: projection.setup.gameMode,
    isCorrection,
    servingIndicatorEnabled: projection.setup.servingIndicatorEnabled,
    ...(servingTeam === null ? {} : { servingTeam }),
    ...(pointPressure ? { pointPressure } : {}),
    ...(pointPressureTeam ? { pointPressureTeam } : {})
  }
}

export function createSpeechEvent(
  previousProjection: MatchProjection,
  currentProjection: MatchProjection,
  previousActionCount: number,
  currentActionCount: number,
  team1Name: string,
  team2Name: string
): MatchSpeechEvent | null {
  let announcement: MatchSpeechEvent | null = null

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

export const createMatchSpeechEvent = createSpeechEvent
