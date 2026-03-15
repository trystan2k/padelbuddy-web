import { Switch } from '@base-ui/react/switch'

import styles from './Toggle.module.css'

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  hint?: string
  disabled?: boolean
  className?: string
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled = false,
  className
}: ToggleProps) {
  return (
    <div className={`${styles.row}${className ? ` ${className}` : ''}`}>
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
