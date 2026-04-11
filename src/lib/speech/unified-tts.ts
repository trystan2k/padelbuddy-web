import {
  getAvailableVoices as getBrowserVoices,
  selectVoice as selectBrowserVoice,
  findVoiceByName as findBrowserVoiceByName,
  getAllVoicesGroupedByLocale as groupBrowserVoicesByLocale,
  getVoiceId as getBrowserVoiceId,
  getLanguageDisplayName
} from './voice-selector';
import { type SupportedLocale } from '@/lib/i18n/types';
import { Capacitor } from '@capacitor/core';
import {
  getNativeVoices,
  speakWithNative,
  stopNativeSpeech,
  type NativeSpeechSynthesisVoice
} from './native-tts';

export type { NativeSpeechSynthesisVoice };

export { getLanguageDisplayName, isNativePlatform };

const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export type UnifiedVoice = SpeechSynthesisVoice | NativeSpeechSynthesisVoice;

export async function getAvailableVoices(signal?: AbortSignal): Promise<UnifiedVoice[]> {
  if (signal?.aborted) {
    return [];
  }

  if (isNativePlatform()) {
    const nativeVoices = await getNativeVoices();
    if (nativeVoices.length > 0) {
      return nativeVoices;
    }
  }
  return getBrowserVoices(signal);
}

export function getAllVoicesGroupedByLocale(
  voices: UnifiedVoice[]
): Record<string, UnifiedVoice[]> {
  return groupBrowserVoicesByLocale(voices as SpeechSynthesisVoice[]);
}

export function getVoiceId(voice: UnifiedVoice): string {
  return getBrowserVoiceId(voice as SpeechSynthesisVoice);
}

export function findVoiceByName(name: string, voices: UnifiedVoice[]): UnifiedVoice | undefined {
  return voices.find((v) => v.name === name);
}

export function selectVoice(locale: SupportedLocale, voices: UnifiedVoice[]): UnifiedVoice | null {
  return getDefaultVoiceForLocale(locale, voices);
}

export function getDefaultVoiceForLocale(
  locale: SupportedLocale,
  voices: UnifiedVoice[]
): UnifiedVoice | null {
  const localeVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith(locale.toLowerCase())
  );

  if (localeVoices.length === 0) {
    return selectBrowserVoice(locale, voices as SpeechSynthesisVoice[]) as UnifiedVoice | null;
  }

  const localVoice = localeVoices.find((voice) => voice.localService);
  return localVoice ?? localeVoices[0] ?? null;
}

export async function speakWithVoice(
  text: string,
  voiceName?: string,
  lang?: SupportedLocale
): Promise<void> {
  if (isNativePlatform()) {
    await speakWithNative(text, voiceName, lang);
  } else {
    if (typeof speechSynthesis !== 'undefined') {
      const utterance = new SpeechSynthesisUtterance(text);
      if (voiceName) {
        const voices = speechSynthesis.getVoices();
        const voice = findBrowserVoiceByName(voiceName, voices);
        if (voice) {
          utterance.voice = voice;
        }
      }
      if (lang) {
        utterance.lang = lang;
      }
      speechSynthesis.speak(utterance);
    }
  }
}

export async function stopSpeech(): Promise<void> {
  if (isNativePlatform()) {
    await stopNativeSpeech();
  } else {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
  }
}
