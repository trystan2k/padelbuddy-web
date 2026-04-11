import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { type SupportedLocale } from '@/lib/i18n/types';

export interface NativeSpeechSynthesisVoice {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
  voiceURI: string;
}

const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export async function getNativeVoices(): Promise<NativeSpeechSynthesisVoice[]> {
  if (!isNativePlatform()) {
    return [];
  }

  try {
    const result = await TextToSpeech.getSupportedVoices();

    // Group by name, preferring local voices over network voices
    const voiceMap = new Map<string, (typeof result.voices)[0]>();

    for (const voice of result.voices) {
      const existing = voiceMap.get(voice.name);

      // Prefer local voices over network voices
      if (!existing || (voice.localService && !existing.localService)) {
        voiceMap.set(voice.name, voice);
      }
    }

    return Array.from(voiceMap.values()).map((voice) => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default,
      voiceURI: voice.voiceURI
    }));
  } catch (error) {
    console.error('Failed to get native voices:', error);
    return [];
  }
}

export async function speakWithNative(
  text: string,
  voiceName?: string,
  lang?: SupportedLocale
): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  try {
    const result = await TextToSpeech.getSupportedVoices();

    // Same deduplication logic as getNativeVoices to ensure consistent indexing
    const voiceMap = new Map<string, number>();

    for (const voice of result.voices) {
      const existingIndex = voiceMap.get(voice.name);
      if (existingIndex === undefined) {
        // First occurrence of this voice name
        voiceMap.set(voice.name, result.voices.indexOf(voice));
      } else {
        // Prefer local voices
        const existingVoice = result.voices[existingIndex];
        if (existingVoice && voice.localService && !existingVoice.localService) {
          voiceMap.set(voice.name, result.voices.indexOf(voice));
        }
      }
    }

    let voiceIndex: number | undefined;

    if (voiceName && voiceMap.has(voiceName)) {
      voiceIndex = voiceMap.get(voiceName);
    }

    const speakOptions: {
      text: string;
      lang: string;
      voice?: number;
      rate: number;
      pitch: number;
      volume: number;
      category: string;
    } = {
      text,
      lang: lang ? `${lang}-${lang.toUpperCase()}` : 'en-US',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      category: 'ambient'
    };

    if (voiceIndex !== undefined) {
      speakOptions.voice = voiceIndex;
    }

    await TextToSpeech.speak(speakOptions);
  } catch (error) {
    console.error('Native TTS speak failed:', error);
  }
}

export async function stopNativeSpeech(): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  try {
    await TextToSpeech.stop();
  } catch (error) {
    console.error('Native TTS stop failed:', error);
  }
}
