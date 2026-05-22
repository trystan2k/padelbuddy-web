// oxlint-disable-next-line import/no-unassigned-import
import '@/styles.css';

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
  type ErrorComponentProps
} from '@tanstack/react-router';
import { useRef } from 'react';

import { AppErrorBoundary } from '@/components/ErrorBoundary/AppErrorBoundary';
import { DebugPwa } from '@/components/DebugPwa/DebugPwa';
import { LicenseGate } from '@/components/LicenseGate/LicenseGate';
import { NotFoundPage } from '@/components/NotFoundPage/NotFoundPage';
import { PadelCourtSpinner } from '@/components/PadelCourtSpinner/PadelCourtSpinner';
import { ToastProvider } from '@/components/ui/Toast/useToast';
import { getFeatureFlags } from '@/config/feature-flags';
import { i18n } from '@/lib/i18n/i18n';

import {
  getRootErrorDocumentLanguage,
  useRemoveHydrationSpinner,
  useRootDocumentLanguage,
  useRootInitializationEffects
} from './-root-effects';
import { RouteErrorCard } from './-route-utils';
import styles from './RootDocument.module.css';

export const Route = createRootRoute({
  head: () => {
    const featureFlags = getFeatureFlags();

    return {
      meta: [
        {
          charSet: 'utf-8'
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover'
        },
        {
          title: i18n.t('app.title')
        },
        {
          name: 'description',
          content: i18n.t('app.description')
        },
        {
          name: 'theme-color',
          content: '#F4F0E7'
        },
        {
          name: 'mobile-web-app-capable',
          content: 'yes'
        },
        {
          name: 'apple-mobile-web-app-capable',
          content: 'yes'
        },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'default'
        },
        {
          name: 'apple-mobile-web-app-title',
          content: i18n.t('app.title')
        }
      ],
      links: [
        {
          rel: 'manifest',
          href: '/manifest.json'
        },
        {
          rel: 'icon',
          type: 'image/png',
          href: '/icon.png'
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png'
        }
      ],
      scripts: featureFlags.ads
        ? [
            {
              src: 'https://pl29090824.profitablecpmratenetwork.com/02/2b/8f/022b8faecb5dfe718fdb48e75a83b7cb.js'
            }
          ]
        : []
    };
  },
  component: RootDocument,
  errorComponent: RootErrorState,
  notFoundComponent: NotFoundPage
});

function RootErrorState(props: ErrorComponentProps) {
  return (
    <html lang={getRootErrorDocumentLanguage()}>
      <head>
        <HeadContent />
      </head>
      <body>
        <RouteErrorCard {...props} eyebrowKey="error.unexpectedLabel" />
        <Scripts />
      </body>
    </html>
  );
}

function AppShell() {
  const currentLang = useRootDocumentLanguage();
  const routePendingRef = useRef<HTMLDivElement>(null);

  useRemoveHydrationSpinner(routePendingRef);

  return (
    <html lang={currentLang}>
      <head>
        <HeadContent />
      </head>
      <body>
        <PadelCourtSpinner
          ref={routePendingRef}
          className={styles.routePendingSpinner}
          silent={true}
          aria-hidden="true"
        />
        <ToastProvider>
          <LicenseGate>
            <div className={styles.routeShell}>
              <RoutePendingOverlay />
              <div className={styles.routeViewport}>
                <AppErrorBoundary>
                  <Outlet />
                </AppErrorBoundary>
              </div>
            </div>
          </LicenseGate>
        </ToastProvider>
        <Scripts />
        {import.meta.env.DEV && <DebugPwa />}
      </body>
    </html>
  );
}

export function RoutePendingOverlay() {
  const isRoutePending = useRouterState({
    select: (state) =>
      Boolean(state.resolvedLocation) && state.matches.some((match) => match.status === 'pending'),
    structuralSharing: true
  });

  if (!isRoutePending) {
    return null;
  }

  return (
    <PadelCourtSpinner className={styles.routePendingSpinner} silent={true} aria-hidden="true" />
  );
}

function RootDocument() {
  useRootInitializationEffects();

  return <AppShell />;
}
