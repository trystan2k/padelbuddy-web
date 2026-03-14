import { i18n } from '@/lib/i18n/i18n'

import type { SpeechEventData, VerbosityLevel } from './types'

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
  const { team1Score, team2Score, team1Name, team2Name, servingTeam, isTiebreak, verbosity } = data

  if (verbosity === 'minimal') {
    return null // No point-by-point in minimal mode
  }

  // For tiebreak, use numeric scores
  if (isTiebreak) {
    return `${team1Score}-${team2Score}`
  }

  if (verbosity === 'standard') {
    return formatStandardScore(String(team1Score), String(team2Score))
  }

  // Verbose
  return formatVerboseScore(
    String(team1Score),
    String(team2Score),
    team1Name ?? 'Team 1',
    team2Name ?? 'Team 2',
    servingTeam
  )
}

function formatStandardScore(score1: string, score2: string): string {
  return `${score1}-${score2}`
}

function formatVerboseScore(
  score1: string,
  score2: string,
  team1Name: string,
  team2Name: string,
  servingTeam?: 'team-1' | 'team-2'
): string {
  const t = i18n.t.bind(i18n)

  const scoreWords: Record<string, string> = {
    '0': t('score.points.0'),
    '15': t('score.points.15'),
    '30': t('score.points.30'),
    '40': t('score.points.40'),
    Ad: t('score.points.Ad')
  }

  const word1 = scoreWords[score1] ?? score1
  const word2 = scoreWords[score2] ?? score2

  // Handle "all" scores (e.g., "15 all")
  if (score1 === score2) {
    return `${word1} all`
  }

  // Include serving information if available
  if (servingTeam) {
    const serverName = servingTeam === 'team-1' ? team1Name : team2Name
    return `${word1} ${word2.toLowerCase()}, ${t('score.announcements.serving')} ${serverName}`
  }

  return `${word1} ${word2}`
}

function generateGameWonMessage(data: SpeechEventData): string {
  const { winningTeam, team1Name, team2Name, verbosity } = data
  const t = i18n.t.bind(i18n)

  const winnerName = winningTeam === 'team-1' ? team1Name : team2Name

  if (verbosity === 'minimal') {
    return t('score.announcements.game')
  }

  return `${t('score.announcements.game')}, ${winnerName}`
}

function generateSetWonMessage(data: SpeechEventData): string {
  const { winningTeam, team1Name, team2Name, verbosity } = data
  const t = i18n.t.bind(i18n)

  const winnerName = winningTeam === 'team-1' ? team1Name : team2Name

  if (verbosity === 'minimal') {
    return t('score.announcements.set')
  }

  return `${t('score.announcements.set')}, ${winnerName}`
}

function generateMatchWonMessage(data: SpeechEventData): string {
  const { winningTeam, team1Name, team2Name, verbosity } = data
  const t = i18n.t.bind(i18n)

  const winnerName = winningTeam === 'team-1' ? team1Name : team2Name

  if (verbosity === 'minimal') {
    return t('score.announcements.match')
  }

  return `${t('score.announcements.match')}, ${winnerName}`
}

function generateServerChangeMessage(data: SpeechEventData): string | null {
  const { servingTeam, team1Name, team2Name, verbosity } = data
  const t = i18n.t.bind(i18n)

  if (verbosity === 'minimal') {
    return null // No server change in minimal mode
  }

  // Defensive guard: ensure servingTeam is valid before accessing team name
  if (!servingTeam) {
    return null
  }

  const serverName = servingTeam === 'team-1' ? team1Name : team2Name

  // Defensive guard: ensure serverName is defined
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

  const t = i18n.t.bind(i18n)

  const scoreWords: Record<string, string> = {
    '0': t('score.points.0'),
    '15': t('score.points.15'),
    '30': t('score.points.30'),
    '40': t('score.points.40'),
    Ad: t('score.points.Ad')
  }

  const word1 = scoreWords[String(score1)] ?? String(score1)
  const word2 = scoreWords[String(score2)] ?? String(score2)

  return `${word1}-${word2}`
}
