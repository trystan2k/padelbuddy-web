import { useCallback, type ReactNode } from 'react'
import { Button } from '@base-ui/react/button'
import { Toggle } from '@base-ui/react/toggle'

import { cn } from '@/lib/utils/cn'

import styles from './Chip.module.css'

export type ChipVariant = 'toggle' | 'button'
export type ChipSize = 'sm' | 'md'
export type ChipAccent = 'primary' | 'secondary'

export interface ChipProps {
  children: ReactNode
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  variant?: ChipVariant
  size?: ChipSize
  accent?: ChipAccent
  disabled?: boolean
  showDot?: boolean
  className?: string
  /** For dropdown triggers: indicates whether the dropdown is expanded */
  'aria-expanded'?: boolean
  /** For dropdown triggers: references the controlled element */
  'aria-controls'?: string
  /** For dropdown triggers: declares the popup type */
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
}

export function Chip({
  children,
  pressed = false,
  onPressedChange,
  variant = 'toggle',
  size = 'md',
  accent = 'primary',
  disabled = false,
  showDot = false,
  className,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'aria-haspopup': ariaHaspopup
}: ChipProps) {
  const sizeClass = size === 'sm' ? styles.sizeSm : styles.sizeMd
  const accentClass = accent === 'secondary' ? styles.accentSecondary : undefined

  // When aria-expanded is defined, use Button variant for dropdown trigger behavior
  const isDropdownTrigger = ariaExpanded !== undefined
  const effectiveVariant = isDropdownTrigger ? 'button' : variant

  const handleButtonClick = useCallback(() => {
    onPressedChange?.(!pressed)
  }, [onPressedChange, pressed])

  if (effectiveVariant === 'button') {
    return (
      <Button
        onClick={handleButtonClick}
        disabled={disabled}
        className={cn(styles.chip, sizeClass, accentClass, className)}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        aria-haspopup={ariaHaspopup}
        data-pressed={pressed || undefined}
      >
        {showDot && <span className={styles.dot} aria-hidden="true" />}
        {children}
      </Button>
    )
  }

  return (
    <Toggle
      pressed={pressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      className={cn(styles.chip, sizeClass, accentClass, className)}
    >
      {showDot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </Toggle>
  )
}
