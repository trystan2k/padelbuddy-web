// Supported locales
export const supportedLocales = ['en', 'pt', 'es'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

// Default locale for fallback
export const defaultLocale: SupportedLocale = 'en';

/**
 * Type guard to check if a string is a valid supported locale.
 */
export function isSupportedLocale(lang: string | undefined): lang is SupportedLocale {
  return typeof lang === 'string' && (supportedLocales as readonly string[]).includes(lang);
}

// Locale preference stored in IndexedDB
export interface LocalePreference {
  locale: SupportedLocale;
  updatedAt: string; // ISO timestamp
}
