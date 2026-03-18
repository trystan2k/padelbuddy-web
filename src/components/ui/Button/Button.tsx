import { forwardRef, type ReactNode } from 'react'
import { Button as BaseButton } from '@base-ui/react/button'

import { cn } from '@/lib/utils/cn'

import styles from './Button.module.css'

export type ButtonVariant = 'solid' | 'outline' | 'soft'
export type ButtonSize = 'sm' | 'lg'
export type ButtonAccent = 'primary' | 'secondary' | 'success'

export interface ButtonProps {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string | undefined
  variant?: ButtonVariant
  size?: ButtonSize
  accent?: ButtonAccent
  testId?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    onClick,
    disabled = false,
    type = 'button',
    className,
    variant = 'solid',
    size = 'lg',
    accent = 'success',
    testId
  },
  ref
) {
  const variantClass =
    variant === 'solid' ? styles.solid : variant === 'outline' ? styles.outline : styles.soft

  const sizeClass = size === 'sm' ? styles.sizeSm : styles.sizeLg

  const accentClass =
    accent === 'primary'
      ? styles.accentPrimary
      : accent === 'secondary'
        ? styles.accentSecondary
        : styles.accentSuccess

  return (
    <BaseButton
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(styles.button, variantClass, sizeClass, accentClass, className)}
      data-testid={testId}
    >
      {children}
    </BaseButton>
  )
})
