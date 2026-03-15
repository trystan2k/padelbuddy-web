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
 * @param signal - Optional AbortSignal to cancel the operation
 */
export function getAvailableVoices(signal?: AbortSignal): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Operation aborted'))
      return
    }

    if (typeof speechSynthesis === 'undefined') {
      resolve([])
      return
    }

    const voices = speechSynthesis.getVoices()

    if (voices.length > 0) {
      resolve(voices)
      return
    }

    let settled = false

    const cleanup = () => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged)
      signal?.removeEventListener('abort', handleAbort)
    }

    const handleVoicesChanged = () => {
      cleanup()
      resolve(speechSynthesis.getVoices())
    }

    const handleAbort = () => {
      cleanup()
      reject(new Error('Operation aborted'))
    }

    const timeout = setTimeout(() => {
      cleanup()
      resolve([])
    }, 3000)

    speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged)
    signal?.addEventListener('abort', handleAbort)
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
