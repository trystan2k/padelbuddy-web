import { useCallback, useMemo } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button/Button';
import { Layout } from '@/components/Layout/Layout';
import { StoreButtons } from '@/components/StoreButtons/StoreButtons';
import { LocaleSelector } from '@/components/ui/LocaleSelector/LocaleSelector';
import { TopBar } from '@/components/ui/TopBar/TopBar';
import { useActiveSection } from '@/hooks/useActiveSection';
import { cn } from '@/lib/utils/cn';
import { supportsViewTransitions } from '@/lib/utils/view-transitions';
import { APP_VERSION } from '@/version';

import { HelpSection } from './HelpSection';
import { HELP_PAGE_SECTIONS } from './help-page-content';
import styles from './HelpLandingPage.module.css';

const helpSectionIds = HELP_PAGE_SECTIONS.map((section) => section.id);

export function HelpLandingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const showStoreButtons = import.meta.env.VITE_IS_NATIVE !== 'true';
  const activeId = useActiveSection({ sectionIds: helpSectionIds });

  const handleBack = useCallback(() => {
    router.history.back();
  }, [router.history]);

  const header = useMemo(
    () => (
      <TopBar
        iconSrc="/icon.png"
        iconAlt=""
        title={t('app.title')}
        subtitle={t('help.page.hero.eyebrow')}
        showHelpTrigger={false}
      >
        <LocaleSelector />
      </TopBar>
    ),
    [t]
  );

  const footer = useMemo(
    () => (
      <Button
        type="button"
        className={styles.backButton}
        onClick={handleBack}
        accent="primary"
        variant="soft"
      >
        {t('help.page.common.back')}
      </Button>
    ),
    [handleBack, t]
  );

  const tocItems = (
    <ul className={styles.tocList}>
      {HELP_PAGE_SECTIONS.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            className={cn(styles.tocLink, activeId === section.id && styles.tocLinkActive)}
            aria-current={activeId === section.id ? 'location' : undefined}
          >
            {t(section.tocKey)}
          </a>
        </li>
      ))}

      <li>
        <Link className={styles.tocLink} to="/privacy" viewTransition={supportsViewTransitions()}>
          {t('help.page.toc.privacy')}
        </Link>
      </li>

      {showStoreButtons && (
        <li className={styles.tocStoreItem}>
          <p className={styles.storeLabel}>{t('help.page.common.storeAvailabilityLabel')}</p>
          <StoreButtons />
        </li>
      )}

      <li className={styles.tocVersionItem}>
        <span className={styles.footerVersion}>{APP_VERSION}</span>
      </li>
    </ul>
  );

  return (
    <Layout header={header} footer={footer}>
      <article className={styles.page}>
        <div className={styles.docLayout}>
          <aside className={styles.tocDesktop}>
            <nav className={styles.tocDesktopInner} aria-labelledby="toc-heading">
              <h2 id="toc-heading" className={styles.tocTitle}>
                {t('help.page.toc.title')}
              </h2>
              {tocItems}
            </nav>
          </aside>

          <div className={styles.contentColumn}>
            <details className={styles.tocMobile}>
              <summary
                className={styles.tocMobileSummary}
                aria-label={t('help.page.toc.title')}
                title={t('help.page.toc.title')}
              >
                <span aria-hidden="true" className={styles.tocMobileIcon}>
                  ☰
                </span>
                <span>{t('help.page.toc.title')}</span>
              </summary>
              <nav className={styles.tocMobilePanel} aria-label={t('help.page.toc.title')}>
                {tocItems}
              </nav>
            </details>

            <div className={styles.sectionStack}>
              {HELP_PAGE_SECTIONS.map((section) => (
                <HelpSection key={section.id} section={section} />
              ))}
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
}
