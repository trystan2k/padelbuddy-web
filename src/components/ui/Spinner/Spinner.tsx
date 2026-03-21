import { forwardRef, type ComponentPropsWithoutRef } from 'react'

import { cn } from '@/lib/utils/cn'

import styles from './Spinner.module.css'

export type SpinnerSize = 'sm' | 'md' | 'lg'
export type SpinnerColor = 'primary' | 'secondary'

export interface SpinnerProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  size?: SpinnerSize
  color?: SpinnerColor
  label?: string
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { className, size = 'md', color = 'primary', label = 'Loading', ...props },
  ref
) {
  const sizeClass = size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd
  const colorClass = color === 'secondary' ? styles.colorSecondary : styles.colorPrimary

  return (
    <span
      ref={ref}
      className={cn(styles.spinner, sizeClass, colorClass, className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      {...props}
    >
      <span className={styles.indicator} aria-hidden="true" />
      <span className={styles.visuallyHidden}>{label}</span>
    </span>
  )
})
