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
import { NotFoundPage } from '@/components/NotFoundPage/NotFoundPage';
import { PadelCourtSpinner } from '@/components/PadelCourtSpinner/PadelCourtSpinner';
import { ToastProvider } from '@/components/ui/Toast/useToast';
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
  head: () => ({
    meta: [
      {
        charSet: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
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
        content: '#2F7CF6'
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
        rel: 'apple-touch-icon',
        href: '/icon.png'
      }
    ]
  }),
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
          <div className={styles.routeShell}>
            <RoutePendingOverlay />
            <div className={styles.routeViewport}>
              <AppErrorBoundary>
                <Outlet />
              </AppErrorBoundary>
            </div>
          </div>
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
