import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { useSpeechService } from '@/lib/speech'

function SpeechTestComponent({
  config,
  onServiceRef
}: {
  // oxlint-disable-next-line jsx-no-new-object-as-prop
  config?: Parameters<typeof useSpeechService>[0]
  onServiceRef?: React.MutableRefObject<ReturnType<typeof useSpeechService> | null>
}) {
  const service = useSpeechService(config)
  if (onServiceRef) {
    onServiceRef.current = service
  }
  return (
    <div data-testid="speech-test">
      <span data-testid="muted">{String(service.getMuted())}</span>
      <span data-testid="verbosity">{service.getVerbosity()}</span>
      <span data-testid="supported">{String(service.isSupported())}</span>
      <span data-testid="voice">{service.getVoice()?.name ?? 'null'}</span>
    </div>
  )
}

describe('useSpeechService', () => {
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

  describe('initialization', () => {
    it('initializes with default muted false', async () => {
      const { getByTestId } = await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
        />
      )
      await expect.element(getByTestId('muted')).toHaveTextContent('false')
    })

    it('initializes with config muted value', async () => {
      const { getByTestId } = await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{ muted: true }}
        />
      )
      await expect.element(getByTestId('muted')).toHaveTextContent('true')
    })

    it('initializes with default verbosity standard', async () => {
      const { getByTestId } = await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
        />
      )
      await expect.element(getByTestId('verbosity')).toHaveTextContent('standard')
    })

    it('initializes with config verbosity value', async () => {
      const { getByTestId } = await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{ verbosity: 'minimal' }}
        />
      )
      await expect.element(getByTestId('verbosity')).toHaveTextContent('minimal')
    })

    it('returns isSupported true when speechSynthesis is available', async () => {
      const { getByTestId } = await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
        />
      )
      await expect.element(getByTestId('supported')).toHaveTextContent('true')
    })

    it('returns isSupported false when speechSynthesis is not available', async () => {
      vi.unstubAllGlobals()
      vi.stubGlobal('speechSynthesis', undefined)

      const { getByTestId } = await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
        />
      )
      await expect.element(getByTestId('supported')).toHaveTextContent('false')
    })

    it('calls onVoiceChange callback when voice is initialized', async () => {
      const onVoiceChange = vi.fn()
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{ onVoiceChange }}
        />
      )

      await vi.waitFor(() => {
        expect(onVoiceChange).toHaveBeenCalledWith(
          expect.objectContaining({
            lang: 'en-US',
            name: 'English'
          })
        )
      })
    })
  })

  describe('speak', () => {
    it('does not speak when muted', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null }
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{ muted: true }}
          onServiceRef={serviceRef}
        />
      )

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).not.toBeNull()
      })

      serviceRef.current!.speak('Hello')
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled()
    })

    it('does not speak when voice is not available', async () => {
      mockSpeechSynthesis.getVoices = vi.fn(() => [])
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null }
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      )

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).toBeNull()
      })

      serviceRef.current!.speak('Hello')
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled()
    })

    it('speaks when not muted and voice is available', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null }
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      )

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).not.toBeNull()
      })

      serviceRef.current!.speak('Hello')
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled()
    })

    it('cancels and clears queue on immediate speak', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null }
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      )

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).not.toBeNull()
      })

      serviceRef.current!.speak('First message')
      serviceRef.current!.speak('Second message', { immediate: true })

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
    })
  })

  describe('cancel', () => {
    it('calls speechSynthesis.cancel and clears queue', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null }
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      )

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).not.toBeNull()
      })

      serviceRef.current!.speak('Message 1')
      serviceRef.current!.speak('Message 2')
      serviceRef.current!.cancel()

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
    })
  })

  describe('setMuted', () => {
    it('sets muted to true', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null }
      const { getByTestId } = await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      )

      serviceRef.current!.setMuted(true)
      await expect.element(getByTestId('muted')).toHaveTextContent('true')
    })

    it('cancels speech when muting', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null }
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      )

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).not.toBeNull()
      })

      serviceRef.current!.speak('Message')
      serviceRef.current!.setMuted(true)

      await vi.waitFor(() => {
        expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
      })
    })
  })

  describe('destroy', () => {
    it('provides a destroy method for cleanup', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null }
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      )

      expect(() => serviceRef.current!.destroy()).not.toThrow()
    })

    it('cancels speech on destroy', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null }
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      )

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).not.toBeNull()
      })

      serviceRef.current!.speak('Message')
      serviceRef.current!.destroy()

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
    })
  })
})
