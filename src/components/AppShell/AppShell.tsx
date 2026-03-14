import { Dialog } from '@base-ui/react/dialog'
import { useTranslation } from 'react-i18next'

import styles from './AppShell.module.css'

export function AppShell() {
  const { t } = useTranslation()

  // Stable IDs for foundation items to avoid using translated strings as React keys
  const foundationItemIds = ['tanstackShell', 'designTokens', 'scopedStyling'] as const
  const foundationItems = foundationItemIds.map((id) => ({
    id,
    title: t(`appShell.foundationItems.${id}.title`),
    detail: t(`appShell.foundationItems.${id}.detail`)
  }))

  // Stable IDs for status pills to avoid using translated strings as React keys
  const statusPillIds = ['clientOnly', 'mobileReady', 'accessibleBaseline'] as const
  const statusPills = statusPillIds.map((id) => ({
    id,
    label: t(`appShell.statusPills.${id}`)
  }))
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{t('appShell.eyebrow')}</p>
            <h1 className={styles.title}>{t('app.title')}</h1>
            <p className={styles.lead}>{t('appShell.lead')}</p>
          </div>

          <div className={styles.heroFooter}>
            <ul className={styles.statusPills} aria-label="Foundation status">
              {statusPills.map((pill) => (
                <li className={styles.statusPill} key={pill.id}>
                  {pill.label}
                </li>
              ))}
            </ul>

            <Dialog.Root>
              <Dialog.Trigger className={styles.primaryButton}>
                {t('appShell.baseUiCheck.trigger')}
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Backdrop className={styles.dialogBackdrop} />
                <Dialog.Popup className={styles.dialogPopup}>
                  <p className={styles.dialogEyebrow}>{t('appShell.baseUiCheck.eyebrow')}</p>
                  <Dialog.Title className={styles.dialogTitle}>
                    {t('appShell.baseUiCheck.title')}
                  </Dialog.Title>
                  <Dialog.Description className={styles.dialogDescription}>
                    {t('appShell.baseUiCheck.description')}
                  </Dialog.Description>
                  <Dialog.Close className={styles.secondaryButton}>
                    {t('appShell.baseUiCheck.close')}
                  </Dialog.Close>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </header>

        <section className={styles.panel} aria-labelledby="foundation-heading">
          <div className={styles.panelHeader}>
            <p className={styles.sectionLabel}>{t('appShell.foundation.sectionLabel')}</p>
            <h2 className={styles.sectionTitle} id="foundation-heading">
              {t('appShell.foundation.sectionTitle')}
            </h2>
            <p className={styles.sectionText}>{t('appShell.foundation.sectionText')}</p>
          </div>

          <ul className={styles.foundationGrid}>
            {foundationItems.map((item) => (
              <li className={styles.foundationCard} key={item.id}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardText}>{item.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
