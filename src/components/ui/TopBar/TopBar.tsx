import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  changeLocale,
  isSupportedLocale,
  LOCALE_FLAGS,
  LOCALE_LABELS,
  supportedLocales,
  type SupportedLocale
} from '@/lib/i18n'

import { Chip } from '@/components/ui/Chip'
import { cn } from '@/lib/utils/cn'

import styles from './TopBar.module.css'

export interface TopBarProps {
  /** App icon image source */
  iconSrc?: string
  /** App icon alt text (for accessibility, defaults to empty for decorative) */
  iconAlt?: string
  /** App name/title */
  title?: string
  /** Subtitle text */
  subtitle?: string
  /** Whether to show the locale selector dropdown */
  showLocaleSelector?: boolean
  /** Current locale (defaults to i18n resolved language) */
  currentLocale?: SupportedLocale
  /** Callback when locale changes */
  onLocaleChange?: (locale: SupportedLocale) => void
  /** Additional CSS class */
  className?: string
}

export function TopBar({
  iconSrc,
  iconAlt = '',
  title,
  subtitle,
  showLocaleSelector = false,
  currentLocale: controlledLocale,
  onLocaleChange,
  className
}: TopBarProps) {
  const { t, i18n } = useTranslation()
  const [showLocaleMenu, setShowLocaleMenu] = useState(false)

  // Use controlled locale or derive from i18n
  const rawLocale = i18n.resolvedLanguage || i18n.language
  const currentLocale = controlledLocale ?? (isSupportedLocale(rawLocale) ? rawLocale : 'en')

  const handleLocaleMenuToggle = useCallback(() => {
    setShowLocaleMenu((prev) => !prev)
  }, [])

  const handleLocaleChange = useCallback(
    async (locale: SupportedLocale) => {
      if (locale !== currentLocale) {
        await changeLocale(locale)
        onLocaleChange?.(locale)
      }
      setShowLocaleMenu(false)
    },
    [currentLocale, onLocaleChange]
  )

  const createLocaleClickHandler = useCallback(
    (locale: SupportedLocale) => () => handleLocaleChange(locale),
    [handleLocaleChange]
  )

  const hasBranding = iconSrc || title || subtitle

  return (
    <div className={cn(styles.container, className)}>
      {hasBranding && (
        <div className={styles.branding}>
          <div className={styles.titleRow}>
            {iconSrc && (
              <img
                src={iconSrc}
                alt={iconAlt}
                aria-hidden={iconAlt ? undefined : true}
                className={styles.icon}
              />
            )}
            {title && <h1 className={styles.appName}>{title}</h1>}
          </div>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}

      {showLocaleSelector && (
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
      )}
    </div>
  )
}
