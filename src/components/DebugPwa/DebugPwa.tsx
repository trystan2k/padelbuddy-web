import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  clearSWCache,
  getSWState,
  getSWVersion,
  requestSWUpdate,
  type SWRegistrationState
} from '@/lib/pwa'

import styles from './DebugPwa.module.css'

interface CacheInfo {
  version: string
  cacheName: string
}

export function DebugPwa() {
  const { t } = useTranslation()
  const [swState, setSwState] = useState<SWRegistrationState | null>(null)
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    let isFetching = false

    const fetchState = async () => {
      if (isFetching) return
      isFetching = true
      try {
        const state = await getSWState()
        setSwState(state)

        if (state.registered) {
          const version = await getSWVersion()
          setCacheInfo(version)
        }
      } finally {
        isFetching = false
      }
    }

    void fetchState()

    // Refresh state periodically
    const interval = setInterval(fetchState, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleUpdate = useCallback(async () => {
    setIsUpdating(true)
    try {
      await requestSWUpdate()
      // Reload after update
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('[DebugPWA] Update failed:', error)
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const handleClearCache = useCallback(async () => {
    setIsClearing(true)
    try {
      const success = await clearSWCache()
      if (success) {
        setCacheInfo(null)
      }
    } catch (error) {
      console.error('[DebugPWA] Failed to clear cache:', error)
    } finally {
      setIsClearing(false)
    }
  }, [])

  return (
    <div className={styles.container} role="region" aria-labelledby="debug-pwa-title">
      <h3 id="debug-pwa-title" className={styles.title}>
        {t('debugPwa.title', { defaultValue: 'PWA Debug' })}
      </h3>

      <dl className={styles.list}>
        <dt className={styles.term}>{t('debugPwa.supported', { defaultValue: 'SW Supported' })}</dt>
        <dd className={styles.value}>{swState?.supported ? '✓' : '✗'}</dd>

        <dt className={styles.term}>
          {t('debugPwa.registered', { defaultValue: 'SW Registered' })}
        </dt>
        <dd className={styles.value}>{swState?.registered ? '✓' : '✗'}</dd>

        <dt className={styles.term}>{t('debugPwa.ready', { defaultValue: 'SW Ready' })}</dt>
        <dd className={styles.value}>{swState?.ready ? '✓' : '✗'}</dd>

        {cacheInfo && (
          <>
            <dt className={styles.term}>{t('debugPwa.version', { defaultValue: 'Version' })}</dt>
            <dd className={styles.value}>{cacheInfo.version}</dd>

            <dt className={styles.term}>{t('debugPwa.cache', { defaultValue: 'Cache' })}</dt>
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
          {isUpdating
            ? t('debugPwa.updating', { defaultValue: 'Updating...' })
            : t('debugPwa.update', { defaultValue: 'Update SW' })}
        </button>

        <button
          type="button"
          className={`${styles.button} ${styles.buttonDanger}`}
          onClick={handleClearCache}
          disabled={isClearing || !swState?.registered}
        >
          {isClearing
            ? t('debugPwa.clearing', { defaultValue: 'Clearing...' })
            : t('debugPwa.clearCache', { defaultValue: 'Clear Cache' })}
        </button>
      </div>
    </div>
  )
}
