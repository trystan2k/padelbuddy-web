import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="not-found-title">
        <p className={styles.eyebrow}>{t('notFound.eyebrow')}</p>
        <h1 className={styles.title} id="not-found-title">
          {t('notFound.title')}
        </h1>
        <p className={styles.description}>{t('notFound.description')}</p>
        <Link className={styles.link} to="/">
          {t('notFound.backLink')}
        </Link>
      </section>
    </main>
  )
}
