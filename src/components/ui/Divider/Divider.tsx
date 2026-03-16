import { cn } from '@/lib/utils/cn'

import styles from './Divider.module.css'

export interface DividerProps {
  className?: string
}

export function Divider({ className }: DividerProps) {
  return <div className={cn(styles.divider, className)} role="separator" />
}
