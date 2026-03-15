import styles from './Divider.module.css'

export interface DividerProps {
  className?: string
}

export function Divider({ className }: DividerProps) {
  return <div className={`${styles.divider}${className ? ` ${className}` : ''}`} role="separator" />
}
