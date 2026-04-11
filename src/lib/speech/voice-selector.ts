import { type SupportedLocale } from '@/lib/i18n/types';

/**
 * Returns the native display name for a language code using Intl.DisplayNames.
 * Falls back to the raw code if the API is unavailable or the code is unrecognised.
 * Examples: 'es' → 'español', 'en' → 'English', 'pt' → 'português'
 */
export function getLanguageDisplayName(langCode: string): string {
  try {
    const name = new Intl.DisplayNames([langCode, 'en'], { type: 'language' }).of(langCode);
    return name ?? langCode;
  } catch {
    return langCode;
  }
}

/**
 * Selects the best available voice for the given locale.
 * Priority: Google locale voice > locale voice > English voice > null (graceful mute)
 */
export function selectVoice(
  locale: SupportedLocale,
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  const googleVoice = voices.find(
    (voice) =>
      voice.name.toLowerCase().includes('google') &&
      voice.lang.toLowerCase().startsWith(locale.toLowerCase())
  );

  if (googleVoice) {
    return googleVoice;
  }

  // Try to find voice matching locale
  const localeVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith(locale.toLowerCase())
  );

  if (localeVoice) {
    return localeVoice;
  }

  // Fallback to English voice
  const englishVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('en'));

  return englishVoice ?? null;
}

/**
 * Gets all available voices from the browser's speech synthesis API.
 * Returns a promise that resolves when voices are loaded.
 * @param signal - Optional AbortSignal to cancel the operation
 */
export function getAvailableVoices(signal?: AbortSignal): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Operation aborted'));
      return;
    }

    if (typeof speechSynthesis === 'undefined') {
      resolve([]);
      return;
    }

    const voices = speechSynthesis.getVoices();

    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    let settled = false;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (settled) return;
      settled = true;
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      speechSynthesis?.removeEventListener('voiceschanged', handleVoicesChanged);
      signal?.removeEventListener('abort', handleAbort);
    };

    const handleVoicesChanged = () => {
      const loadedVoices = speechSynthesis.getVoices();
      if (loadedVoices.length > 0) {
        cleanup();
        resolve(loadedVoices);
      }
    };

    const handleAbort = () => {
      cleanup();
      reject(new Error('Operation aborted'));
    };

    const startPolling = () => {
      pollInterval = setInterval(() => {
        const currentVoices = speechSynthesis.getVoices();
        if (currentVoices.length > 0) {
          cleanup();
          resolve(currentVoices);
        }
      }, 500);
    };

    timeoutId = setTimeout(() => {
      cleanup();
      const finalVoices = speechSynthesis.getVoices();
      resolve(finalVoices.length > 0 ? finalVoices : []);
    }, 10000);

    speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    signal?.addEventListener('abort', handleAbort);

    startPolling();
  });
}

export function getAllVoicesGroupedByLocale(
  voices: SpeechSynthesisVoice[]
): Record<string, SpeechSynthesisVoice[]> {
  return voices.reduce<Record<string, SpeechSynthesisVoice[]>>((groupedVoices, voice) => {
    const rawPrefix = (voice.lang ?? '').split('-')[0]?.toLowerCase().trim();
    const localePrefix = rawPrefix || 'other';

    if (!groupedVoices[localePrefix]) {
      groupedVoices[localePrefix] = [];
    }

    groupedVoices[localePrefix].push(voice);
    return groupedVoices;
  }, {});
}

/**
 * Produces a stable unique identifier for a voice based on its voiceURI and lang.
 * This avoids the problem of multiple voices sharing the same human-readable name
 * across locales or OS versions, where `name` alone is not unique.
 */
export function getVoiceId(voice: SpeechSynthesisVoice): string {
  return `${voice.voiceURI}::${voice.lang}`;
}

/**
 * Finds a voice by its name.
 */
export function findVoiceByName(
  name: string,
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | undefined {
  return voices.find((voice) => voice.name === name);
}

/**
 * Gets the default voice for a locale, preferring local voices.
 */
export function getDefaultVoiceForLocale(
  locale: SupportedLocale,
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  const localeVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith(locale.toLowerCase())
  );

  if (localeVoices.length === 0) {
    return selectVoice(locale, voices);
  }

  // Prefer local (non-network) voices
  const localVoice = localeVoices.find((voice) => voice.localService);

  return localVoice ?? localeVoices[0] ?? null;
}
