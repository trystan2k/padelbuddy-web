import type { ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

import type { Accent } from '../types'
import styles from './Card.module.css'

export type CardAccent = Accent

export interface CardProps {
  children: ReactNode
  className?: string | undefined
  accent?: CardAccent
  testId?: string
}

export function Card({ children, className, accent, testId }: CardProps) {
  const accentClass =
    accent === 'primary'
      ? styles.accentPrimary
      : accent === 'secondary'
        ? styles.accentSecondary
        : undefined

  return (
    <div className={cn(styles.card, accentClass, className)} data-testid={testId}>
      {children}
    </div>
  )
}
