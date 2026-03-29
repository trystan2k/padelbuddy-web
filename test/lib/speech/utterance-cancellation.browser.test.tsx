import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { useSpeechService } from '@/lib/speech'

// Helper component to test the hook
function SpeechTestComponent({
  onService,
  config
}: {
  onService: (service: ReturnType<typeof useSpeechService>) => void
  // oxlint-disable-next-line jsx-no-new-function-as-prop
  config?: Parameters<typeof useSpeechService>[0]
}) {
  const service = useSpeechService(config)
  onService(service)
  return <div data-testid="speech-test">Speech Service Test</div>
}

describe('utterance-cancellation', () => {
  let mockSpeechSynthesis: {
    speak: ReturnType<typeof vi.fn>
    cancel: ReturnType<typeof vi.fn>
    getVoices: ReturnType<typeof vi.fn>
    onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => unknown) | null
    addEventListener: ReturnType<typeof vi.fn>
    removeEventListener: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => [{ lang: 'en-US', name: 'English' }]),
      onvoiceschanged: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    vi.stubGlobal('speechSynthesis', mockSpeechSynthesis)

    // Mock SpeechSynthesisUtterance as a proper class constructor
    class MockSpeechSynthesisUtterance {
      text: string
      voice: SpeechSynthesisVoice | null = null
      rate = 1.0
      pitch = 1.0
      addEventListener = vi.fn()
      removeEventListener = vi.fn()

      constructor(text: string) {
        this.text = text
      }
    }
    vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('cancels queued utterances on immediate speak', async () => {
    let speechService: ReturnType<typeof useSpeechService> | null = null

    await render(
      <SpeechTestComponent
        // oxlint-disable-next-line jsx-no-new-object-as-prop
        config={{}}
        // oxlint-disable-next-line jsx-no-new-function-as-prop
        onService={(service) => {
          speechService = service
        }}
      />
    )

    // Wait for initialization - voice should be set
    await vi.waitFor(() => {
      expect(speechService?.getVoice()).not.toBeNull()
    })

    // Additional wait to ensure the voice state is fully settled in the speak closure
    // The speak function captures voice from state, so we need to ensure it's set
    await vi.waitFor(() => {
      expect(speechService?.getVoice()).not.toBeNull()
    })

    // Ensure speak doesn't return early by checking voice is available
    // Use getVoice which reads from state, matching what speak() checks internally
    const voice = speechService!.getVoice()
    expect(voice).not.toBeNull()

    speechService!.speak('First message')
    speechService!.speak('Second message', { immediate: true })

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
  })

  it('cancel() clears all queued utterances', async () => {
    let speechService: ReturnType<typeof useSpeechService> | null = null

    await render(
      <SpeechTestComponent
        // oxlint-disable-next-line jsx-no-new-object-as-prop
        config={{}}
        // oxlint-disable-next-line jsx-no-new-function-as-prop
        onService={(service) => {
          speechService = service
        }}
      />
    )

    // Wait for voice to be available
    await vi.waitFor(() => {
      expect(speechService?.getVoice()).not.toBeNull()
    })

    speechService!.speak('Message 1')
    speechService!.speak('Message 2')
    speechService!.cancel()

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
  })

  it('setMuted(true) cancels current speech', async () => {
    let speechService: ReturnType<typeof useSpeechService> | null = null

    await render(
      <SpeechTestComponent
        // oxlint-disable-next-line jsx-no-new-object-as-prop
        config={{}}
        // oxlint-disable-next-line jsx-no-new-function-as-prop
        onService={(service) => {
          speechService = service
        }}
      />
    )

    // Wait for voice to be available
    await vi.waitFor(() => {
      expect(speechService?.getVoice()).not.toBeNull()
    })

    speechService!.speak('Message')
    // Note: setMuted is async internally but returns void (fire-and-forget)
    // We need to wait for the cancel to be called since it happens synchronously
    speechService!.setMuted(true)

    // Wait for the cancel to be called (happens asynchronously)
    await vi.waitFor(() => {
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
    })

    // Wait for the muted state to update (React state is async)
    await vi.waitFor(() => {
      expect(speechService!.getMuted()).toBe(true)
    })
  })

  it('does not speak when muted', async () => {
    let speechService: ReturnType<typeof useSpeechService> | null = null

    await render(
      <SpeechTestComponent
        // oxlint-disable-next-line jsx-no-new-object-as-prop
        config={{ muted: true }}
        // oxlint-disable-next-line jsx-no-new-function-as-prop
        onService={(service) => {
          speechService = service
        }}
      />
    )

    // Wait for voice to be available (even though muted)
    await vi.waitFor(() => {
      expect(speechService?.getVoice()).not.toBeNull()
    })

    speechService!.speak('This should not be spoken')

    expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled()
  })

  it('isSupported returns true when speechSynthesis is available', async () => {
    let speechService: ReturnType<typeof useSpeechService> | null = null

    await render(
      <SpeechTestComponent
        // oxlint-disable-next-line jsx-no-new-object-as-prop
        config={{}}
        // oxlint-disable-next-line jsx-no-new-function-as-prop
        onService={(service) => {
          speechService = service
        }}
      />
    )

    expect(speechService!.isSupported()).toBe(true)
  })

  it('isSupported returns false when speechSynthesis is not available', async () => {
    // Unstub the previous mock and set to undefined
    vi.unstubAllGlobals()
    vi.stubGlobal('speechSynthesis', undefined)

    let speechService: ReturnType<typeof useSpeechService> | null = null

    await render(
      <SpeechTestComponent
        // oxlint-disable-next-line jsx-no-new-object-as-prop
        config={{}}
        // oxlint-disable-next-line jsx-no-new-function-as-prop
        onService={(service) => {
          speechService = service
        }}
      />
    )

    expect(speechService!.isSupported()).toBe(false)
  })
})
