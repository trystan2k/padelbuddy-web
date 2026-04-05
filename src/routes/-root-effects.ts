import { useEffect, useState, type RefObject } from 'react'
import mixpanel from 'mixpanel-browser'

import { i18n, initializeI18n } from '@/lib/i18n/i18n'
import { registerSW } from '@/lib/pwa/registration'
import { getOrCreateUserId } from '@/lib/user/id'

function getDocumentLanguage() {
  return i18n.resolvedLanguage ?? i18n.language ?? 'en'
}

export function useRootDocumentLanguage() {
  const [currentLang, setCurrentLang] = useState(getDocumentLanguage)

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLang(lng || 'en')
    }

    i18n.on('languageChanged', handleLanguageChanged)

    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [])

  return currentLang
}

export function useRootInitializationEffects() {
  useEffect(() => {
    if (import.meta.env.PROD) {
      mixpanel.init('21d2e2fd8e6c4eeca02abb794fb90c7a', {
        autocapture: true,
        record_sessions_percent: 100,
        api_host: 'https://api-eu.mixpanel.com'
      })

      const userId = getOrCreateUserId()
      mixpanel.identify(userId)
    }

    void initializeI18n().catch((error) => {
      console.error('Failed to initialize i18n:', error)
    })

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      void registerSW()
    }
  }, [])
}

export function useRemoveHydrationSpinner(routePendingRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    routePendingRef.current?.remove()
  }, [routePendingRef])
}

export function getRootErrorDocumentLanguage() {
  return getDocumentLanguage()
}
