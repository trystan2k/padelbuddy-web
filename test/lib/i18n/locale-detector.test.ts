import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLocale, supportedLocales } from '@/lib/i18n/types';

import { detectBrowserLocale, resolveInitialLocale } from '@/lib/i18n/locale-detector';

describe('locale-detector', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('detectBrowserLocale', () => {
    it('returns locale for supported language (en)', () => {
      vi.stubGlobal('navigator', { language: 'en-US' });
      expect(detectBrowserLocale()).toBe('en');
    });

    it('returns locale for supported language (pt)', () => {
      vi.stubGlobal('navigator', { language: 'pt-BR' });
      expect(detectBrowserLocale()).toBe('pt');
    });

    it('returns locale for supported language (es)', () => {
      vi.stubGlobal('navigator', { language: 'es-ES' });
      expect(detectBrowserLocale()).toBe('es');
    });

    it('returns null for unsupported language (fr)', () => {
      vi.stubGlobal('navigator', { language: 'fr-FR' });
      expect(detectBrowserLocale()).toBeNull();
    });

    it('returns null for unsupported language (de)', () => {
      vi.stubGlobal('navigator', { language: 'de-DE' });
      expect(detectBrowserLocale()).toBeNull();
    });

    it('handles lowercase language codes', () => {
      vi.stubGlobal('navigator', { language: 'EN-us' });
      expect(detectBrowserLocale()).toBe('en');
    });

    it('handles mixed case language codes', () => {
      vi.stubGlobal('navigator', { language: 'Pt-Br' });
      expect(detectBrowserLocale()).toBe('pt');
    });

    it('returns null when navigator is undefined', () => {
      vi.stubGlobal('navigator', undefined);
      expect(detectBrowserLocale()).toBeNull();
    });

    it('handles language codes without region', () => {
      vi.stubGlobal('navigator', { language: 'en' });
      expect(detectBrowserLocale()).toBe('en');
    });
  });

  describe('resolveInitialLocale', () => {
    it('prioritizes stored preference over browser detection', () => {
      expect(resolveInitialLocale('pt', 'es')).toBe('pt');
    });

    it('falls back to browser detection when no stored preference', () => {
      expect(resolveInitialLocale(null, 'es')).toBe('es');
    });

    it('falls back to default when no preference or detection', () => {
      expect(resolveInitialLocale(null, null)).toBe(defaultLocale);
    });

    it('uses stored preference even when it differs from default', () => {
      expect(resolveInitialLocale('es', 'en')).toBe('es');
    });

    it('uses browser detection when available and no stored preference', () => {
      expect(resolveInitialLocale(null, 'pt')).toBe('pt');
    });

    it('returns default locale when both are null', () => {
      const result = resolveInitialLocale(null, null);
      expect(result).toBe('en');
      expect(supportedLocales).toContain(result);
    });
  });
});
