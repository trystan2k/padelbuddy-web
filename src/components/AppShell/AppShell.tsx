import { Dialog } from '@base-ui/react/dialog'

import styles from './AppShell.module.css'

const foundationItems = [
  {
    title: 'TanStack Start shell',
    detail:
      'Route generation and the client-only bootstrap are already carrying the app frame.'
  },
  {
    title: 'Shared design tokens',
    detail:
      'Global variables now define the spacing, color, typography, and focus baseline for future UI work.'
  },
  {
    title: 'Scoped component styling',
    detail:
      'CSS Modules keep shell presentation isolated while the app grows into new screens and controls.'
  }
] as const

const statusPills = [
  'Client-only',
  'Mobile-ready',
  'Accessible baseline'
] as const

export function AppShell() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>App foundation</p>
            <h1 className={styles.title}>Padel Buddy</h1>
            <p className={styles.lead}>
              A deliberately styled starter shell for the live score tracker,
              set up to carry future match flows without feeling like
              placeholder scaffolding.
            </p>
          </div>

          <div className={styles.heroFooter}>
            <ul className={styles.statusPills} aria-label='Foundation status'>
              {statusPills.map((pill) => (
                <li className={styles.statusPill} key={pill}>
                  {pill}
                </li>
              ))}
            </ul>

            <Dialog.Root>
              <Dialog.Trigger className={styles.primaryButton}>
                Open Base UI check
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Backdrop className={styles.dialogBackdrop} />
                <Dialog.Popup className={styles.dialogPopup}>
                  <p className={styles.dialogEyebrow}>Interaction baseline</p>
                  <Dialog.Title className={styles.dialogTitle}>
                    Base UI is wired
                  </Dialog.Title>
                  <Dialog.Description className={styles.dialogDescription}>
                    This dialog confirms the starter shell can render
                    accessible, styled primitives inside the TanStack Start
                    route.
                  </Dialog.Description>
                  <Dialog.Close className={styles.secondaryButton}>
                    Close panel
                  </Dialog.Close>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </header>

        <section className={styles.panel} aria-labelledby='foundation-heading'>
          <div className={styles.panelHeader}>
            <p className={styles.sectionLabel}>Styling foundation</p>
            <h2 className={styles.sectionTitle} id='foundation-heading'>
              Bootstrap status
            </h2>
            <p className={styles.sectionText}>
              The shell now establishes shared global styles, component-scoped
              styling, and a responsive presentation layer that works cleanly on
              desktop and on-court mobile screens.
            </p>
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
