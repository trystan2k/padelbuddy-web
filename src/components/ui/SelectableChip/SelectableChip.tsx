import styles from './SelectableChip.module.css'

export type SelectableChipVariant = 'default' | 'team-one' | 'team-two'

export interface SelectableChipProps {
  children: React.ReactNode
  selected: boolean
  onClick: () => void
  variant?: SelectableChipVariant
  disabled?: boolean
  className?: string
  showDot?: boolean
}

export function SelectableChip({
  children,
  selected,
  onClick,
  variant = 'default',
  disabled = false,
  className,
  showDot = false
}: SelectableChipProps) {
  const variantClass =
    variant === 'team-one' ? styles.teamOne : variant === 'team-two' ? styles.teamTwo : ''

  const selectedClass = selected ? styles.selected : ''

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${styles.chip}${variantClass ? ` ${variantClass}` : ''}${selectedClass ? ` ${selectedClass}` : ''}${className ? ` ${className}` : ''}`}
      aria-pressed={selected}
    >
      <span className={styles.content}>
        {showDot && (variant === 'team-one' || variant === 'team-two') && (
          <span className={styles.dot} aria-hidden="true" />
        )}
        {children}
      </span>
    </button>
  )
}
