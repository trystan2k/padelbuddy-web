import { useCallback, type HTMLAttributes, type ReactNode } from 'react'
import { Button } from '@base-ui/react/button'
import { Toggle } from '@base-ui/react/toggle'

import { cn } from '@/lib/utils/cn'

import styles from './Chip.module.css'

export type ChipVariant = 'toggle' | 'button'
export type ChipSize = 'sm' | 'md'

export interface ChipProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  variant?: ChipVariant
  size?: ChipSize
  disabled?: boolean
  /** When true, renders as a non-interactive div instead of button */
  readonly?: boolean
}

export function Chip({
  children,
  pressed = false,
  onPressedChange,
  variant = 'toggle',
  size = 'md',
  disabled = false,
  className,
  'aria-expanded': ariaExpanded,
  readonly = false,
  ...props
}: ChipProps) {
  const sizeClass = size === 'sm' ? styles.sizeSm : styles.sizeMd

  // When aria-expanded is defined, use Button variant for dropdown trigger behavior
  const isDropdownTrigger = ariaExpanded !== undefined
  const effectiveVariant = isDropdownTrigger ? 'button' : variant

  const handleButtonClick = useCallback(() => {
    onPressedChange?.(!pressed)
  }, [onPressedChange, pressed])

  // Readonly mode: render a non-interactive div
  if (readonly) {
    return (
      <div {...props} className={cn(styles.chip, sizeClass, className)} data-readonly="">
        {children}
      </div>
    )
  }

  if (effectiveVariant === 'button') {
    return (
      <Button
        {...props}
        onClick={handleButtonClick}
        disabled={disabled}
        className={cn(styles.chip, sizeClass, className)}
        aria-expanded={ariaExpanded}
        data-pressed={pressed || undefined}
      >
        {children}
      </Button>
    )
  }

  return (
    <Toggle
      {...props}
      pressed={pressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      className={cn(styles.chip, sizeClass, className)}
    >
      {children}
    </Toggle>
  )
}
