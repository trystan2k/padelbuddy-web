import { useId, type ReactNode } from 'react'

import styles from './AppStatusPage.module.css'

export interface AppStatusPageProps {
  body: ReactNode
  children?: ReactNode
  eyebrow: ReactNode
  liveRegion?: 'assertive' | 'off' | 'polite'
  title: ReactNode
}

export function AppStatusPage({
  body,
  children,
  eyebrow,
  liveRegion = 'off',
  title
}: AppStatusPageProps) {
  const titleId = useId()

  return (
    <main className={styles.page}>
      <section
        className={styles.card}
        aria-labelledby={titleId}
        aria-live={liveRegion === 'off' ? undefined : liveRegion}
      >
        <div className={styles.eyebrow}>{eyebrow}</div>
        <h1 className={styles.title} id={titleId}>
          {title}
        </h1>
        <div className={styles.body}>{body}</div>
        {children}
      </section>
    </main>
  )
}

export interface AppStatusDetailProps {
  children: ReactNode
  role?: 'alert' | 'status'
}

export function AppStatusDetail({ children, role }: AppStatusDetailProps) {
  return (
    <p className={styles.detail} role={role}>
      {children}
    </p>
  )
}

export interface AppStatusActionsProps {
  children: ReactNode
}

export function AppStatusActions({ children }: AppStatusActionsProps) {
  return <div className={styles.actions}>{children}</div>
}
