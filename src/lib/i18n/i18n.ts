// oxlint-disable import/no-named-as-default-member
import i18n from 'i18next'
import type { InitOptions } from 'i18next'
import { initReactI18next } from 'react-i18next'

import { detectBrowserLocale, resolveInitialLocale } from './locale-detector'
import { loadLocalePreference, saveLocalePreference } from './locale-storage'
import enTranslation from './locales/en'
import { loadLocaleResource } from './resources'
import { defaultLocale, isSupportedLocale, supportedLocales, type SupportedLocale } from './types'

let baseInitializationPromise: Promise<void> | null = null
let localeReconciliationPromise: Promise<void> | null = null

/**
 * Resets the initialization state. For testing purposes only.
 * @internal
 */
/**
 * Resets the initialization state. For testing purposes only.
 * @internal
 */
export async function resetI18nInitialization(): Promise<void> {
  localeReconciliationPromise = null

  for (const locale of supportedLocales) {
    if (locale === defaultLocale || !i18n.hasResourceBundle(locale, 'translation')) {
      continue
    }

    i18n.removeResourceBundle(locale, 'translation')
  }

  await i18n.changeLanguage(defaultLocale)
}

/**
 * Initializes the i18n system. The default locale is bundled synchronously,
 * while persisted/browser locale reconciliation happens asynchronously.
 */
export async function initializeI18n(): Promise<void> {
  await ensureBaseInitialization()

  if (localeReconciliationPromise) {
    return localeReconciliationPromise
  }

  localeReconciliationPromise = reconcileInitialLocale().catch((error) => {
    localeReconciliationPromise = null
    throw error
  })

  return localeReconciliationPromise
}

async function ensureBaseInitialization(): Promise<void> {
  if (!baseInitializationPromise) {
    baseInitializationPromise = i18n
      .use(initReactI18next)
      .init(createBaseConfig())
      .then(() => undefined)
  }

  await baseInitializationPromise
}

function createBaseConfig(): InitOptions {
  return {
    lng: defaultLocale,
    fallbackLng: defaultLocale,
    supportedLngs: [...supportedLocales],
    defaultNS: 'translation',
    ns: ['translation'],
    partialBundledLanguages: true,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    },
    resources: {
      [defaultLocale]: {
        translation: enTranslation
      }
    }
  }
}

async function reconcileInitialLocale(): Promise<void> {
  let storedPreference: SupportedLocale | null = null

  try {
    storedPreference = await loadLocalePreference()
  } catch {
    storedPreference = null
  }

  const browserLocale = detectBrowserLocale()
  const initialLocale = resolveInitialLocale(storedPreference, browserLocale)

  await applyLocale(initialLocale)
}

async function applyLocale(locale: SupportedLocale): Promise<void> {
  await ensureLocaleResource(locale)

  if (i18n.resolvedLanguage === locale || i18n.language === locale) {
    return
  }

  await i18n.changeLanguage(locale)
}

async function ensureLocaleResource(locale: SupportedLocale): Promise<void> {
  if (i18n.hasResourceBundle(locale, 'translation')) {
    return
  }

  const resource = await loadLocaleResource(locale)
  i18n.addResourceBundle(locale, 'translation', resource.translation, true, true)
}

/**
 * Changes the current locale and persists the preference.
 */
export async function changeLocale(locale: SupportedLocale): Promise<void> {
  await ensureBaseInitialization()
  await ensureLocaleResource(locale)

  // Try to save preference, but don't fail if IndexedDB is unavailable
  try {
    await saveLocalePreference(locale)
  } catch {
    // IndexedDB not available, continue without persistence
  }
  await i18n.changeLanguage(locale)
}

/**
 * Gets the current locale.
 */
export function getCurrentLocale(): SupportedLocale {
  const currentLang = i18n.resolvedLanguage ?? i18n.language

  if (isSupportedLocale(currentLang)) {
    return currentLang
  }

  return defaultLocale
}

export { i18n }

void ensureBaseInitialization()
