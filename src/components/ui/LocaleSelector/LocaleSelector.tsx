import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Chip } from '@/components/ui/Chip/Chip';
import { changeLocale } from '@/lib/i18n/i18n';
import { isSupportedLocale, supportedLocales, type SupportedLocale } from '@/lib/i18n/types';
import { LOCALE_FLAGS, LOCALE_LABELS } from '@/lib/i18n/locale-display';

import styles from './LocaleSelector.module.css';

export interface LocaleSelectorProps {
  currentLocale?: SupportedLocale;
  onLocaleChange?: (locale: SupportedLocale) => void;
}

export function LocaleSelector({
  currentLocale: controlledLocale,
  onLocaleChange
}: LocaleSelectorProps) {
  const { t, i18n } = useTranslation();
  const [showLocaleMenu, setShowLocaleMenu] = useState(false);

  const rawLocale = i18n.resolvedLanguage || i18n.language;
  const currentLocale = controlledLocale ?? (isSupportedLocale(rawLocale) ? rawLocale : 'en');

  const handleLocaleMenuToggle = useCallback(() => {
    setShowLocaleMenu((prev) => !prev);
  }, []);

  const handleLocaleChange = useCallback(
    async (locale: SupportedLocale) => {
      if (locale !== currentLocale) {
        let localeChanged = false;

        try {
          await changeLocale(locale);
          localeChanged = true;
        } catch (error: unknown) {
          console.error('Failed to change locale:', error);
        }

        if (localeChanged) {
          onLocaleChange?.(locale);
        }
      }
      setShowLocaleMenu(false);
    },
    [currentLocale, onLocaleChange]
  );

  const createLocaleClickHandler = useCallback(
    (locale: SupportedLocale) => () => handleLocaleChange(locale),
    [handleLocaleChange]
  );

  return (
    <div className={styles.localeWrapper}>
      <Chip
        variant="button"
        size="sm"
        pressed={showLocaleMenu}
        onPressedChange={handleLocaleMenuToggle}
        aria-expanded={showLocaleMenu}
        aria-haspopup="true"
        {...(showLocaleMenu && { 'aria-controls': 'locale-menu' })}
      >
        <span aria-hidden="true">{LOCALE_FLAGS[currentLocale]}</span>
        <span className={styles.localeLabel}>{LOCALE_LABELS[currentLocale]}</span>
      </Chip>
      {showLocaleMenu && (
        <div
          id="locale-menu"
          className={styles.localeMenu}
          role="group"
          aria-label={t('setup.locale.selectLanguage')}
        >
          {supportedLocales.map((locale) => (
            <Chip
              key={locale}
              size="sm"
              pressed={locale === currentLocale}
              onPressedChange={createLocaleClickHandler(locale)}
            >
              <span aria-hidden="true">{LOCALE_FLAGS[locale]}</span>
              <span className={styles.localeLabel}>{LOCALE_LABELS[locale]}</span>
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
