import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { useSpeechService } from '@/lib/speech/speech-service';

type NativeVoice = {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
  voiceURI: string;
};

const mockUnifiedTts = vi.hoisted(() => ({
  findVoiceByName: vi.fn<(name: string, voices: NativeVoice[]) => NativeVoice | undefined>(),
  getAvailableVoices: vi.fn<() => Promise<NativeVoice[]>>(),
  isNativePlatform: vi.fn<() => boolean>(),
  selectVoice: vi.fn<(locale: string, voices: NativeVoice[]) => NativeVoice | null>(),
  speakWithVoice: vi.fn<() => Promise<void>>(),
  stopSpeech: vi.fn<() => Promise<void>>()
}));

const mockSetupStorage = vi.hoisted(() => ({
  saveSpeechPreferences: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  loadSpeechPreferences: vi
    .fn<
      () => Promise<{
        muted: boolean;
        verbosity: 'standard' | 'minimal' | 'detailed';
        voiceName: string | null;
        updatedAt: string;
      } | null>
    >()
    .mockResolvedValue(null)
}));

vi.mock('@/lib/setup/setup-storage', () => ({
  saveSpeechPreferences: mockSetupStorage.saveSpeechPreferences,
  loadSpeechPreferences: mockSetupStorage.loadSpeechPreferences
}));

vi.mock('@/lib/speech/unified-tts', () => ({
  ...mockUnifiedTts
}));

function SpeechServiceProbe({
  config,
  onService
}: {
  config?: Parameters<typeof useSpeechService>[0];
  onService: (service: ReturnType<typeof useSpeechService>) => void;
}) {
  const service = useSpeechService(config);
  onService(service);
  return <div data-testid="voice-name">{service.getVoice()?.name ?? 'none'}</div>;
}

describe('useSpeechService native path', () => {
  const nativeVoice = {
    name: 'Portuguese Native',
    lang: 'pt-BR',
    localService: true,
    default: true,
    voiceURI: 'native-pt'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('speechSynthesis', undefined);
    mockSetupStorage.loadSpeechPreferences.mockResolvedValue(null);
    mockUnifiedTts.isNativePlatform.mockReturnValue(true);
    mockUnifiedTts.getAvailableVoices.mockResolvedValue([nativeVoice]);
    mockUnifiedTts.findVoiceByName.mockImplementation((name, voices) =>
      voices.find((voice) => voice.name === name)
    );
    mockUnifiedTts.selectVoice.mockImplementation((_locale, voices) => voices[0] ?? null);
    mockUnifiedTts.speakWithVoice.mockResolvedValue(undefined);
    mockUnifiedTts.stopSpeech.mockResolvedValue(undefined);
  });

  it('restores the stored preferred voice on native platforms', async () => {
    let service: ReturnType<typeof useSpeechService> | null = null;
    const getService = () => {
      if (service === null) {
        throw new Error('Speech service was not initialized');
      }

      return service;
    };

    mockSetupStorage.loadSpeechPreferences.mockResolvedValueOnce({
      muted: false,
      verbosity: 'standard',
      voiceName: 'Portuguese Native',
      updatedAt: '2026-04-11T00:00:00.000Z'
    });

    const screen = await render(
      <SpeechServiceProbe
        onService={(nextService) => {
          service = nextService;
        }}
      />
    );

    await expect.element(screen.getByTestId('voice-name')).toHaveTextContent('Portuguese Native');
    expect(getService().getVoice()).toEqual(nativeVoice);
    expect(mockUnifiedTts.findVoiceByName).toHaveBeenCalledWith('Portuguese Native', [nativeVoice]);
  });

  it('keeps the fallback native voice when the stored preferred voice is missing', async () => {
    let service: ReturnType<typeof useSpeechService> | null = null;
    const getService = () => {
      if (service === null) {
        throw new Error('Speech service was not initialized');
      }

      return service;
    };

    mockSetupStorage.loadSpeechPreferences.mockResolvedValueOnce({
      muted: false,
      verbosity: 'standard',
      voiceName: 'Missing Native Voice',
      updatedAt: '2026-04-11T00:00:00.000Z'
    });

    const screen = await render(
      <SpeechServiceProbe
        onService={(nextService) => {
          service = nextService;
        }}
      />
    );

    await expect.element(screen.getByTestId('voice-name')).toHaveTextContent('Portuguese Native');
    expect(getService().getVoice()).toEqual(nativeVoice);
    expect(mockUnifiedTts.findVoiceByName).toHaveBeenCalledWith('Missing Native Voice', [
      nativeVoice
    ]);
  });

  it('initializes with a native voice even when browser speech synthesis is unavailable', async () => {
    let service: ReturnType<typeof useSpeechService> | null = null;
    const getService = () => {
      if (service === null) {
        throw new Error('Speech service was not initialized');
      }

      return service;
    };

    const screen = await render(
      <SpeechServiceProbe
        onService={(nextService) => {
          service = nextService;
        }}
      />
    );

    await expect.element(screen.getByTestId('voice-name')).toHaveTextContent('Portuguese Native');
    expect(getService().getVoice()).toEqual(nativeVoice);
  });

  it('reports an error when no native voice can be selected', async () => {
    const onError = vi.fn<(error: Error) => void>();
    mockUnifiedTts.getAvailableVoices.mockResolvedValueOnce([]);
    mockUnifiedTts.selectVoice.mockReturnValueOnce(null);

    await render(<SpeechServiceProbe config={{ onError }} onService={() => {}} />);

    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledWith(new Error('No suitable voice found'));
    });
  });

  it('delegates speaking to unified native speech', async () => {
    let service: ReturnType<typeof useSpeechService> | null = null;
    const getService = () => {
      if (service === null) {
        throw new Error('Speech service was not initialized');
      }

      return service;
    };

    await render(
      <SpeechServiceProbe
        onService={(nextService) => {
          service = nextService;
        }}
      />
    );

    await vi.waitFor(() => {
      expect(getService().getVoice()).toEqual(nativeVoice);
    });

    getService().speak('Hello native');
    expect(mockUnifiedTts.speakWithVoice).toHaveBeenCalledWith(
      'Hello native',
      'Portuguese Native',
      'en'
    );
  });

  it('delegates cancel to native stopSpeech', async () => {
    let service: ReturnType<typeof useSpeechService> | null = null;
    const getService = () => {
      if (service === null) {
        throw new Error('Speech service was not initialized');
      }

      return service;
    };

    await render(
      <SpeechServiceProbe
        onService={(nextService) => {
          service = nextService;
        }}
      />
    );

    await vi.waitFor(() => {
      expect(getService().getVoice()).toEqual(nativeVoice);
    });

    getService().cancel();
    expect(mockUnifiedTts.stopSpeech).toHaveBeenCalledTimes(1);
  });

  it('stops native speech when muting the service', async () => {
    let service: ReturnType<typeof useSpeechService> | null = null;
    const getService = () => {
      if (service === null) {
        throw new Error('Speech service was not initialized');
      }

      return service;
    };

    await render(
      <SpeechServiceProbe
        onService={(nextService) => {
          service = nextService;
        }}
      />
    );

    await vi.waitFor(() => {
      expect(getService().getVoice()).toEqual(nativeVoice);
    });

    getService().setMuted(true);

    await vi.waitFor(() => {
      expect(mockUnifiedTts.stopSpeech).toHaveBeenCalledTimes(1);
    });
  });

  it('stops native speech when destroyed', async () => {
    let service: ReturnType<typeof useSpeechService> | null = null;
    const getService = () => {
      if (service === null) {
        throw new Error('Speech service was not initialized');
      }

      return service;
    };

    await render(
      <SpeechServiceProbe
        onService={(nextService) => {
          service = nextService;
        }}
      />
    );

    await vi.waitFor(() => {
      expect(getService().getVoice()).toEqual(nativeVoice);
    });

    getService().destroy();

    await vi.waitFor(() => {
      expect(mockUnifiedTts.stopSpeech).toHaveBeenCalledTimes(1);
    });
  });
});
