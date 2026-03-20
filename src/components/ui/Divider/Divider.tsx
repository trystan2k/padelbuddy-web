import type { HTMLAttributes } from 'react'

import { Separator } from '@base-ui/react/separator'

import { cn } from '@/lib/utils/cn'

import styles from './Divider.module.css'

export interface DividerProps extends HTMLAttributes<HTMLElement> {}

export function Divider({ className, ...props }: DividerProps) {
  return <Separator orientation="horizontal" className={cn(styles.divider, className)} {...props} />
}
