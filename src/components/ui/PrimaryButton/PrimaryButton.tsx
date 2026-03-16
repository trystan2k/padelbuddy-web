import type { ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

import styles from './PrimaryButton.module.css'

export interface PrimaryButtonProps {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className
}: PrimaryButtonProps) {
  return (
    <button
      // oxlint-disable-next-line button-has-type -- Type is validated by TypeScript, defaults to 'button'
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(styles.button, className)}
    >
      {children}
    </button>
  )
}
