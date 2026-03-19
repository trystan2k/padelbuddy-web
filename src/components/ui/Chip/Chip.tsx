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
  className?: string | undefined
  /** For dropdown triggers: indicates whether the dropdown is expanded */
  'aria-expanded'?: boolean
  /** For dropdown triggers: references the controlled element */
  'aria-controls'?: string
  /** For dropdown triggers: declares the popup type */
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
  /** When true, renders as a non-interactive div instead of button */
  readonly?: boolean
  /** Custom role for readonly mode (e.g., "timer", "status") */
  role?: string
  /** Accessible label for readonly mode */
  'aria-label'?: string
  /** Test ID for testing */
  testId?: string
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
  'aria-haspopup': ariaHaspopup,
  readonly = false,
  role,
  'aria-label': ariaLabel,
  testId
}: ChipProps) {
  const sizeClass = size === 'sm' ? styles.sizeSm : styles.sizeMd
  const accentClass = accent === 'secondary' ? styles.accentSecondary : undefined

  // When aria-expanded is defined, use Button variant for dropdown trigger behavior
  const isDropdownTrigger = ariaExpanded !== undefined
  const effectiveVariant = isDropdownTrigger ? 'button' : variant

  const handleButtonClick = useCallback(() => {
    onPressedChange?.(!pressed)
  }, [onPressedChange, pressed])

  // Readonly mode: render a non-interactive div
  if (readonly) {
    return (
      <div
        className={cn(styles.chip, sizeClass, accentClass, className)}
        role={role}
        aria-label={ariaLabel}
        data-testid={testId}
        data-readonly=""
      >
        {showDot && <span className={styles.dot} aria-hidden="true" />}
        {children}
      </div>
    )
  }

  if (effectiveVariant === 'button') {
    return (
      <Button
        onClick={handleButtonClick}
        disabled={disabled}
        className={cn(styles.chip, sizeClass, accentClass, className)}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        aria-haspopup={ariaHaspopup}
        aria-label={ariaLabel}
        data-testid={testId}
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
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {showDot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </Toggle>
  )
}
