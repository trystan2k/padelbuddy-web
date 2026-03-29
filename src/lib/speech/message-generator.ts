import { i18n } from '@/lib/i18n/i18n'

import type { SpeechEventData, VerbosityLevel } from './types'

export function normalizeScoreValue(score: number | string): string {
  if (typeof score === 'number') {
    return String(score)
  }

  const trimmed = score.trim()

  return trimmed.toLowerCase() === 'ad' ? 'Ad' : trimmed
}

function getScoreWord(score: number | string): string {
  const t = i18n.t.bind(i18n)
  const normalizedScore = normalizeScoreValue(score)

  const scoreWords: Record<string, string> = {
    '0': t('score.points.0'),
    '15': t('score.points.15'),
    '30': t('score.points.30'),
    '40': t('score.points.40'),
    Ad: t('score.points.Ad')
  }

  return scoreWords[normalizedScore] ?? String(score)
}

function formatChairUmpireScore(
  team1Score: number | string,
  team2Score: number | string,
  gameMode: SpeechEventData['gameMode']
): string {
  const t = i18n.t.bind(i18n)
  const team1Word = getScoreWord(team1Score)
  const team2Word = getScoreWord(team2Score)

  // Compare raw score values (not translated words) to detect deuce/golden point
  // This works correctly across all locales
  const rawTeam1 = typeof team1Score === 'number' ? team1Score : parseInt(String(team1Score), 10)
  const rawTeam2 = typeof team2Score === 'number' ? team2Score : parseInt(String(team2Score), 10)

  if (rawTeam1 === 40 && rawTeam2 === 40) {
    return gameMode === 'golden-point'
      ? t('score.announcements.goldenPoint')
      : t('score.announcements.deuce')
  }

  if (team1Word === team2Word) {
    return `${team1Word} - ${t('score.announcements.all')}`
  }

  return `${team1Word} - ${team2Word}`
}

function getPointPressureMessage(data: SpeechEventData): string | null {
  const t = i18n.t.bind(i18n)

  if (
    (data.pointPressure === 'set-point' || data.pointPressure === 'match-point') &&
    data.pointPressureTeam
  ) {
    const pointPressureTeamName =
      data.pointPressureTeam === 'team-1' ? data.team1Name : data.team2Name

    if (!pointPressureTeamName) {
      return null
    }

    return data.pointPressure === 'match-point'
      ? t('score.announcements.matchPoint', { teamName: pointPressureTeamName })
      : t('score.announcements.setPoint', { teamName: pointPressureTeamName })
  }

  if (data.pointPressure === 'break-point') {
    return t('score.announcements.breakPoint')
  }

  if (data.pointPressure === 'game-point') {
    // Prefer pointPressureTeam when present (e.g. when serving indicator is disabled)
    // Fall back to servingTeam only when pointPressureTeam is not set
    const teamName = data.pointPressureTeam
      ? data.pointPressureTeam === 'team-1'
        ? data.team1Name
        : data.team2Name
      : data.servingTeam
        ? data.servingTeam === 'team-1'
          ? data.team1Name
          : data.team2Name
        : null

    if (!teamName) {
      return null
    }

    return t('score.announcements.gamePoint', { teamName })
  }

  return null
}

function withCorrectionPrefix(message: string, isCorrection?: boolean): string {
  if (!isCorrection) {
    return message
  }

  return `${i18n.t('score.announcements.correction')} ${message}`
}

/**
 * Generates a speech message based on the event data and verbosity level.
 * Returns null if the event should not be announced at the current verbosity.
 */
export function generateSpeechMessage(data: SpeechEventData): string | null {
  const { eventType } = data

  switch (eventType) {
    case 'point-scored':
      return generatePointScoreMessage(data)
    case 'game-won':
      return generateGameWonMessage(data)
    case 'set-won':
      return generateSetWonMessage(data)
    case 'match-won':
      return generateMatchWonMessage(data)
    case 'server-change':
      return generateServerChangeMessage(data)
    default:
      return null
  }
}

function generatePointScoreMessage(data: SpeechEventData): string | null {
  const { team1Score, team2Score, isTiebreak, verbosity, gameMode, servingTeam } = data

  if (verbosity === 'minimal') {
    return null
  }

  if (
    team1Score === undefined ||
    team1Score === null ||
    team2Score === undefined ||
    team2Score === null
  ) {
    return null
  }

  const pointPressureMessage = getPointPressureMessage(data)

  if (isTiebreak) {
    const baseMessage = `${team1Score}-${team2Score}`

    return withCorrectionPrefix(
      pointPressureMessage ? `${baseMessage}. ${pointPressureMessage}` : baseMessage,
      data.isCorrection
    )
  }

  const score1 = servingTeam === 'team-2' ? team2Score : team1Score
  const score2 = servingTeam === 'team-2' ? team1Score : team2Score
  const baseMessage = formatChairUmpireScore(score1, score2, gameMode)

  return withCorrectionPrefix(
    pointPressureMessage ? `${baseMessage}. ${pointPressureMessage}` : baseMessage,
    data.isCorrection
  )
}

function generateGameWonMessage(data: SpeechEventData): string {
  const { winningTeam, team1Name, team2Name, verbosity } = data
  const t = i18n.t.bind(i18n)

  if (!winningTeam || (winningTeam !== 'team-1' && winningTeam !== 'team-2')) {
    return t('score.announcements.game')
  }

  const winnerName = winningTeam === 'team-1' ? team1Name : team2Name

  if (verbosity === 'minimal' || !winnerName) {
    return t('score.announcements.game')
  }

  return `${t('score.announcements.game')}, ${winnerName}`
}

function generateSetWonMessage(data: SpeechEventData): string {
  const { winningTeam, team1Name, team2Name, verbosity } = data
  const t = i18n.t.bind(i18n)

  if (!winningTeam || (winningTeam !== 'team-1' && winningTeam !== 'team-2')) {
    return t('score.announcements.set')
  }

  const winnerName = winningTeam === 'team-1' ? team1Name : team2Name

  if (verbosity === 'minimal' || !winnerName) {
    return t('score.announcements.set')
  }

  return `${t('score.announcements.set')}, ${winnerName}`
}

function generateMatchWonMessage(data: SpeechEventData): string {
  const { winningTeam, team1Name, team2Name, verbosity } = data
  const t = i18n.t.bind(i18n)

  if (!winningTeam || (winningTeam !== 'team-1' && winningTeam !== 'team-2')) {
    return t('score.announcements.match')
  }

  const winnerName = winningTeam === 'team-1' ? team1Name : team2Name

  if (verbosity === 'minimal' || !winnerName) {
    return t('score.announcements.match')
  }

  return `${t('score.announcements.match')}, ${winnerName}`
}

function generateServerChangeMessage(data: SpeechEventData): string | null {
  const { servingTeam, team1Name, team2Name, verbosity } = data
  const t = i18n.t.bind(i18n)

  if (verbosity === 'minimal') {
    return null
  }

  if (!servingTeam) {
    return null
  }

  const serverName = servingTeam === 'team-1' ? team1Name : team2Name

  if (!serverName) {
    return null
  }

  return `${t('score.announcements.serving')} ${serverName}`
}

/**
 * Helper to format score for display (not speech).
 */
export function formatScoreDisplay(
  score1: number | string,
  score2: number | string,
  verbosity: VerbosityLevel
): string {
  if (verbosity === 'minimal') {
    return `${score1}-${score2}`
  }

  return `${getScoreWord(score1)}-${getScoreWord(score2)}`
}
