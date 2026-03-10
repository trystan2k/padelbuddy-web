import { Link } from '@tanstack/react-router'

import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby='not-found-title'>
        <p className={styles.eyebrow}>Page not found</p>
        <h1 className={styles.title} id='not-found-title'>
          We could not find that route.
        </h1>
        <p className={styles.description}>
          The app foundation is running, but this page does not exist in the
          current route tree.
        </p>
        <Link className={styles.link} to='/'>
          Go back to the home screen
        </Link>
      </section>
    </main>
  )
}
