import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

import styles from './TopBar.module.css'

export interface TopBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional brand icon source displayed next to the title. */
  iconSrc?: string
  /** Alt text for the brand icon. Use an empty string to mark it as decorative (`aria-hidden`). */
  iconAlt?: string
  /** Primary top bar heading, rendered as an `h1`. */
  title?: string
  /** Secondary supporting text shown below the title. */
  subtitle?: string
  /** Optional right-side actions slot content. */
  children?: ReactNode
}

export function TopBar({
  iconSrc,
  iconAlt = '',
  title,
  subtitle,
  children,
  className,
  ...props
}: TopBarProps) {
  const hasBranding = iconSrc || title || subtitle

  return (
    <div className={cn(styles.container, className)} {...props}>
      {hasBranding && (
        <div className={styles.branding}>
          <div className={styles.titleRow}>
            {iconSrc && (
              <img
                src={iconSrc}
                alt={iconAlt}
                aria-hidden={iconAlt ? undefined : true}
                className={styles.icon}
              />
            )}
            {title && <h1 className={styles.appName}>{title}</h1>}
          </div>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}

      {children != null ? <div className={styles.actions}>{children}</div> : null}
    </div>
  )
}
