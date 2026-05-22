import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button/Button';
import { usePwaInstallPrompt } from '@/lib/pwa/install';

import styles from './PwaInstallBanner.module.css';

export function PwaInstallBanner() {
  const { t } = useTranslation();
  const { mode, isVisible, isInstalling, dismissBanner, promptInstall } = usePwaInstallPrompt();

  if (!isVisible || !mode) {
    return null;
  }

  const isNativePrompt = mode === 'native_prompt';
  const title = isNativePrompt ? t('pwaInstall.banner.title') : t('pwaInstall.banner.manualTitle');
  const body = isNativePrompt ? t('pwaInstall.banner.body') : t('pwaInstall.banner.manualBody');

  return (
    <div className={styles.container}>
      <section className={styles.banner} aria-label={t('pwaInstall.banner.label')}>
        <div className={styles.copy}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.body}>{body}</p>
        </div>
        <div className={styles.actions}>
          <Button variant="outline" size="sm" accent="secondary" onClick={dismissBanner}>
            {t('common.dismiss')}
          </Button>
          {isNativePrompt ? (
            <Button size="sm" onClick={promptInstall} disabled={isInstalling}>
              {isInstalling ? t('pwaInstall.banner.installing') : t('pwaInstall.banner.install')}
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
