import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import type { InitOptions } from 'i18next'

import { defaultLocale, supportedLocales, type SupportedLocale } from './types'
import { detectBrowserLocale, resolveInitialLocale } from './locale-detector'
import { loadLocalePreference, saveLocalePreference } from './locale-storage'

let initializationPromise: Promise<void> | null = null

/**
 * Resets the initialization state. For testing purposes only.
 * @internal
 */
export function resetI18nInitialization(): void {
  initializationPromise = null
}

// Cast to readonly string array for type-safe includes check
const supportedLocaleValues: readonly string[] = supportedLocales

export interface InitializeI18nOptions {
  /**
   * Whether to skip the HTTP backend for loading translations.
   * Set to true for tests that add resources manually.
   * Defaults to false (uses HttpBackend).
   */
  skipBackend?: boolean
}

/**
 * Initializes the i18n system. Should be called once at app startup.
 * Loads stored preference, detects browser language, and configures react-i18next.
 *
 * @param options - Configuration options for i18n initialization
 * @param options.skipBackend - Set to true to skip backend loading (for tests)
 */
export async function initializeI18n(options: InitializeI18nOptions = {}): Promise<void> {
  // Return existing promise if already initializing
  if (initializationPromise) {
    return initializationPromise
  }

  initializationPromise = (async () => {
    // Try to load stored preference, but don't fail if IndexedDB is unavailable
    let storedPreference = null
    try {
      storedPreference = await loadLocalePreference()
    } catch {
      // IndexedDB not available (e.g., in test environment), use null
    }
    const browserLocale = detectBrowserLocale()
    const initialLocale = resolveInitialLocale(storedPreference, browserLocale)

    const baseConfig: InitOptions = {
      lng: initialLocale,
      fallbackLng: defaultLocale,
      supportedLngs: [...supportedLocales],
      interpolation: {
        escapeValue: false // React already escapes values
      },
      react: {
        useSuspense: false
      }
    }

    if (options.skipBackend) {
      // No backend - tests should add resources manually
      await i18n.use(initReactI18next).init({
        ...baseConfig,
        resources: {}
      })
    } else {
      await i18n
        .use(HttpBackend)
        .use(initReactI18next)
        .init({
          ...baseConfig,
          backend: {
            loadPath: '/locales/{{lng}}.json'
          }
        })
    }
  })()

  return initializationPromise
}

/**
 * Changes the current locale and persists the preference.
 */
export async function changeLocale(locale: SupportedLocale): Promise<void> {
  // Try to save preference, but don't fail if IndexedDB is unavailable
  try {
    await saveLocalePreference(locale)
  } catch {
    // IndexedDB not available, continue without persistence
  }
  await i18n.changeLanguage(locale)
}

/**
 * Type guard to check if a language string is a valid supported locale.
 */
function isValidLocale(lang: string | undefined): lang is SupportedLocale {
  return typeof lang === 'string' && supportedLocaleValues.includes(lang)
}

/**
 * Gets the current locale.
 */
export function getCurrentLocale(): SupportedLocale {
  const currentLang = i18n.language

  if (isValidLocale(currentLang)) {
    return currentLang
  }

  return defaultLocale
}

export { i18n }
