import type { MatchGameMode, MatchTeamId } from '@/core/match'

export const verbosityLevels = ['minimal', 'standard', 'verbose'] as const
export type VerbosityLevel = (typeof verbosityLevels)[number]

export const defaultVerbosity: VerbosityLevel = 'standard'

export interface SpeechPreferences {
  muted: boolean
  verbosity: VerbosityLevel
  voiceName: string | null
  updatedAt: string
}

export interface SpeechServiceConfig {
  muted?: boolean
  verbosity?: VerbosityLevel
  onVoiceChange?: (voice: SpeechSynthesisVoice | null) => void
  onError?: (error: Error) => void
}

export interface SpeechService {
  speak(text: string, options?: SpeechOptions): void
  cancel(): void
  getMuted(): boolean
  setMuted(muted: boolean): void
  getVerbosity(): VerbosityLevel
  setVerbosity(level: VerbosityLevel): void
  getVoice(): SpeechSynthesisVoice | null
  isSupported(): boolean
  announce(eventData: Omit<SpeechEventData, 'verbosity'>): void
  destroy(): void
}

export interface SpeechOptions {
  immediate?: boolean // Skip queue, speak immediately
  lang?: string
}

export type SpeechEventType =
  | 'point-scored'
  | 'game-won'
  | 'set-won'
  | 'match-won'
  | 'server-change'

export interface SpeechEventData {
  eventType: SpeechEventType
  team1Score?: number | string
  team2Score?: number | string
  team1Name?: string
  team2Name?: string
  winningTeam?: MatchTeamId
  servingTeam?: MatchTeamId
  servingIndicatorEnabled?: boolean
  isTiebreak?: boolean
  gameMode?: MatchGameMode
  isCorrection?: boolean
  pointPressure?: 'game-point' | 'break-point' | 'set-point' | 'match-point'
  pointPressureTeam?: MatchTeamId
  verbosity: VerbosityLevel
}
