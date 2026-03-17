import { Button } from '@base-ui/react/button'
import { Toggle } from '@base-ui/react/toggle'

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
  /** For dropdown triggers: declares the popup type */
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
}

export function LocaleChip({
  flag,
  label,
  onClick,
  active = false,
  className,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'aria-haspopup': ariaHaspopup
}: LocaleChipProps) {
  // When used as dropdown trigger, we need custom aria handling
  const isDropdownTrigger = ariaExpanded !== undefined

  if (isDropdownTrigger) {
    // Dropdown trigger mode - render as Button (no aria-pressed semantics)
    // Manually set data-pressed attribute for visual styling since Button doesn't support pressed prop
    return (
      <Button
        onClick={onClick}
        className={cn(styles.chip, className)}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        aria-haspopup={ariaHaspopup}
        data-pressed={active || undefined}
      >
        <span aria-hidden="true">{flag}</span>
        <span className={styles.text}>{label}</span>
      </Button>
    )
  }

  // Toggle mode - standard toggle behavior (data-pressed is set automatically by Toggle)
  return (
    <Toggle pressed={active} onPressedChange={onClick} className={cn(styles.chip, className)}>
      <span aria-hidden="true">{flag}</span>
      <span className={styles.text}>{label}</span>
    </Toggle>
  )
}
