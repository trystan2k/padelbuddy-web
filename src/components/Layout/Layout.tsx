import type { ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

import styles from './Layout.module.css'

export interface LayoutProps {
  /** Optional header content (navigation, metadata, etc.) */
  header?: ReactNode
  /** Optional footer content (primary actions, buttons, etc.) */
  footer?: ReactNode
  /** Main body content */
  children: ReactNode
  /** Additional CSS class for the layout container */
  className?: string
  /** Additional CSS class for the body section */
  bodyClassName?: string
}

export function Layout({ header, footer, children, className, bodyClassName }: LayoutProps) {
  return (
    <main className={cn(styles.layout, className)}>
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
