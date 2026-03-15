import styles from './SectionLabel.module.css'

export type SectionLabelVariant = 'default' | 'team-one' | 'team-two'

export interface SectionLabelProps {
  children: React.ReactNode
  className?: string
  variant?: SectionLabelVariant
}

export function SectionLabel({ children, className, variant = 'default' }: SectionLabelProps) {
  const variantClass =
    variant === 'team-one' ? styles.teamOne : variant === 'team-two' ? styles.teamTwo : ''

  return (
    <p
      className={`${styles.label}${variantClass ? ` ${variantClass}` : ''}${className ? ` ${className}` : ''}`}
    >
      {children}
    </p>
  )
}
