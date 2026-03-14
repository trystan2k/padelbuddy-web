import { type SupportedLocale } from '@/lib/i18n/types'

/**
 * Selects the best available voice for the given locale.
 * Priority: locale voice > English voice > null (graceful mute)
 */
export function selectVoice(
  locale: SupportedLocale,
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  // Try to find voice matching locale
  const localeVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith(locale.toLowerCase())
  )

  if (localeVoice) {
    return localeVoice
  }

  // Fallback to English voice
  const englishVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('en'))

  return englishVoice ?? null
}

/**
 * Gets all available voices from the browser's speech synthesis API.
 * Returns a promise that resolves when voices are loaded.
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof speechSynthesis === 'undefined') {
      resolve([])
      return
    }

    const voices = speechSynthesis.getVoices()

    if (voices.length > 0) {
      resolve(voices)
      return
    }

    // Voices might not be loaded yet
    speechSynthesis.onvoiceschanged = () => {
      resolve(speechSynthesis.getVoices())
    }
  })
}

/**
 * Finds a voice by its name.
 */
export function findVoiceByName(
  name: string,
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | undefined {
  return voices.find((voice) => voice.name === name)
}

/**
 * Gets the default voice for a locale, preferring local voices.
 */
export function getDefaultVoiceForLocale(
  locale: SupportedLocale,
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  const localeVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith(locale.toLowerCase())
  )

  if (localeVoices.length === 0) {
    return selectVoice(locale, voices)
  }

  // Prefer local (non-network) voices
  const localVoice = localeVoices.find((voice) => voice.localService)

  return localVoice ?? localeVoices[0] ?? null
}
