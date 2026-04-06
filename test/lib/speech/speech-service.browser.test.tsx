import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { useSpeechService } from '@/lib/speech/speech-service';

vi.mock('@/lib/setup/setup-storage', () => ({
  saveSpeechPreferences: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  loadSpeechPreferences: vi.fn<() => Promise<null>>(),
  clearSpeechPreferences: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
}));

function SpeechTestComponent({
  config,
  onServiceRef
}: {
  // oxlint-disable-next-line jsx-no-new-object-as-prop
  config?: Parameters<typeof useSpeechService>[0];
  onServiceRef?: React.MutableRefObject<ReturnType<typeof useSpeechService> | null>;
}) {
  const service = useSpeechService(config);
  if (onServiceRef) {
    onServiceRef.current = service;
  }
  return (
    <div data-testid="speech-test">
      <span data-testid="muted">{String(service.getMuted())}</span>
      <span data-testid="verbosity">{service.getVerbosity()}</span>
      <span data-testid="supported">{String(service.isSupported())}</span>
      <span data-testid="voice">{service.getVoice()?.name ?? 'null'}</span>
    </div>
  );
}

describe('useSpeechService', () => {
  let mockSpeechSynthesis: {
    speak: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
    getVoices: ReturnType<typeof vi.fn>;
    paused: boolean;
    resume: ReturnType<typeof vi.fn>;
    onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => unknown) | null;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };
  let utterances: MockSpeechSynthesisUtterance[];

  class MockSpeechSynthesisUtterance {
    text: string;
    voice: SpeechSynthesisVoice | null = null;
    lang = '';
    rate = 1.0;
    pitch = 1.0;
    private listeners: Map<string, EventListener[]> = new Map();

    addEventListener = vi.fn<(type: string, listener: EventListener) => void>(
      (type: string, listener: EventListener) => {
        const existing = this.listeners.get(type) ?? [];
        existing.push(listener);
        this.listeners.set(type, existing);
      }
    );

    removeEventListener = vi.fn<(type: string, listener: EventListener) => void>();

    constructor(text: string) {
      this.text = text;
      utterances.push(this);
    }

    triggerEvent(type: string, event: Event = new Event(type)) {
      const registeredListeners = this.listeners.get(type) ?? [];

      for (const listener of registeredListeners) {
        listener(event);
      }
    }
  }

  beforeEach(() => {
    utterances = [];
    mockSpeechSynthesis = {
      speak: vi.fn<(utterance: SpeechSynthesisUtterance) => void>(),
      cancel: vi.fn<() => void>(),
      getVoices: vi.fn<() => SpeechSynthesisVoice[]>(() => [
        { lang: 'en-US', name: 'English', default: false, localService: true, voiceURI: 'test' }
      ]),
      paused: false,
      resume: vi.fn<() => void>(),
      onvoiceschanged: null,
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>()
    };

    vi.stubGlobal('speechSynthesis', mockSpeechSynthesis);
    vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('initialization', () => {
    it('initializes with default muted false', async () => {
      const { getByTestId } = await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
        />
      );
      await expect.element(getByTestId('muted')).toHaveTextContent('false');
    });

    it('initializes with config muted value', async () => {
      const { getByTestId } = await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{ muted: true }}
        />
      );
      await expect.element(getByTestId('muted')).toHaveTextContent('true');
    });

    it('initializes with default verbosity standard', async () => {
      const { getByTestId } = await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
        />
      );
      await expect.element(getByTestId('verbosity')).toHaveTextContent('standard');
    });

    it('initializes with config verbosity value', async () => {
      const { getByTestId } = await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{ verbosity: 'minimal' }}
        />
      );
      await expect.element(getByTestId('verbosity')).toHaveTextContent('minimal');
    });

    it('returns isSupported true when speechSynthesis is available', async () => {
      const { getByTestId } = await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
        />
      );
      await expect.element(getByTestId('supported')).toHaveTextContent('true');
    });

    it('returns isSupported false when speechSynthesis is not available', async () => {
      vi.unstubAllGlobals();
      vi.stubGlobal('speechSynthesis', undefined);

      const { getByTestId } = await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
        />
      );
      await expect.element(getByTestId('supported')).toHaveTextContent('false');
    });

    it('calls onVoiceChange callback when voice is initialized', async () => {
      const onVoiceChange = vi.fn<() => void>();
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{ onVoiceChange }}
        />
      );

      await vi.waitFor(() => {
        expect(onVoiceChange).toHaveBeenCalledWith(
          expect.objectContaining({
            lang: 'en-US',
            name: 'English'
          })
        );
      });
    });
  });

  describe('speak', () => {
    it('does not speak when muted', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null };
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{ muted: true }}
          onServiceRef={serviceRef}
        />
      );

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).not.toBeNull();
      });

      serviceRef.current!.speak('Hello');
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('does not speak when voice is not available', async () => {
      mockSpeechSynthesis.getVoices = vi.fn<() => SpeechSynthesisVoice[]>(() => []);
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null };
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      );

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).toBeNull();
      });

      serviceRef.current!.speak('Hello');
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('speaks when not muted and voice is available', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null };
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      );

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).not.toBeNull();
      });

      serviceRef.current!.speak('Hello');
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });

    it('cancels and clears queue on immediate speak', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null };
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      );

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).not.toBeNull();
      });

      serviceRef.current!.speak('First message');
      serviceRef.current!.speak('Second message', { immediate: true });

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });

    it('processes the next queued utterance after the current one ends', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null };
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      );

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).not.toBeNull();
      });

      serviceRef.current!.speak('First message');
      serviceRef.current!.speak('Second message');

      expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
      expect(utterances[0]?.text).toBe('First message');

      utterances[0]!.triggerEvent('end');

      expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(2);
      expect(utterances[1]?.text).toBe('Second message');
    });

    it('resumes speech synthesis before speaking when the engine is paused', async () => {
      mockSpeechSynthesis.paused = true;

      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null };
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      );

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).not.toBeNull();
      });

      serviceRef.current!.speak('Hello');

      expect(mockSpeechSynthesis.resume).toHaveBeenCalledTimes(1);
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel', () => {
    it('calls speechSynthesis.cancel and clears queue', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null };
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      );

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).not.toBeNull();
      });

      serviceRef.current!.speak('Message 1');
      serviceRef.current!.speak('Message 2');
      serviceRef.current!.cancel();

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });
  });

  describe('setMuted', () => {
    it('sets muted to true', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null };
      const { getByTestId } = await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      );

      serviceRef.current!.setMuted(true);
      await expect.element(getByTestId('muted')).toHaveTextContent('true');
    });

    it('cancels speech when muting', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null };
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      );

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).not.toBeNull();
      });

      serviceRef.current!.speak('Message');
      serviceRef.current!.setMuted(true);

      await vi.waitFor(() => {
        expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      });
    });
  });

  describe('destroy', () => {
    it('provides a destroy method for cleanup', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null };
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      );

      expect(() => serviceRef.current!.destroy()).not.toThrow();
    });

    it('cancels speech on destroy', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null };
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      );

      await vi.waitFor(() => {
        expect(serviceRef.current?.getVoice()).not.toBeNull();
      });

      serviceRef.current!.speak('Message');
      serviceRef.current!.destroy();

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });
  });
});
