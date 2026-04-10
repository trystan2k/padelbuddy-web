import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

import { AppStatusPage, AppStatusActions } from '@/components/AppStatus/AppStatusPage';
import { Button } from '@/components/ui/Button/Button';
import { checkLicenseStatus, isAppAllowed, type LicenseStatus } from '@/lib/license';
import { i18n } from '@/lib/i18n/i18n';
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
  const [status, setStatus] = useState(Capacitor.isNativePlatform() ? null : WEB_LICENSE_STATUS);
  const [checking, setChecking] = useState(Capacitor.isNativePlatform());

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
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
      <div className={styles.loading} aria-label={i18n.t('common.loadingPleaseWait')} role="status">
        <div className={styles.spinner} aria-hidden="true" />
      </div>
    );
  }

  if (!status || !isAppAllowed(status)) {
    return (
      <AppStatusPage
        eyebrow={i18n.t('license.blocked.eyebrow')}
        title={i18n.t('license.blocked.title')}
        body={i18n.t('license.blocked.body')}
        liveRegion="assertive"
      >
        <AppStatusActions>
          <Button variant="outline" size="sm" accent="secondary" onClick={reload}>
            {i18n.t('common.retry')}
          </Button>
        </AppStatusActions>
      </AppStatusPage>
    );
  }

  return <>{children}</>;
}
