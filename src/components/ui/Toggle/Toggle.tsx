import { useCallback, type ButtonHTMLAttributes, type MouseEvent } from 'react'

import { Switch } from '@base-ui/react/switch'

import { cn } from '@/lib/utils/cn'

import styles from './Toggle.module.css'

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  hint?: string
  disabled?: boolean
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled = false,
  className,
  onClick,
  onKeyDown,
  ...props
}: ToggleProps) {
  const toggle = useCallback(() => {
    if (disabled) {
      return
    }

    onChange(!checked)
  }, [checked, disabled, onChange])

  const handleRowClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      toggle()
      onClick?.(event)
    },
    [onClick, toggle]
  )

  const handleSwitchClick = useCallback((event: { stopPropagation: () => void }) => {
    event.stopPropagation()
  }, [])

  return (
    <button
      type="button"
      className={cn(styles.row, disabled && styles.rowDisabled, className)}
      onClick={handleRowClick}
      onKeyDown={onKeyDown}
      disabled={disabled}
      {...props}
    >
      <div className={styles.labelGroup}>
        <span className={styles.title}>{label}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
      <Switch.Root
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className={styles.switch}
        aria-label={label}
        onClick={handleSwitchClick}
        tabIndex={-1}
      >
        <Switch.Thumb className={styles.thumb} />
      </Switch.Root>
    </button>
  )
}
