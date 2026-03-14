import { useCallback, useEffect, useRef, useState } from 'react'

import { i18n } from '@/lib/i18n/i18n'
import { defaultLocale, supportedLocales, type SupportedLocale } from '@/lib/i18n/types'

import { generateSpeechMessage } from './message-generator'
import { loadSpeechPreferences, saveSpeechPreferences } from './speech-storage'
import {
  defaultVerbosity,
  type SpeechEventData,
  type SpeechOptions,
  type SpeechService,
  type SpeechServiceConfig,
  type VerbosityLevel
} from './types'
import { getAvailableVoices, selectVoice } from './voice-selector'

/**
 * Safely extracts a valid SupportedLocale from i18n.language.
 * Falls back to defaultLocale if the language is not supported.
 */
function getSafeLocale(language: string | undefined): SupportedLocale {
  if (typeof language !== 'string') {
    return defaultLocale
  }

  // Check if the language is in the supported locales array
  for (const locale of supportedLocales) {
    if (locale === language) {
      return locale
    }
  }

  return defaultLocale
}

/**
 * React hook for speech synthesis with queue management and persistence.
 */
export function useSpeechService(config: SpeechServiceConfig = {}): SpeechService {
  const [muted, setMutedState] = useState(config.muted ?? false)
  const [verbosity, setVerbosityState] = useState<VerbosityLevel>(
    config.verbosity ?? defaultVerbosity
  )
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([])
  const isSpeakingRef = useRef(false)
  const initializedRef = useRef(false)

  const onErrorRef = useRef(config.onError)
  const onVoiceChangeRef = useRef(config.onVoiceChange)

  useEffect(() => {
    onErrorRef.current = config.onError
    onVoiceChangeRef.current = config.onVoiceChange
  })

  // Initialize from storage and load voices
  useEffect(() => {
    const abortController = new AbortController()
    const { signal } = abortController

    async function initialize() {
      if (initializedRef.current) return
      initializedRef.current = true

      try {
        const prefs = await loadSpeechPreferences()

        if (signal.aborted) return

        if (prefs) {
          setMutedState(prefs.muted)
          setVerbosityState(prefs.verbosity)
        }
      } catch (error) {
        if (!signal.aborted) {
          onErrorRef.current?.(
            error instanceof Error ? error : new Error('Failed to load speech preferences')
          )
        }
      }

      if (typeof speechSynthesis === 'undefined') {
        setMutedState(true)
        onErrorRef.current?.(new Error('Speech synthesis is not supported'))
        return
      }

      try {
        const voices = await getAvailableVoices(signal)
        const currentLocale = getSafeLocale(i18n.language)
        const selectedVoice = selectVoice(currentLocale, voices)

        if (!signal.aborted) {
          setVoice(selectedVoice)
          onVoiceChangeRef.current?.(selectedVoice)

          if (!selectedVoice) {
            onErrorRef.current?.(new Error('No suitable voice found'))
          }
        }
      } catch {
        // Operation was aborted or failed - ignore
      }
    }

    void initialize()

    return () => {
      abortController.abort()
    }
  }, [])

  // Update voice when locale changes
  useEffect(() => {
    const abortController = new AbortController()
    const { signal } = abortController

    async function updateVoice() {
      if (typeof speechSynthesis === 'undefined' || signal.aborted) return

      try {
        const voices = await getAvailableVoices(signal)
        if (signal.aborted) return
        const currentLocale = getSafeLocale(i18n.language)
        const selectedVoice = selectVoice(currentLocale, voices)
        setVoice(selectedVoice)
        onVoiceChangeRef.current?.(selectedVoice)
      } catch {
        // Operation was aborted or failed - ignore
      }
    }

    void updateVoice()

    const handleLanguageChanged = () => {
      void updateVoice()
    }

    i18n.on('languageChanged', handleLanguageChanged)
    return () => {
      abortController.abort()
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [])

  const processQueue = useCallback(() => {
    if (isSpeakingRef.current || utteranceQueueRef.current.length === 0) {
      return
    }

    const utterance = utteranceQueueRef.current.shift()
    if (utterance && typeof speechSynthesis !== 'undefined') {
      isSpeakingRef.current = true
      speechSynthesis.speak(utterance)
    }
  }, [])

  const speak = useCallback(
    (text: string, options?: SpeechOptions) => {
      if (muted || !voice || !text) {
        return
      }

      if (typeof speechSynthesis === 'undefined') {
        return
      }

      // Cancel any queued utterances (rapid score change handling)
      if (options?.immediate) {
        speechSynthesis.cancel()
        utteranceQueueRef.current = []
        isSpeakingRef.current = false
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = voice
      utterance.rate = 1.0
      utterance.pitch = 1.0

      utterance.addEventListener('end', () => {
        isSpeakingRef.current = false
        processQueue()
      })

      utterance.addEventListener('error', (event) => {
        isSpeakingRef.current = false
        onErrorRef.current?.(new Error(`Speech error: ${event.error}`))
        processQueue()
      })

      utteranceQueueRef.current.push(utterance)

      if (!isSpeakingRef.current) {
        processQueue()
      }
    },
    [muted, voice, processQueue]
  )

  const cancel = useCallback(() => {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel()
    }
    utteranceQueueRef.current = []
    isSpeakingRef.current = false
  }, [])

  // Issue 4: Handle saveSpeechPreferences rejections
  const setMuted = useCallback(
    (newMuted: boolean) => {
      setMutedState(newMuted)
      saveSpeechPreferences({
        muted: newMuted,
        verbosity,
        updatedAt: new Date().toISOString()
      }).catch((error) => {
        onErrorRef.current?.(
          error instanceof Error ? error : new Error('Failed to save speech preferences')
        )
      })

      if (newMuted) {
        cancel()
      }
    },
    [verbosity, cancel]
  )

  // Issue 4: Handle saveSpeechPreferences rejections
  const setVerbosity = useCallback(
    (level: VerbosityLevel) => {
      setVerbosityState(level)
      saveSpeechPreferences({
        muted,
        verbosity: level,
        updatedAt: new Date().toISOString()
      }).catch((error) => {
        onErrorRef.current?.(
          error instanceof Error ? error : new Error('Failed to save speech preferences')
        )
      })
    },
    [muted]
  )

  const announce = useCallback(
    (eventData: Omit<SpeechEventData, 'verbosity'>) => {
      const message = generateSpeechMessage({
        ...eventData,
        verbosity
      })

      if (message) {
        speak(message, { immediate: true })
      }
    },
    [verbosity, speak]
  )

  return {
    speak,
    cancel,
    getMuted: () => muted,
    setMuted,
    getVerbosity: () => verbosity,
    setVerbosity,
    getVoice: () => voice,
    isSupported: () => typeof speechSynthesis !== 'undefined',
    announce,
    destroy: () => {
      // Cancel any ongoing speech and prevent further speaking
      cancel()
    }
  }
}

/**
 * Non-hook version for use outside of React components.
 * Does not support persistence - use for one-off announcements.
 * IMPORTANT: Call destroy() when done to clean up event listeners.
 */
export function createSpeechService(config: SpeechServiceConfig = {}): SpeechService {
  let muted = config.muted ?? false
  let verbosity = config.verbosity ?? defaultVerbosity
  let currentVoice: SpeechSynthesisVoice | null = null
  const utteranceQueue: SpeechSynthesisUtterance[] = []
  let isSpeaking = false
  let destroyed = false
  const abortController = new AbortController()
  const { signal } = abortController

  const handleLanguageChanged = async () => {
    if (destroyed || signal.aborted) return
    try {
      const voices = await getAvailableVoices(signal)
      if (signal.aborted) return
      currentVoice = selectVoice(getSafeLocale(i18n.language), voices)
      config.onVoiceChange?.(currentVoice)
    } catch {
      // Operation was aborted or failed - ignore
    }
  }

  // Initialize voice
  if (typeof speechSynthesis !== 'undefined') {
    void (async () => {
      if (destroyed || signal.aborted) return
      try {
        const voices = await getAvailableVoices(signal)
        if (signal.aborted) return
        currentVoice = selectVoice(getSafeLocale(i18n.language), voices)
        config.onVoiceChange?.(currentVoice)
      } catch {
        // Operation was aborted or failed - ignore
      }
    })()

    i18n.on('languageChanged', handleLanguageChanged)
  }

  const processQueue = () => {
    if (isSpeaking || utteranceQueue.length === 0) {
      return
    }

    const utterance = utteranceQueue.shift()
    if (utterance && typeof speechSynthesis !== 'undefined') {
      isSpeaking = true
      speechSynthesis.speak(utterance)
    }
  }

  const speak = (text: string, options?: SpeechOptions) => {
    if (muted || !currentVoice || !text) {
      return
    }

    if (typeof speechSynthesis === 'undefined') {
      return
    }

    if (options?.immediate) {
      speechSynthesis.cancel()
      utteranceQueue.length = 0
      isSpeaking = false
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = currentVoice
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.addEventListener('end', () => {
      isSpeaking = false
      processQueue()
    })

    utterance.addEventListener('error', (event) => {
      isSpeaking = false
      config.onError?.(new Error(`Speech error: ${event.error}`))
      processQueue()
    })

    utteranceQueue.push(utterance)

    if (!isSpeaking) {
      processQueue()
    }
  }

  const cancel = () => {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel()
    }
    utteranceQueue.length = 0
    isSpeaking = false
  }

  const setMuted = (newMuted: boolean) => {
    muted = newMuted
    if (newMuted) {
      cancel()
    }
  }

  const setVerbosity = (level: VerbosityLevel) => {
    verbosity = level
  }

  const announce = (eventData: Omit<SpeechEventData, 'verbosity'>) => {
    const message = generateSpeechMessage({
      ...eventData,
      verbosity
    })

    if (message) {
      speak(message, { immediate: true })
    }
  }

  const destroy = () => {
    destroyed = true
    abortController.abort()
    i18n.off('languageChanged', handleLanguageChanged)
    cancel()
  }

  return {
    speak,
    cancel,
    getMuted: () => muted,
    setMuted,
    getVerbosity: () => verbosity,
    setVerbosity,
    getVoice: () => currentVoice,
    isSupported: () => typeof speechSynthesis !== 'undefined',
    announce,
    destroy
  }
}
