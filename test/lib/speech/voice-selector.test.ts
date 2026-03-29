import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  findVoiceByName,
  getDefaultVoiceForLocale,
  getAvailableVoices,
  selectVoice
} from '@/lib/speech/voice-selector'

const mockVoices = [
  { lang: 'en-US', name: 'English US' },
  { lang: 'en-GB', name: 'English UK' },
  { lang: 'pt-BR', name: 'Portuguese Brazil' },
  { lang: 'es-ES', name: 'Spanish Spain' },
  { lang: 'fr-FR', name: 'French France' }
] as SpeechSynthesisVoice[]

describe('voice-selector', () => {
  describe('selectVoice', () => {
    it('prefers Google voice when available for locale', () => {
      const voicesWithGoogle = [
        { lang: 'es-MX', name: 'Spanish Mexico' },
        { lang: 'es-ES', name: 'Google español' }
      ] as SpeechSynthesisVoice[]

      const result = selectVoice('es', voicesWithGoogle)

      expect(result?.name).toBe('Google español')
    })

    it('selects voice matching locale (pt)', () => {
      const result = selectVoice('pt', mockVoices)
      expect(result?.lang).toBe('pt-BR')
    })

    it('selects voice matching locale (es)', () => {
      const result = selectVoice('es', mockVoices)
      expect(result?.lang).toBe('es-ES')
    })

    it('selects voice matching locale (en)', () => {
      const result = selectVoice('en', mockVoices)
      expect(result?.lang).toBe('en-US')
    })

    it('falls back to English voice when locale voice unavailable', () => {
      // Create voices without the requested locale to test fallback
      const voicesWithoutPortuguese = mockVoices.filter((v) => !v.lang.startsWith('pt'))
      const result = selectVoice('pt', voicesWithoutPortuguese)
      expect(result?.lang).toBe('en-US')
    })

    it('returns null when no voices available', () => {
      expect(selectVoice('pt', [])).toBeNull()
    })

    it('returns null when no suitable voice found and no English fallback', () => {
      const voicesWithoutEnglish = [
        { lang: 'fr-FR', name: 'French France' },
        { lang: 'de-DE', name: 'German Germany' }
      ] as SpeechSynthesisVoice[]

      expect(selectVoice('pt', voicesWithoutEnglish)).toBeNull()
    })

    it('matches locale case-insensitively', () => {
      const voicesWithLowercase = [
        { lang: 'pt-br', name: 'Portuguese Brazil' }
      ] as SpeechSynthesisVoice[]

      // Testing case-insensitive matching with uppercase locale
      const result = selectVoice('PT' as 'pt', voicesWithLowercase)
      expect(result?.lang).toBe('pt-br')
    })

    it('selects first matching voice when multiple matches exist', () => {
      const multipleEnglishVoices = [
        { lang: 'en-US', name: 'English US' },
        { lang: 'en-GB', name: 'English UK' },
        { lang: 'en-AU', name: 'English Australia' }
      ] as SpeechSynthesisVoice[]

      const result = selectVoice('en', multipleEnglishVoices)
      expect(result?.name).toBe('English US')
    })
  })

  describe('getAvailableVoices', () => {
    let mockSpeechSynthesis: {
      getVoices: ReturnType<typeof vi.fn>
      onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => unknown) | null
      addEventListener: ReturnType<typeof vi.fn>
      removeEventListener: ReturnType<typeof vi.fn>
    }

    beforeEach(() => {
      const listeners = new Map<string, Set<EventListener>>()
      mockSpeechSynthesis = {
        getVoices: vi.fn(() => mockVoices),
        onvoiceschanged: null,
        addEventListener: vi.fn((type: string, listener: EventListener) => {
          const set = listeners.get(type) ?? new Set()
          set.add(listener)
          listeners.set(type, set)
        }),
        removeEventListener: vi.fn((type: string, listener: EventListener) => {
          listeners.get(type)?.delete(listener)
        })
      }
      vi.stubGlobal('speechSynthesis', mockSpeechSynthesis)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('returns voices immediately when available', async () => {
      const voices = await getAvailableVoices()
      expect(voices).toEqual(mockVoices)
    })

    it('returns empty array when speechSynthesis is undefined', async () => {
      vi.unstubAllGlobals()
      vi.stubGlobal('speechSynthesis', undefined)

      const voices = await getAvailableVoices()
      expect(voices).toEqual([])
    })

    it('waits for voiceschanged event when voices not loaded', async () => {
      // First call returns empty, then voices load
      let voicesLoaded = false
      const listeners = new Map<string, Set<EventListener>>()

      mockSpeechSynthesis.getVoices = vi.fn(() => {
        if (voicesLoaded) {
          return mockVoices
        }
        return []
      })
      mockSpeechSynthesis.addEventListener = vi.fn((type: string, listener: EventListener) => {
        const set = listeners.get(type) ?? new Set()
        set.add(listener)
        listeners.set(type, set)
      })
      mockSpeechSynthesis.removeEventListener = vi.fn((type: string, listener: EventListener) => {
        listeners.get(type)?.delete(listener)
      })

      const voicesPromise = getAvailableVoices()

      // Verify addEventListener was called
      expect(mockSpeechSynthesis.addEventListener).toHaveBeenCalledWith(
        'voiceschanged',
        expect.any(Function)
      )

      // Simulate voices loading
      voicesLoaded = true
      // Trigger the voiceschanged event listeners
      const voiceschangedListeners = listeners.get('voiceschanged')
      if (voiceschangedListeners) {
        for (const listener of voiceschangedListeners) {
          listener(new Event('voiceschanged'))
        }
      }

      const voices = await voicesPromise
      expect(voices).toEqual(mockVoices)

      // Verify removeEventListener was called for cleanup
      expect(mockSpeechSynthesis.removeEventListener).toHaveBeenCalledWith(
        'voiceschanged',
        expect.any(Function)
      )
    })
  })

  describe('findVoiceByName', () => {
    it('finds voice by exact name match', () => {
      const result = findVoiceByName('English UK', mockVoices)
      expect(result?.name).toBe('English UK')
    })

    it('returns undefined when voice not found', () => {
      const result = findVoiceByName('Nonexistent Voice', mockVoices)
      expect(result).toBeUndefined()
    })

    it('returns first matching voice when multiple have same name', () => {
      const duplicateVoices = [
        { lang: 'en-US', name: 'English' },
        { lang: 'en-GB', name: 'English' }
      ] as SpeechSynthesisVoice[]

      const result = findVoiceByName('English', duplicateVoices)
      expect(result?.lang).toBe('en-US')
    })
  })

  describe('getDefaultVoiceForLocale', () => {
    const voicesWithLocalService = [
      { lang: 'pt-BR', name: 'Portuguese Brazil Local', localService: true },
      { lang: 'pt-BR', name: 'Portuguese Brazil Cloud', localService: false },
      { lang: 'en-US', name: 'English US', localService: true }
    ] as SpeechSynthesisVoice[]

    it('prefers local service voice for locale', () => {
      const result = getDefaultVoiceForLocale('pt', voicesWithLocalService)
      expect(result?.name).toBe('Portuguese Brazil Local')
    })

    it('returns first locale voice when no local service available', () => {
      const cloudOnlyVoices = [
        { lang: 'pt-BR', name: 'Portuguese Brazil Cloud 1', localService: false },
        { lang: 'pt-BR', name: 'Portuguese Brazil Cloud 2', localService: false }
      ] as SpeechSynthesisVoice[]

      const result = getDefaultVoiceForLocale('pt', cloudOnlyVoices)
      expect(result?.name).toBe('Portuguese Brazil Cloud 1')
    })

    it('falls back to selectVoice when no locale voices available', () => {
      const result = getDefaultVoiceForLocale('es', voicesWithLocalService)
      expect(result?.lang).toBe('en-US') // Falls back to English
    })

    it('returns null when no voices available', () => {
      const result = getDefaultVoiceForLocale('pt', [])
      expect(result).toBeNull()
    })

    it('returns null when no locale voices and no English fallback', () => {
      const nonEnglishVoices = [
        { lang: 'fr-FR', name: 'French', localService: true },
        { lang: 'de-DE', name: 'German', localService: true }
      ] as SpeechSynthesisVoice[]

      const result = getDefaultVoiceForLocale('pt', nonEnglishVoices)
      expect(result).toBeNull()
    })
  })
})
