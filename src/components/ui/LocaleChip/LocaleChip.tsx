import { cn } from '@/lib/utils/cn'
import styles from './LocaleChip.module.css'

export interface LocaleChipProps {
  /** Flag emoji to display */
  flag: string
  label: string
  onClick?: () => void
  active?: boolean
  className?: string
  /** For dropdown triggers: indicates whether the dropdown is expanded */
  'aria-expanded'?: boolean
  /** For dropdown triggers: references the controlled element */
  'aria-controls'?: string
}

export function LocaleChip({
  flag,
  label,
  onClick,
  active = false,
  className,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls
}: LocaleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(styles.chip, active && styles.active, className)}
      aria-pressed={ariaExpanded !== undefined ? undefined : active}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      <span aria-hidden="true">{flag}</span>
      <span className={styles.text}>{label}</span>
    </button>
  )
}
