import { defaultLocale, isSupportedLocale, type SupportedLocale } from './types'

/**
 * Detects the browser's preferred language and maps it to a supported locale.
 * Returns null if the browser language is not one of our supported locales.
 */
export function detectBrowserLocale(): SupportedLocale | null {
  if (typeof navigator === 'undefined') {
    return null
  }

  const browserLang = navigator.language
  const primaryLang = browserLang.split('-')[0]?.toLowerCase()

  if (!primaryLang) {
    return null
  }

  if (isSupportedLocale(primaryLang)) {
    return primaryLang
  }

  return null
}

/**
 * Resolves the initial locale based on priority:
 * 1. Stored preference (from IndexedDB)
 * 2. Browser detection
 * 3. Default locale (fallback)
 */
export function resolveInitialLocale(
  storedPreference: SupportedLocale | null,
  browserDetected: SupportedLocale | null
): SupportedLocale {
  // Priority: stored preference > browser detection > default
  return storedPreference ?? browserDetected ?? defaultLocale
}
