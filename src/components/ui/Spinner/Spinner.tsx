import { type ComponentPropsWithoutRef, type Ref } from 'react'

import { cn } from '@/lib/utils/cn'

import styles from './Spinner.module.css'

export type SpinnerSize = 'sm' | 'md' | 'lg'
export type SpinnerColor = 'primary' | 'secondary'

export interface SpinnerProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  ref?: Ref<HTMLSpanElement>
  size?: SpinnerSize
  color?: SpinnerColor
  label?: string
  silent?: boolean
}

export function Spinner({
  className,
  size = 'md',
  color = 'primary',
  label = 'Loading',
  silent = false,
  ref,
  ...props
}: SpinnerProps) {
  const sizeClass = size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd
  const colorClass = color === 'secondary' ? styles.colorSecondary : styles.colorPrimary

  return (
    <span
      ref={ref}
      className={cn(styles.spinner, sizeClass, colorClass, className)}
      {...(silent ? {} : { role: 'status', 'aria-live': 'polite' })}
      aria-busy="true"
      aria-label={label}
      {...props}
    >
      <span className={styles.indicator} aria-hidden="true" />
      <span className={styles.visuallyHidden}>{label}</span>
    </span>
  )
}
