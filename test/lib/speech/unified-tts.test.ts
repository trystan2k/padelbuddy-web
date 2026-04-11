import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  findVoiceByName,
  getAvailableVoices,
  getDefaultVoiceForLocale,
  getVoiceId,
  speakWithVoice,
  stopSpeech
} from '@/lib/speech/unified-tts';

const mockCapacitor = vi.hoisted(() => ({
  isNativePlatform: vi.fn<() => boolean>()
}));

const mockNativeTts = vi.hoisted(() => ({
  getNativeVoices:
    vi.fn<
      () => Promise<
        Array<{
          name: string;
          lang: string;
          localService: boolean;
          default: boolean;
          voiceURI: string;
        }>
      >
    >(),
  speakWithNative: vi.fn<() => Promise<void>>(),
  stopNativeSpeech: vi.fn<() => Promise<void>>()
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: mockCapacitor
}));

vi.mock('@/lib/speech/native-tts', () => ({
  ...mockNativeTts
}));

class MockSpeechSynthesisUtterance {
  text: string;
  voice: SpeechSynthesisVoice | null = null;
  lang = '';

  constructor(text: string) {
    this.text = text;
  }
}

describe('unified-tts', () => {
  const browserVoices = [
    {
      name: 'English Local',
      lang: 'en-US',
      localService: true,
      default: true,
      voiceURI: 'en-local'
    },
    {
      name: 'Portuguese Cloud',
      lang: 'pt-BR',
      localService: false,
      default: false,
      voiceURI: 'pt-cloud'
    },
    {
      name: 'Portuguese Local',
      lang: 'pt-PT',
      localService: true,
      default: false,
      voiceURI: 'pt-local'
    }
  ] as SpeechSynthesisVoice[];

  beforeEach(() => {
    vi.clearAllMocks();
    mockCapacitor.isNativePlatform.mockReturnValue(false);
    mockNativeTts.getNativeVoices.mockResolvedValue([]);
    mockNativeTts.speakWithNative.mockResolvedValue(undefined);
    mockNativeTts.stopNativeSpeech.mockResolvedValue(undefined);
    vi.stubGlobal('speechSynthesis', {
      getVoices: vi.fn<() => SpeechSynthesisVoice[]>(() => browserVoices),
      speak: vi.fn<(utterance: SpeechSynthesisUtterance) => void>(),
      cancel: vi.fn<() => void>(),
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>()
    });
    vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);
  });

  it('returns empty voices when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(getAvailableVoices(controller.signal)).resolves.toEqual([]);
  });

  it('returns native voices on native platforms when available', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(true);
    mockNativeTts.getNativeVoices.mockResolvedValueOnce([
      {
        name: 'Portuguese Native',
        lang: 'pt-BR',
        localService: true,
        default: true,
        voiceURI: 'native-pt'
      }
    ]);

    await expect(getAvailableVoices()).resolves.toEqual([
      {
        name: 'Portuguese Native',
        lang: 'pt-BR',
        localService: true,
        default: true,
        voiceURI: 'native-pt'
      }
    ]);
  });

  it('falls back to browser voices when native voices are empty', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(true);

    await expect(getAvailableVoices()).resolves.toEqual(browserVoices);
  });

  it('finds voices by name', () => {
    expect(findVoiceByName('Portuguese Local', browserVoices)).toEqual(browserVoices[2]);
    expect(findVoiceByName('Missing', browserVoices)).toBeUndefined();
  });

  it('returns the browser voice id shape', () => {
    expect(getVoiceId(browserVoices[0]!)).toBe('en-local::en-US');
  });

  it('prefers a local locale voice when selecting the default voice', () => {
    expect(getDefaultVoiceForLocale('pt', browserVoices)).toEqual(browserVoices[2]);
  });

  it('returns the first locale voice when no local locale voice exists', () => {
    const cloudOnlyPortugueseVoices = [
      {
        name: 'Portuguese Cloud 1',
        lang: 'pt-BR',
        localService: false,
        default: false,
        voiceURI: 'pt-cloud-1'
      },
      {
        name: 'Portuguese Cloud 2',
        lang: 'pt-PT',
        localService: false,
        default: false,
        voiceURI: 'pt-cloud-2'
      }
    ] as SpeechSynthesisVoice[];

    expect(getDefaultVoiceForLocale('pt', cloudOnlyPortugueseVoices)).toEqual(
      cloudOnlyPortugueseVoices[0]
    );
  });

  it('falls back to browser voice selection when locale voices are missing', () => {
    expect(getDefaultVoiceForLocale('es', browserVoices)).toEqual(browserVoices[0]);
  });

  it('returns null when neither locale nor fallback browser voices exist', () => {
    const unsupportedVoices = [
      {
        name: 'French Voice',
        lang: 'fr-FR',
        localService: false,
        default: false,
        voiceURI: 'fr'
      }
    ] as SpeechSynthesisVoice[];

    expect(getDefaultVoiceForLocale('es', unsupportedVoices)).toBeNull();
  });

  it('delegates speaking to native TTS on native platforms', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(true);

    await speakWithVoice('Hola', 'Portuguese Native', 'pt');
    expect(mockNativeTts.speakWithNative).toHaveBeenCalledWith('Hola', 'Portuguese Native', 'pt');
  });

  it('speaks with browser synthesis on web platforms', async () => {
    const speech = speechSynthesis as unknown as {
      speak: ReturnType<typeof vi.fn>;
    };

    await speakWithVoice('Hello', 'English Local', 'en');

    expect(speech.speak).toHaveBeenCalledTimes(1);
    const utterance = speech.speak.mock.calls[0]![0] as MockSpeechSynthesisUtterance;
    expect(utterance.text).toBe('Hello');
    expect(utterance.voice).toEqual(browserVoices[0]);
    expect(utterance.lang).toBe('en');
  });

  it('skips browser speech when speechSynthesis is unavailable', async () => {
    vi.stubGlobal('speechSynthesis', undefined);

    await expect(speakWithVoice('Hello', 'English Local', 'en')).resolves.toBeUndefined();
  });

  it('speaks on web even when no voice name or language is provided', async () => {
    const speech = speechSynthesis as unknown as {
      speak: ReturnType<typeof vi.fn>;
    };

    await speakWithVoice('Hello');

    expect(speech.speak).toHaveBeenCalledTimes(1);
    const utterance = speech.speak.mock.calls[0]![0] as MockSpeechSynthesisUtterance;
    expect(utterance.text).toBe('Hello');
    expect(utterance.voice).toBeNull();
    expect(utterance.lang).toBe('');
  });

  it('stops native speech on native platforms', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(true);

    await stopSpeech();
    expect(mockNativeTts.stopNativeSpeech).toHaveBeenCalledTimes(1);
  });

  it('cancels browser speech on web platforms', async () => {
    const speech = speechSynthesis as unknown as {
      cancel: ReturnType<typeof vi.fn>;
    };

    await stopSpeech();
    expect(speech.cancel).toHaveBeenCalledTimes(1);
  });

  it('does nothing on web when speechSynthesis is unavailable during stop', async () => {
    vi.stubGlobal('speechSynthesis', undefined);

    await expect(stopSpeech()).resolves.toBeUndefined();
  });
});
