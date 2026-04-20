import { useCallback, useMemo } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/Button/Button';
import { LocaleSelector } from '@/components/ui/LocaleSelector/LocaleSelector';
import { TopBar } from '@/components/ui/TopBar/TopBar';

import styles from './PrivacyPage.module.css';

export function PrivacyPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.history.back();
  }, [router.history]);

  const header = useMemo(
    () => (
      <TopBar
        iconSrc="/icon.png"
        iconAlt=""
        title={t('app.title')}
        subtitle={t('privacy.page.hero.eyebrow')}
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

  return (
    <Layout header={header} footer={footer}>
      <article className={styles.page} aria-labelledby="privacy-page-title">
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{t('privacy.page.hero.eyebrow')}</p>
          <h1 id="privacy-page-title" className={styles.title}>
            {t('privacy.page.hero.title')}
          </h1>
          <p className={styles.body}>{t('privacy.page.hero.body')}</p>
        </header>

        <div className={styles.sectionStack}>
          <section className={styles.section} aria-labelledby="privacy-local-title">
            <h2 id="privacy-local-title" className={styles.sectionTitle}>
              {t('privacy.page.localStorage.title')}
            </h2>
            <p className={styles.body}>{t('privacy.page.localStorage.body')}</p>
          </section>

          <section className={styles.section} aria-labelledby="privacy-no-account-title">
            <h2 id="privacy-no-account-title" className={styles.sectionTitle}>
              {t('privacy.page.noAccount.title')}
            </h2>
            <p className={styles.body}>{t('privacy.page.noAccount.body')}</p>
          </section>

          <section className={styles.section} aria-labelledby="privacy-limited-title">
            <h2 id="privacy-limited-title" className={styles.sectionTitle}>
              {t('privacy.page.limitedServices.title')}
            </h2>
            <p className={styles.body}>{t('privacy.page.limitedServices.body')}</p>
          </section>

          <section className={styles.section} aria-labelledby="privacy-control-title">
            <h2 id="privacy-control-title" className={styles.sectionTitle}>
              {t('privacy.page.control.title')}
            </h2>
            <p className={styles.body}>{t('privacy.page.control.body')}</p>
          </section>
        </div>
      </article>
    </Layout>
  );
}
