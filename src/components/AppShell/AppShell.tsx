import { Dialog } from '@base-ui/react/dialog'
import { useTranslation } from 'react-i18next'

import styles from './AppShell.module.css'

export function AppShell() {
  const { t } = useTranslation()

  const foundationItems = [
    {
      title: t('appShell.foundationItems.tanstackShell.title'),
      detail: t('appShell.foundationItems.tanstackShell.detail')
    },
    {
      title: t('appShell.foundationItems.designTokens.title'),
      detail: t('appShell.foundationItems.designTokens.detail')
    },
    {
      title: t('appShell.foundationItems.scopedStyling.title'),
      detail: t('appShell.foundationItems.scopedStyling.detail')
    }
  ] as const

  const statusPills = [
    t('appShell.statusPills.clientOnly'),
    t('appShell.statusPills.mobileReady'),
    t('appShell.statusPills.accessibleBaseline')
  ] as const
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
                <li className={styles.statusPill} key={pill}>
                  {pill}
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
              <li className={styles.foundationCard} key={item.title}>
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
