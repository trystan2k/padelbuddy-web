import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { i18n } from '@/lib/i18n/i18n';
import { unlockSpeechEngine, useSpeechService } from '@/lib/speech/speech-service';

const setupStorageMocks = vi.hoisted(() => ({
  saveSpeechPreferences: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  loadSpeechPreferences: vi.fn<
    () => Promise<{
      muted: boolean;
      verbosity: 'standard' | 'minimal' | 'detailed';
      voiceName: string | null;
      updatedAt: string;
    } | null>
  >(),
  clearSpeechPreferences: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
}));

vi.mock('@/lib/setup/setup-storage', () => ({
  saveSpeechPreferences: setupStorageMocks.saveSpeechPreferences,
  loadSpeechPreferences: setupStorageMocks.loadSpeechPreferences,
  clearSpeechPreferences: setupStorageMocks.clearSpeechPreferences
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
    setupStorageMocks.loadSpeechPreferences.mockResolvedValue(null);
    i18n.language = 'en';
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

    it('restores a stored preferred voice when it exists', async () => {
      setupStorageMocks.loadSpeechPreferences.mockResolvedValueOnce({
        muted: false,
        verbosity: 'standard',
        voiceName: 'English',
        updatedAt: '2026-04-11T00:00:00.000Z'
      });

      const { getByTestId } = await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
        />
      );

      await expect.element(getByTestId('voice')).toHaveTextContent('English');
    });

    it('waits for the preferred voice when the stored voice is not initially available', async () => {
      setupStorageMocks.loadSpeechPreferences.mockResolvedValueOnce({
        muted: false,
        verbosity: 'standard',
        voiceName: 'Missing Voice',
        updatedAt: '2026-04-11T00:00:00.000Z'
      });

      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
        />
      );

      await vi.waitFor(() => {
        expect(mockSpeechSynthesis.addEventListener).toHaveBeenCalledWith(
          'voiceschanged',
          expect.any(Function)
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

    it('caps pending announcements at the maximum when voice selection is delayed', async () => {
      let voicesLoaded = false;
      const listeners = new Map<string, Set<EventListener>>();

      mockSpeechSynthesis.getVoices = vi.fn<() => SpeechSynthesisVoice[]>(() => {
        if (voicesLoaded) {
          return [
            {
              lang: 'en-US',
              name: 'English',
              default: false,
              localService: true,
              voiceURI: 'test'
            }
          ];
        }

        return [];
      });
      mockSpeechSynthesis.addEventListener = vi.fn<(type: string, listener: EventListener) => void>(
        (type, listener) => {
          const set = listeners.get(type) ?? new Set<EventListener>();
          set.add(listener);
          listeners.set(type, set);
        }
      );
      mockSpeechSynthesis.removeEventListener = vi.fn<
        (type: string, listener: EventListener) => void
      >((type, listener) => {
        listeners.get(type)?.delete(listener);
      });

      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null };
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{}}
          onServiceRef={serviceRef}
        />
      );

      for (let index = 0; index < 11; index += 1) {
        serviceRef.current!.speak(`Message ${index + 1}`);
      }

      voicesLoaded = true;
      const voicesChangedListeners = listeners.get('voiceschanged') ?? new Set<EventListener>();
      for (const listener of voicesChangedListeners) {
        listener(new Event('voiceschanged'));
      }

      await vi.waitFor(() => {
        expect(utterances).toHaveLength(10);
      });
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

    it('falls back to the default locale when the voice has no language', async () => {
      mockSpeechSynthesis.getVoices = vi.fn<() => SpeechSynthesisVoice[]>(() => [
        {
          lang: '',
          name: 'English Blank',
          default: false,
          localService: true,
          voiceURI: 'blank'
        },
        {
          lang: 'en-US',
          name: 'English',
          default: false,
          localService: true,
          voiceURI: 'test'
        }
      ]);
      setupStorageMocks.loadSpeechPreferences.mockResolvedValueOnce({
        muted: false,
        verbosity: 'standard',
        voiceName: 'English Blank',
        updatedAt: '2026-04-11T00:00:00.000Z'
      });
      i18n.language = undefined as unknown as string;

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

      expect(utterances[0]?.lang).toBe('en');
    });

    it('does nothing when browser speech synthesis becomes unavailable before speaking', async () => {
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

      vi.stubGlobal('speechSynthesis', undefined);

      expect(() => serviceRef.current!.speak('Hello')).not.toThrow();
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

    it('does not cancel speech when unmuting', async () => {
      // oxlint-disable-next-line jsx-no-new-object-as-prop
      const serviceRef = { current: null as ReturnType<typeof useSpeechService> | null };
      await render(
        <SpeechTestComponent
          // oxlint-disable-next-line jsx-no-new-object-as-prop
          config={{ muted: true }}
          onServiceRef={serviceRef}
        />
      );

      serviceRef.current!.setMuted(false);

      expect(mockSpeechSynthesis.cancel).not.toHaveBeenCalled();
    });
  });

  describe('unlockSpeechEngine', () => {
    it('issues a silent utterance when speechSynthesis is available', () => {
      unlockSpeechEngine();

      expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
      expect(utterances[0]?.text).toBe('');
    });

    it('does nothing when speechSynthesis is unavailable', () => {
      vi.unstubAllGlobals();
      vi.stubGlobal('speechSynthesis', undefined);

      expect(() => unlockSpeechEngine()).not.toThrow();
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
