import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useTranslation } from 'react-i18next';

import { AppStatusPage, AppStatusActions } from '@/components/AppStatus/AppStatusPage';
import { Button } from '@/components/ui/Button/Button';
import { checkLicenseStatus, isAppAllowed, type LicenseStatus } from '@/lib/license';
import styles from './LicenseGate.module.css';

interface LicenseGateProps {
  children: React.ReactNode;
}

const WEB_LICENSE_STATUS: LicenseStatus = {
  status: 0,
  isLicensed: true,
  isGraceActive: true
};

export function LicenseGate({ children }: LicenseGateProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<LicenseStatus | null>(WEB_LICENSE_STATUS);
  const [checking, setChecking] = useState(false);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    const platform = Capacitor.getPlatform();
    if (platform !== 'android') {
      return undefined;
    }

    let cancelled = false;
    setChecking(true);

    async function verify() {
      try {
        // On Android this currently means verifying the app came from Google Play.
        const result = await checkLicenseStatus();
        if (!cancelled) setStatus(result);
      } catch {
        if (!cancelled) setStatus(null);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, []);

  if (checking) {
    return (
      // oxlint-disable-next-line prefer-tag-over-role
      <div className={styles.loading} aria-label={t('common.loadingPleaseWait')} role="status">
        <div className={styles.spinner} aria-hidden="true" />
      </div>
    );
  }

  if (!status || !isAppAllowed(status)) {
    return (
      <AppStatusPage
        eyebrow={t('app.license.blocked.eyebrow')}
        title={t('app.license.blocked.title')}
        body={t('app.license.blocked.body')}
        liveRegion="assertive"
      >
        <AppStatusActions>
          <Button variant="outline" size="sm" accent="secondary" onClick={reload}>
            {t('common.retry')}
          </Button>
        </AppStatusActions>
      </AppStatusPage>
    );
  }

  return <>{children}</>;
}
