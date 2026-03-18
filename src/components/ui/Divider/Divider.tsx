import { Separator } from '@base-ui/react/separator'

import { cn } from '@/lib/utils/cn'

import styles from './Divider.module.css'

export interface DividerProps {
  className?: string
}

export function Divider({ className }: DividerProps) {
  return <Separator orientation="horizontal" className={cn(styles.divider, className)} />
}
