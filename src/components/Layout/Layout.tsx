import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

import styles from './Layout.module.css'

export interface LayoutProps extends HTMLAttributes<HTMLElement> {
  /** Optional header content (navigation, metadata, etc.) */
  header?: ReactNode
  /** Optional footer content (primary actions, buttons, etc.) */
  footer?: ReactNode
  /** Additional CSS class for the body section */
  bodyClassName?: string
}

export function Layout({
  header,
  footer,
  children,
  className,
  bodyClassName,
  ...props
}: LayoutProps) {
  return (
    <main className={cn(styles.layout, className)} {...props}>
      <div className={styles.container}>
        {header && <header className={styles.header}>{header}</header>}
        <div className={cn(styles.body, bodyClassName)} data-testid="layout-body">
          {children}
        </div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </main>
  )
}
