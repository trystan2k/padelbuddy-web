import type { SupportedLocale } from '@/lib/i18n/types'

import styles from './LocaleChip.module.css'

export interface LocaleChipProps {
  locale: SupportedLocale
  label: string
  onClick?: () => void
  active?: boolean
  className?: string
}

const localeFlags: Record<SupportedLocale, string> = {
  en: '🇺🇸',
  pt: '🇧🇷',
  es: '🇪🇸'
}

export function LocaleChip({ locale, label, onClick, active = false, className }: LocaleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.chip}${active ? ` ${styles.active}` : ''}${className ? ` ${className}` : ''}`}
      aria-pressed={active}
    >
      <span aria-hidden="true">{localeFlags[locale]}</span>
      <span className={styles.text}>{label}</span>
    </button>
  )
}
