export const verbosityLevels = ['minimal', 'standard', 'verbose'] as const
export type VerbosityLevel = (typeof verbosityLevels)[number]

export const defaultVerbosity: VerbosityLevel = 'standard'

export interface SpeechPreferences {
  muted: boolean
  verbosity: VerbosityLevel
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
  winningTeam?: 'team-1' | 'team-2'
  servingTeam?: 'team-1' | 'team-2'
  isTiebreak?: boolean
  verbosity: VerbosityLevel
}
