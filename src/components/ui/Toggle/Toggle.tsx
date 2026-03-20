import type { HTMLAttributes } from 'react'

import { Switch } from '@base-ui/react/switch'

import { cn } from '@/lib/utils/cn'

import styles from './Toggle.module.css'

export interface ToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
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
  ...props
}: ToggleProps) {
  return (
    <div className={cn(styles.row, className)} {...props}>
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
      >
        <Switch.Thumb className={styles.thumb} />
      </Switch.Root>
    </div>
  )
}
