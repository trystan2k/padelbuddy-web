export { createSpeechService, unlockSpeechEngine, useSpeechService } from './speech-service'
export { formatScoreDisplay, generateSpeechMessage } from './message-generator'
export {
  findVoiceById,
  findVoiceByName,
  getAllVoicesGroupedByLocale,
  getAvailableVoices,
  getDefaultVoiceForLocale,
  getLanguageDisplayName,
  getVoiceId,
  selectVoice
} from './voice-selector'
export {
  clearSpeechPreferences,
  loadSpeechPreferences,
  saveSpeechPreferences
} from '@/lib/setup/setup-storage'
export {
  defaultVerbosity,
  verbosityLevels,
  type SpeechEventData,
  type SpeechEventType,
  type SpeechOptions,
  type SpeechPreferences,
  type SpeechService,
  type SpeechServiceConfig,
  type VerbosityLevel
} from './types'
