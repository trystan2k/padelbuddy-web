import type { ReactNode } from 'react'

import { Button } from '@base-ui/react/button'

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
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(styles.button, className)}
    >
      {children}
    </Button>
  )
}
