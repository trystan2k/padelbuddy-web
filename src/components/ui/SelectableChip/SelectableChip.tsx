import type { ReactNode } from 'react'

import { Toggle } from '@base-ui/react/toggle'

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

  return (
    <Toggle
      pressed={selected}
      onPressedChange={onClick}
      disabled={disabled}
      className={cn(styles.chip, accentClass, className)}
    >
      <span className={styles.content}>
        {showDot && accent && <span className={styles.dot} aria-hidden="true" />}
        {children}
      </span>
    </Toggle>
  )
}
