import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  changeLocale,
  LOCALE_FLAGS,
  LOCALE_LABELS,
  supportedLocales,
  type SupportedLocale
} from '@/lib/i18n'

import { LocaleChip } from '@/components/ui'

import styles from './TopBar.module.css'

export interface TopBarProps {
  currentLocale: SupportedLocale
}

/**
 * TopBar component - Header for the Active Match Screen.
 * Follows Pencil design node ID: eFLga
 * Height: 64px
 */
export function TopBar({ currentLocale }: TopBarProps) {
  const { t } = useTranslation()
  const [showLocaleMenu, setShowLocaleMenu] = useState(false)

  const handleLocaleMenuToggle = useCallback(() => {
    setShowLocaleMenu((prev) => !prev)
  }, [])

  const handleLocaleChange = useCallback(
    async (locale: SupportedLocale) => {
      if (locale !== currentLocale) {
        await changeLocale(locale)
      }
      setShowLocaleMenu(false)
    },
    [currentLocale]
  )

  const createLocaleClickHandler = useCallback(
    (locale: SupportedLocale) => () => handleLocaleChange(locale),
    [handleLocaleChange]
  )

  return (
    <div className={styles.container}>
      <div className={styles.matchMeta}>
        <div className={styles.titleRow}>
          <img alt="" aria-hidden="true" className={styles.icon} src="/icon.png" />
          <h1 className={styles.appName}>{t('match.header.appName')}</h1>
        </div>
        <p className={styles.subtitle}>{t('match.header.subtitle')}</p>
      </div>
      <div className={styles.localeWrapper}>
        <LocaleChip
          flag={LOCALE_FLAGS[currentLocale]}
          label={LOCALE_LABELS[currentLocale]}
          onClick={handleLocaleMenuToggle}
          active
          aria-expanded={showLocaleMenu}
          aria-haspopup="true"
          {...(showLocaleMenu && { 'aria-controls': 'locale-menu' })}
        />
        {showLocaleMenu && (
          <div
            id="locale-menu"
            className={styles.localeMenu}
            role="group"
            aria-label={t('setup.locale.selectLanguage')}
          >
            {supportedLocales.map((locale) => (
              <LocaleChip
                key={locale}
                flag={LOCALE_FLAGS[locale]}
                label={LOCALE_LABELS[locale]}
                onClick={createLocaleClickHandler(locale)}
                active={locale === currentLocale}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
