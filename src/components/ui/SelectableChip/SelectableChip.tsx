import type { ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

import type { Accent } from '../types'
import styles from './SelectableChip.module.css'

export type SelectableChipAccent = Accent

export interface SelectableChipProps {
  children: ReactNode
  selected: boolean
  onClick: () => void
  accent?: SelectableChipAccent
  disabled?: boolean
  className?: string
  showDot?: boolean
}

export function SelectableChip({
  children,
  selected,
  onClick,
  accent,
  disabled = false,
  className,
  showDot = false
}: SelectableChipProps) {
  const accentClass =
    accent === 'primary'
      ? styles.accentPrimary
      : accent === 'secondary'
        ? styles.accentSecondary
        : undefined

  const selectedClass = selected ? styles.selected : undefined

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(styles.chip, accentClass, selectedClass, className)}
      aria-pressed={selected}
    >
      <span className={styles.content}>
        {showDot && accent && <span className={styles.dot} aria-hidden="true" />}
        {children}
      </span>
    </button>
  )
}
