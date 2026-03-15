import { cn } from '@/lib/utils/cn'

import styles from './Card.module.css'

export type CardVariant = 'default' | 'team-one' | 'team-two'

export interface CardProps {
  children: React.ReactNode
  className?: string | undefined
  variant?: CardVariant
}

export function Card({ children, className, variant = 'default' }: CardProps) {
  const variantClass =
    variant === 'team-one' ? styles.teamOne : variant === 'team-two' ? styles.teamTwo : undefined

  return <div className={cn(styles.card, variantClass, className)}>{children}</div>
}
