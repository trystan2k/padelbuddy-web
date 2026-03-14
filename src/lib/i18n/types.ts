// Supported locales
export const supportedLocales = ['en', 'pt', 'es'] as const
export type SupportedLocale = (typeof supportedLocales)[number]

// Default locale for fallback
export const defaultLocale: SupportedLocale = 'en'

// Locale preference stored in IndexedDB
export interface LocalePreference {
  locale: SupportedLocale
  updatedAt: string // ISO timestamp
}

// i18n configuration options
export interface I18nConfig {
  fallbackLng: SupportedLocale
  supportedLngs: SupportedLocale[]
  detection: {
    order: ('localStorage' | 'navigator')[]
    caches: 'localStorage'[]
    lookupLocalStorage: string
  }
}
