import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createSpeechService } from '@/lib/speech/speech-service'

describe('createSpeechService', () => {
  let mockSpeechSynthesis: {
    speak: ReturnType<typeof vi.fn>
    cancel: ReturnType<typeof vi.fn>
    getVoices: ReturnType<typeof vi.fn>
    onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => unknown) | null
  }

  beforeEach(() => {
    mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => [{ lang: 'en-US', name: 'English' }]),
      onvoiceschanged: null
    }

    vi.stubGlobal('speechSynthesis', mockSpeechSynthesis)

    // Mock SpeechSynthesisUtterance as a proper class constructor
    class MockSpeechSynthesisUtterance {
      text: string
      voice: SpeechSynthesisVoice | null = null
      rate = 1.0
      pitch = 1.0
      private listeners: Map<string, EventListener[]> = new Map()

      addEventListener = vi.fn((type: string, listener: EventListener) => {
        const existing = this.listeners.get(type) ?? []
        existing.push(listener)
        this.listeners.set(type, existing)
      })

      removeEventListener = vi.fn()

      constructor(text: string) {
        this.text = text
      }

      // Helper to trigger events in tests
      triggerEvent(type: string) {
        const listeners = this.listeners.get(type) ?? []
        for (const listener of listeners) {
          listener(new Event(type))
        }
      }
    }
    vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('initializes with default muted false', () => {
      const service = createSpeechService()
      expect(service.getMuted()).toBe(false)
    })

    it('initializes with config muted value', () => {
      const service = createSpeechService({ muted: true })
      expect(service.getMuted()).toBe(true)
    })

    it('initializes with default verbosity standard', () => {
      const service = createSpeechService()
      expect(service.getVerbosity()).toBe('standard')
    })

    it('initializes with config verbosity value', () => {
      const service = createSpeechService({ verbosity: 'minimal' })
      expect(service.getVerbosity()).toBe('minimal')
    })

    it('returns isSupported true when speechSynthesis is available', () => {
      const service = createSpeechService()
      expect(service.isSupported()).toBe(true)
    })

    it('returns isSupported false when speechSynthesis is not available', () => {
      vi.unstubAllGlobals()
      vi.stubGlobal('speechSynthesis', undefined)

      const service = createSpeechService()
      expect(service.isSupported()).toBe(false)
    })

    it('calls onVoiceChange callback when voice is initialized', async () => {
      const onVoiceChange = vi.fn()
      createSpeechService({ onVoiceChange })

      // Wait for async initialization
      await vi.waitFor(() => {
        expect(onVoiceChange).toHaveBeenCalled()
      })
    })
  })

  describe('speak', () => {
    it('does not speak when muted', async () => {
      const service = createSpeechService({ muted: true })

      // Wait for voice initialization
      await vi.waitFor(() => {
        expect(service.getVoice()).not.toBeNull()
      })

      service.speak('Hello')
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled()
    })

    it('does not speak when voice is not available', async () => {
      // Set up with no voices
      mockSpeechSynthesis.getVoices = vi.fn(() => [])

      const service = createSpeechService()

      // Wait for voice initialization
      await vi.waitFor(() => {
        expect(service.getVoice()).toBeNull()
      })

      service.speak('Hello')
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled()
    })

    it('does not speak when text is empty', async () => {
      const service = createSpeechService()

      // Wait for voice initialization
      await vi.waitFor(() => {
        expect(service.getVoice()).not.toBeNull()
      })

      service.speak('')
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled()
    })

    it('speaks when not muted and voice is available', async () => {
      const service = createSpeechService()

      // Wait for voice initialization
      await vi.waitFor(() => {
        expect(service.getVoice()).not.toBeNull()
      })

      service.speak('Hello')
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled()
    })

    it('cancels and clears queue on immediate speak', async () => {
      const service = createSpeechService()

      // Wait for voice initialization
      await vi.waitFor(() => {
        expect(service.getVoice()).not.toBeNull()
      })

      service.speak('First message')
      service.speak('Second message', { immediate: true })

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
    })

    it('does not speak when speechSynthesis is undefined', async () => {
      vi.unstubAllGlobals()
      vi.stubGlobal('speechSynthesis', undefined)

      const service = createSpeechService()
      service.speak('Hello')

      // Should not throw and not speak
      expect(service.isSupported()).toBe(false)
    })
  })

  describe('cancel', () => {
    it('calls speechSynthesis.cancel and clears queue', async () => {
      const service = createSpeechService()

      // Wait for voice initialization
      await vi.waitFor(() => {
        expect(service.getVoice()).not.toBeNull()
      })

      service.speak('Message 1')
      service.speak('Message 2')
      service.cancel()

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
    })

    it('handles cancel when speechSynthesis is undefined', () => {
      vi.unstubAllGlobals()
      vi.stubGlobal('speechSynthesis', undefined)

      const service = createSpeechService()
      // Should not throw
      expect(() => service.cancel()).not.toThrow()
    })
  })

  describe('setMuted', () => {
    it('sets muted to true', () => {
      const service = createSpeechService()
      void service.setMuted(true)
      expect(service.getMuted()).toBe(true)
    })

    it('sets muted to false', () => {
      const service = createSpeechService({ muted: true })
      void service.setMuted(false)
      expect(service.getMuted()).toBe(false)
    })

    it('cancels speech when muting', async () => {
      const service = createSpeechService()

      // Wait for voice initialization
      await vi.waitFor(() => {
        expect(service.getVoice()).not.toBeNull()
      })

      service.speak('Message')
      void service.setMuted(true)

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
    })
  })

  describe('setVerbosity', () => {
    it('sets verbosity level', () => {
      const service = createSpeechService()
      expect(service.getVerbosity()).toBe('standard')

      void service.setVerbosity('minimal')
      expect(service.getVerbosity()).toBe('minimal')

      void service.setVerbosity('verbose')
      expect(service.getVerbosity()).toBe('verbose')
    })
  })

  describe('announce', () => {
    it('generates and speaks message for point-scored event', async () => {
      const service = createSpeechService()

      // Wait for voice initialization
      await vi.waitFor(() => {
        expect(service.getVoice()).not.toBeNull()
      })

      service.announce({
        eventType: 'point-scored',
        team1Score: '15',
        team2Score: '0'
      })

      expect(mockSpeechSynthesis.speak).toHaveBeenCalled()
    })

    it('does not speak when muted', async () => {
      const service = createSpeechService({ muted: true })

      // Wait for voice initialization
      await vi.waitFor(() => {
        expect(service.getVoice()).not.toBeNull()
      })

      service.announce({
        eventType: 'point-scored',
        team1Score: '15',
        team2Score: '0'
      })

      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled()
    })

    it('does not speak when message is null (minimal point-scored)', async () => {
      const service = createSpeechService({ verbosity: 'minimal' })

      // Wait for voice initialization
      await vi.waitFor(() => {
        expect(service.getVoice()).not.toBeNull()
      })

      service.announce({
        eventType: 'point-scored',
        team1Score: '15',
        team2Score: '0'
      })

      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled()
    })
  })

  describe('getVoice', () => {
    it('returns null initially before voice loads', () => {
      const service = createSpeechService()
      // Voice is null before async initialization
      expect(service.getVoice()).toBeNull()
    })

    it('returns voice after initialization', async () => {
      const service = createSpeechService()

      await vi.waitFor(() => {
        expect(service.getVoice()).not.toBeNull()
      })

      expect(service.getVoice()?.lang).toBe('en-US')
    })
  })

  describe('queue processing', () => {
    it('processes queue after utterance ends', async () => {
      // Store utterances for triggering events
      const utterances: { text: string; triggerEvent: (type: string) => void }[] = []

      class MockSpeechSynthesisUtterance {
        text: string
        voice: SpeechSynthesisVoice | null = null
        rate = 1.0
        pitch = 1.0
        private listeners: Map<string, EventListener[]> = new Map()

        addEventListener = vi.fn((type: string, listener: EventListener) => {
          const existing = this.listeners.get(type) ?? []
          existing.push(listener)
          this.listeners.set(type, existing)
        })

        removeEventListener = vi.fn()

        constructor(text: string) {
          this.text = text
          utterances.push({
            text,
            triggerEvent: (type: string) => {
              const listeners = this.listeners.get(type) ?? []
              for (const listener of listeners) {
                listener(new Event(type))
              }
            }
          })
        }
      }
      vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance)

      const service = createSpeechService()

      // Wait for voice initialization
      await vi.waitFor(() => {
        expect(service.getVoice()).not.toBeNull()
      })

      service.speak('First message')
      service.speak('Second message')

      // First speak should be called
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1)

      // Trigger 'end' event on first utterance
      if (utterances[0]) {
        utterances[0].triggerEvent('end')
      }

      // Second message should now be spoken
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(2)
    })

    it('processes queue after utterance error', async () => {
      // Store utterances for triggering events
      const utterances: { text: string; triggerEvent: (type: string) => void }[] = []

      class MockSpeechSynthesisUtterance {
        text: string
        voice: SpeechSynthesisVoice | null = null
        rate = 1.0
        pitch = 1.0
        private listeners: Map<string, EventListener[]> = new Map()

        addEventListener = vi.fn((type: string, listener: EventListener) => {
          const existing = this.listeners.get(type) ?? []
          existing.push(listener)
          this.listeners.set(type, existing)
        })

        removeEventListener = vi.fn()

        constructor(text: string) {
          this.text = text
          utterances.push({
            text,
            triggerEvent: (type: string) => {
              const listeners = this.listeners.get(type) ?? []
              for (const listener of listeners) {
                listener(new Event(type))
              }
            }
          })
        }
      }
      vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance)

      const onError = vi.fn()
      const service = createSpeechService({ onError })

      // Wait for voice initialization
      await vi.waitFor(() => {
        expect(service.getVoice()).not.toBeNull()
      })

      service.speak('First message')
      service.speak('Second message')

      // Trigger 'error' event on first utterance
      if (utterances[0]) {
        utterances[0].triggerEvent('error')
      }

      // onError should be called
      expect(onError).toHaveBeenCalled()
      // Queue should continue processing
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(2)
    })
  })
})
