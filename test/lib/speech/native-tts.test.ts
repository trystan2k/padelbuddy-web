import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getNativeVoices, speakWithNative, stopNativeSpeech } from '@/lib/speech/native-tts';

const mockCapacitor = vi.hoisted(() => ({
  isNativePlatform: vi.fn<() => boolean>()
}));

const mockTextToSpeech = vi.hoisted(() => ({
  getSupportedVoices: vi.fn<
    () => Promise<{
      voices: Array<{
        name: string;
        lang: string;
        localService: boolean;
        default: boolean;
        voiceURI: string;
      }>;
    }>
  >(),
  speak: vi.fn<() => Promise<void>>(),
  stop: vi.fn<() => Promise<void>>()
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: mockCapacitor
}));

vi.mock('@capacitor-community/text-to-speech', () => ({
  TextToSpeech: mockTextToSpeech
}));

describe('native-tts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCapacitor.isNativePlatform.mockReturnValue(true);
    mockTextToSpeech.getSupportedVoices.mockResolvedValue({
      voices: [
        {
          name: 'Portuguese Brazil',
          lang: 'pt-BR',
          localService: false,
          default: false,
          voiceURI: 'cloud'
        },
        {
          name: 'Portuguese Brazil',
          lang: 'pt-BR',
          localService: true,
          default: true,
          voiceURI: 'local'
        },
        {
          name: 'English US',
          lang: 'en-US',
          localService: true,
          default: false,
          voiceURI: 'en-local'
        }
      ]
    });
    mockTextToSpeech.speak.mockResolvedValue(undefined);
    mockTextToSpeech.stop.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns empty voices on non-native platforms', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(false);

    await expect(getNativeVoices()).resolves.toEqual([]);
    expect(mockTextToSpeech.getSupportedVoices).not.toHaveBeenCalled();
  });

  it('deduplicates voices by name and prefers local voices', async () => {
    await expect(getNativeVoices()).resolves.toEqual([
      {
        name: 'Portuguese Brazil',
        lang: 'pt-BR',
        localService: true,
        default: true,
        voiceURI: 'local'
      },
      {
        name: 'English US',
        lang: 'en-US',
        localService: true,
        default: false,
        voiceURI: 'en-local'
      }
    ]);
  });

  it('returns empty voices and logs when voice loading fails', async () => {
    const error = new Error('voices failed');
    mockTextToSpeech.getSupportedVoices.mockRejectedValueOnce(error);

    await expect(getNativeVoices()).resolves.toEqual([]);
    expect(console.error).toHaveBeenCalledWith('Failed to get native voices:', error);
  });

  it('speaks with the preferred deduplicated local voice index', async () => {
    await speakWithNative('Hello', 'Portuguese Brazil', 'pt');

    expect(mockTextToSpeech.speak).toHaveBeenCalledWith({
      text: 'Hello',
      lang: 'pt-PT',
      voice: 1,
      rate: 1,
      pitch: 1,
      volume: 1,
      category: 'ambient'
    });
  });

  it('speaks without a voice option when no matching voice exists', async () => {
    await speakWithNative('Hello', 'Missing Voice');

    expect(mockTextToSpeech.speak).toHaveBeenCalledWith({
      text: 'Hello',
      lang: 'en-US',
      rate: 1,
      pitch: 1,
      volume: 1,
      category: 'ambient'
    });
  });

  it('does nothing when speaking on non-native platforms', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(false);

    await speakWithNative('Hello');
    expect(mockTextToSpeech.speak).not.toHaveBeenCalled();
  });

  it('logs when speaking fails', async () => {
    const error = new Error('speak failed');
    mockTextToSpeech.speak.mockRejectedValueOnce(error);

    await speakWithNative('Hello');
    expect(console.error).toHaveBeenCalledWith('Native TTS speak failed:', error);
  });

  it('stops native speech on native platforms', async () => {
    await stopNativeSpeech();
    expect(mockTextToSpeech.stop).toHaveBeenCalledTimes(1);
  });

  it('does nothing when stopping on non-native platforms', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(false);

    await stopNativeSpeech();
    expect(mockTextToSpeech.stop).not.toHaveBeenCalled();
  });

  it('logs when stop fails', async () => {
    const error = new Error('stop failed');
    mockTextToSpeech.stop.mockRejectedValueOnce(error);

    await stopNativeSpeech();
    expect(console.error).toHaveBeenCalledWith('Native TTS stop failed:', error);
  });
});
