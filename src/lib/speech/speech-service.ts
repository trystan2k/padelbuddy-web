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
import { findVoiceByName, getAvailableVoices, selectVoice } from './voice-selector'

const maxPendingAnnouncements = 10

/**
 * Issues a silent, zero-length utterance synchronously within a user-gesture event handler.
 * This is the only reliable way to unlock the iOS/Safari speech synthesis engine so that
 * subsequent async calls to speechSynthesis.speak() are not silently dropped.
 *
 * Must be called from a direct user-interaction event handler (e.g. a button click).
 */
export function unlockSpeechEngine(): void {
  if (typeof speechSynthesis === 'undefined') {
    return
  }

  const utterance = new SpeechSynthesisUtterance('')
  utterance.volume = 0
  speechSynthesis.speak(utterance)
}

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
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const mutedRef = useRef(muted)
  mutedRef.current = muted
  const pendingAnnouncementsRef = useRef<
    Array<{ text: string; options: SpeechOptions | undefined }>
  >([])
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([])
  const isSpeakingRef = useRef(false)
  const initializedRef = useRef(false)
  const destroyedRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const languageUnsubscribeRef = useRef<(() => void) | null>(null)
  const voicesChangedUnsubscribeRef = useRef<(() => void) | null>(null)
  const preferredVoiceNameRef = useRef<string | null>(null)

  const onErrorRef = useRef(config.onError)
  const onVoiceChangeRef = useRef(config.onVoiceChange)

  useEffect(() => {
    onErrorRef.current = config.onError
    onVoiceChangeRef.current = config.onVoiceChange
  }, [config.onError, config.onVoiceChange])

  const clearVoicesChangedListener = useCallback(() => {
    voicesChangedUnsubscribeRef.current?.()
    voicesChangedUnsubscribeRef.current = null
  }, [])

  const waitForPreferredVoice = useCallback(() => {
    if (typeof speechSynthesis === 'undefined' || destroyedRef.current) {
      return
    }

    const preferredVoiceName = preferredVoiceNameRef.current

    if (!preferredVoiceName) {
      clearVoicesChangedListener()
      return
    }

    clearVoicesChangedListener()

    const handleVoicesChanged = () => {
      if (destroyedRef.current) {
        clearVoicesChangedListener()
        return
      }

      const nextPreferredVoiceName = preferredVoiceNameRef.current

      if (!nextPreferredVoiceName) {
        clearVoicesChangedListener()
        return
      }

      const voices = speechSynthesis.getVoices()
      const preferredVoice = findVoiceByName(nextPreferredVoiceName, voices)

      if (!preferredVoice) {
        return
      }

      setVoice(preferredVoice)
      voiceRef.current = preferredVoice
      onVoiceChangeRef.current?.(preferredVoice)
      clearVoicesChangedListener()
    }

    speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged)
    voicesChangedUnsubscribeRef.current = () => {
      speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged)
    }
  }, [clearVoicesChangedListener])

  // Initialize from storage and load voices
  useEffect(() => {
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    async function initialize() {
      if (initializedRef.current) return
      initializedRef.current = true

      try {
        const prefs = await loadSpeechPreferences()

        if (prefs) {
          // Always set the ref first — it is not React state and is safe even if the component
          // has already re-mounted (e.g. due to SSR hydration recovery). The ref must be set
          // before voice-selection so the preferred voice name is available.
          preferredVoiceNameRef.current = prefs.voiceName

          // Guard React state updates: skip if the component has been destroyed (unmounted
          // permanently). Note: a transient abort from hydration recovery is NOT a destroy —
          // the component will re-mount and initialize again.
          if (!destroyedRef.current) {
            setMutedState(prefs.muted)
            setVerbosityState(prefs.verbosity)
          }
        }
      } catch (error) {
        if (!destroyedRef.current) {
          onErrorRef.current?.(
            error instanceof Error ? error : new Error('Failed to load speech preferences')
          )
        }
      }

      // Bail out only if the component has been permanently destroyed.
      // Note: we check destroyedRef (not abort signal) because destroyedRef is only set
      // when destroy() is called (genuine unmount), not during React Strict Mode remount cycles.
      if (destroyedRef.current) return

      if (typeof speechSynthesis === 'undefined') {
        setMutedState(true)
        onErrorRef.current?.(new Error('Speech synthesis is not supported'))
        return
      }

      try {
        // Do NOT pass the signal here: voices must be selected even if a transient abort
        // happened (e.g. SSR hydration recovery). The destroyedRef guard below handles the
        // true "component is gone" case.
        const voices = await getAvailableVoices()
        const currentLocale = getSafeLocale(i18n.language)
        const preferredVoice = preferredVoiceNameRef.current
          ? findVoiceByName(preferredVoiceNameRef.current, voices)
          : undefined
        const selectedVoice = preferredVoice ?? selectVoice(currentLocale, voices)

        if (!destroyedRef.current) {
          setVoice(selectedVoice)
          voiceRef.current = selectedVoice
          onVoiceChangeRef.current?.(selectedVoice)

          if (preferredVoiceNameRef.current && !preferredVoice) {
            waitForPreferredVoice()
          } else {
            clearVoicesChangedListener()
          }

          if (!selectedVoice) {
            onErrorRef.current?.(new Error('No suitable voice found'))
          }
        }
      } catch {
        // getAvailableVoices failed — ignore
      }
    }

    void initialize()

    return () => {
      abortController.abort()
      clearVoicesChangedListener()
    }
  }, [clearVoicesChangedListener, waitForPreferredVoice])

  // Update voice when locale changes (do NOT run on mount — Effect 1 handles initial voice selection)
  useEffect(() => {
    const abortController = new AbortController()
    const { signal } = abortController

    async function updateVoice() {
      if (typeof speechSynthesis === 'undefined' || signal.aborted || destroyedRef.current) return

      try {
        const voices = await getAvailableVoices(signal)
        if (signal.aborted || destroyedRef.current) return
        const currentLocale = getSafeLocale(i18n.language)
        const preferredVoice = preferredVoiceNameRef.current
          ? findVoiceByName(preferredVoiceNameRef.current, voices)
          : undefined
        const selectedVoice = preferredVoice ?? selectVoice(currentLocale, voices)
        setVoice(selectedVoice)
        voiceRef.current = selectedVoice
        onVoiceChangeRef.current?.(selectedVoice)

        if (preferredVoiceNameRef.current && !preferredVoice) {
          waitForPreferredVoice()
        } else {
          clearVoicesChangedListener()
        }
      } catch {
        // Operation was aborted or failed - ignore
      }
    }

    const handleLanguageChanged = () => {
      void updateVoice()
    }

    i18n.on('languageChanged', handleLanguageChanged)

    // Store unsubscribe function for destroy() to use
    languageUnsubscribeRef.current = () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }

    return () => {
      abortController.abort()
      languageUnsubscribeRef.current?.()
      languageUnsubscribeRef.current = null
      clearVoicesChangedListener()
    }
  }, [clearVoicesChangedListener, waitForPreferredVoice])

  const processQueue = useCallback(() => {
    if (isSpeakingRef.current || utteranceQueueRef.current.length === 0) {
      return
    }

    const utterance = utteranceQueueRef.current.shift()
    if (utterance && typeof speechSynthesis !== 'undefined') {
      // iOS can leave speechSynthesis in a paused state after a background/foreground
      // cycle. Resume before speaking to avoid silent drops.
      if (speechSynthesis.paused) {
        speechSynthesis.resume()
      }

      isSpeakingRef.current = true
      speechSynthesis.speak(utterance)
    }
  }, [])

  const speak = useCallback(
    (text: string, options?: SpeechOptions) => {
      const currentVoice = voiceRef.current
      if (destroyedRef.current || mutedRef.current || !text) {
        return
      }

      if (!currentVoice) {
        if (options?.immediate) {
          pendingAnnouncementsRef.current = []
        }

        if (pendingAnnouncementsRef.current.length < maxPendingAnnouncements) {
          pendingAnnouncementsRef.current.push({ text, options })
        }

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
      utterance.voice = currentVoice
      utterance.lang = options?.lang || currentVoice?.lang || getSafeLocale(i18n.language)
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
    [processQueue]
  )

  useEffect(() => {
    if (!voice || pendingAnnouncementsRef.current.length === 0) {
      return
    }

    const pending = pendingAnnouncementsRef.current.splice(0)

    for (const { text, options } of pending) {
      speak(text, options)
    }
  }, [voice, speak])

  const cancel = useCallback(() => {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel()
    }
    pendingAnnouncementsRef.current = []
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
        voiceName: preferredVoiceNameRef.current,
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
        voiceName: preferredVoiceNameRef.current,
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
        return
      }
    },
    [verbosity, speak]
  )

  const unlock = useCallback(() => {
    if (destroyedRef.current) {
      return
    }

    unlockSpeechEngine()
  }, [])

  return {
    speak,
    unlock,
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
      destroyedRef.current = true
      pendingAnnouncementsRef.current = []
      cancel()
      abortControllerRef.current?.abort()
      languageUnsubscribeRef.current?.()
      languageUnsubscribeRef.current = null
      clearVoicesChangedListener()
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
      // iOS can leave speechSynthesis in a paused state after a background/foreground
      // cycle. Resume before speaking to avoid silent drops.
      if (speechSynthesis.paused) {
        speechSynthesis.resume()
      }

      isSpeaking = true
      speechSynthesis.speak(utterance)
    }
  }

  const speak = (text: string, options?: SpeechOptions) => {
    if (muted || !text) {
      return
    }

    if (!currentVoice) {
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
    utterance.lang = options?.lang || currentVoice?.lang || getSafeLocale(i18n.language)
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

  const unlock = () => {
    if (destroyed) {
      return
    }

    unlockSpeechEngine()
  }

  const destroy = () => {
    destroyed = true
    abortController.abort()
    i18n.off('languageChanged', handleLanguageChanged)
    cancel()
  }

  return {
    speak,
    unlock,
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
