import { cn } from '@/lib/utils/cn'

import type { Accent } from '../types'
import styles from './SectionLabel.module.css'

export type SectionLabelAccent = Accent

export interface SectionLabelProps {
  children: React.ReactNode
  className?: string
  accent?: SectionLabelAccent
}

export function SectionLabel({ children, className, accent }: SectionLabelProps) {
  const accentClass =
    accent === 'primary'
      ? styles.accentPrimary
      : accent === 'secondary'
        ? styles.accentSecondary
        : undefined

  return <p className={cn(styles.label, accentClass, className)}>{children}</p>
}
