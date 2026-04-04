import type { ReactNode, HTMLAttributes } from 'react'

import { cn } from '@/lib/utils/cn'

import type { Accent } from '@/components/ui/types'
import styles from './Card.module.css'

export type CardAccent = Accent

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string | undefined
  accent?: CardAccent
}

export function Card({ children, className, accent, ...props }: CardProps) {
  const accentClass =
    accent === 'primary'
      ? styles.accentPrimary
      : accent === 'secondary'
        ? styles.accentSecondary
        : undefined

  return (
    <div {...props} className={cn(styles.card, accentClass, className)}>
      {children}
    </div>
  )
}
