import type { CountdownTimerDuration, MatchFormat, MatchGameMode, MatchTeamId } from '@/core/match'

export interface SetupFormData {
  team1Name: string
  team2Name: string
  format: MatchFormat
  gameMode: MatchGameMode
  initialServer: MatchTeamId
  decidingSetSuperTiebreak: boolean
  audioAnnouncementsEnabled: boolean
  voiceName: string | null
  servingIndicatorEnabled: boolean
  countdownTimerEnabled: boolean
  countdownTimerDuration: CountdownTimerDuration
  sideSwitchPrompts: boolean
}

export interface FieldErrors {
  team1Name?: string
  team2Name?: string
  format?: string
  initialServer?: string
  countdownTimerDuration?: string
}
