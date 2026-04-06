import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  clearSWCache,
  getSWState,
  getSWVersion,
  requestSWUpdate,
  type SWRegistrationState
} from '@/lib/pwa/registration';
import { cn } from '@/lib/utils/cn';

import styles from './DebugPwa.module.css';

interface CacheInfo {
  version: string;
  cacheName: string;
}

export function DebugPwa() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [swState, setSwState] = useState<SWRegistrationState | null>(null);
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleReopen = useCallback(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      let cancelled = false;
      let isFetching = false;

      const tick = async () => {
        if (cancelled || isFetching) return;
        isFetching = true;
        try {
          const state = await getSWState();
          if (cancelled) return;
          setSwState(state);

          if (state.registered) {
            const version = await getSWVersion();
            if (cancelled) return;
            setCacheInfo(version);
          }
        } finally {
          isFetching = false;
        }
      };

      void tick();

      const id = setInterval(tick, 5000);
      return () => {
        cancelled = true;
        clearInterval(id);
      };
    }
  }, [isVisible]);

  const handleUpdate = useCallback(async () => {
    setIsUpdating(true);
    try {
      await requestSWUpdate();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('[DebugPWA] Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const handleClearCache = useCallback(async () => {
    setIsClearing(true);
    try {
      const success = await clearSWCache();
      if (success) {
        setCacheInfo(null);
      }
    } catch (error) {
      console.error('[DebugPWA] Failed to clear cache:', error);
    } finally {
      setIsClearing(false);
    }
  }, []);

  if (!isVisible) {
    return (
      <button type="button" className={styles.reopenButton} onClick={handleReopen}>
        {t('debugPwa.reopen')}
      </button>
    );
  }

  return (
    <div className={styles.container} role="region" aria-labelledby="debug-pwa-title">
      <div className={styles.header}>
        <h3 id="debug-pwa-title" className={styles.title}>
          {t('debugPwa.title')}
        </h3>
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label={t('common.close')}
        >
          ✕
        </button>
      </div>

      <dl className={styles.list}>
        <dt className={styles.term}>{t('debugPwa.supported')}</dt>
        <dd className={styles.value}>{swState?.supported ? '✓' : '✗'}</dd>

        <dt className={styles.term}>{t('debugPwa.registered')}</dt>
        <dd className={styles.value}>{swState?.registered ? '✓' : '✗'}</dd>

        <dt className={styles.term}>{t('debugPwa.ready')}</dt>
        <dd className={styles.value}>{swState?.ready ? '✓' : '✗'}</dd>

        {cacheInfo && (
          <>
            <dt className={styles.term}>{t('debugPwa.version')}</dt>
            <dd className={styles.value}>{cacheInfo.version}</dd>

            <dt className={styles.term}>{t('debugPwa.cache')}</dt>
            <dd className={styles.value}>{cacheInfo.cacheName}</dd>
          </>
        )}
      </dl>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
          onClick={handleUpdate}
          disabled={isUpdating || !swState?.registered}
        >
          {isUpdating ? t('debugPwa.updating') : t('debugPwa.update')}
        </button>

        <button
          type="button"
          className={cn(styles.button, styles.buttonDanger)}
          onClick={handleClearCache}
          disabled={isClearing || !swState?.registered}
        >
          {isClearing ? t('debugPwa.clearing') : t('debugPwa.clearCache')}
        </button>
      </div>
    </div>
  );
}
