import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type MouseEventHandler
} from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { useTranslation } from 'react-i18next';
import { isHelpSpotlightSeen, markHelpSpotlightSeen } from '@/lib/user/help_spotlight_storage';
import { APP_VERSION } from '@/version';
import { StoreButtons } from '@/components/StoreButtons/StoreButtons';

import { AppHelpSpotlight } from './AppHelpSpotlight';

import styles from './AppHelpDialog.module.css';

/** Inline SVG question-mark icon to avoid external icon library dependency. */
function HelpIcon({ className }: { className?: string | undefined }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
    </svg>
  );
}

/** Inline SVG close icon for the dialog close button. */
function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

export interface AppHelpDialogProps {
  appTitle: string;
  /** Show the first-visit spotlight on the help trigger (setup screen only). */
  showFirstVisitSpotlight?: boolean;
}

export function AppHelpDialog({ appTitle, showFirstVisitSpotlight = false }: AppHelpDialogProps) {
  const { t } = useTranslation();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const [showSpotlight, setShowSpotlight] = useState(false);

  // Check if we should show the spotlight after mount (client-side only)
  useEffect(() => {
    if (!showFirstVisitSpotlight) {
      return;
    }

    if (!isHelpSpotlightSeen()) {
      setShowSpotlight(true);
    }
  }, [showFirstVisitSpotlight]);

  const handleBackdropRender = useCallback(
    (props: HTMLAttributes<HTMLDivElement>) => (
      <div {...props} data-testid="help-backdrop" className={styles.backdrop} />
    ),
    []
  );

  const handleCloseButtonRender = useCallback(
    (closeProps: HTMLAttributes<HTMLButtonElement>) => (
      <button
        {...closeProps}
        type="button"
        className={styles.closeButton}
        aria-label={t('common.close')}
        data-testid="help-close"
      >
        <CloseIcon />
      </button>
    ),
    [t]
  );

  const handleTitleRender = useCallback(
    (titleProps: HTMLAttributes<HTMLHeadingElement>) => (
      <h2 {...titleProps} id="help-dialog-title" className={styles.title}>
        {appTitle}
      </h2>
    ),
    [appTitle]
  );

  const handleDescriptionRender = useCallback(
    (descriptionProps: HTMLAttributes<HTMLParagraphElement>) => (
      <p {...descriptionProps} className={styles.description}>
        {t('help.about')}
      </p>
    ),
    [t]
  );

  const handleSpotlightDismiss = useCallback(() => {
    setShowSpotlight(false);
  }, []);

  // Store latest values in refs to avoid creating new functions on each render
  const showSpotlightRef = useRef(showSpotlight);
  showSpotlightRef.current = showSpotlight;

  // Store baseUiOnClick in a ref so we can call it from the stable handler
  const baseUiOnClickRef = useRef<MouseEventHandler<HTMLButtonElement> | undefined>(undefined);

  const handleTriggerClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    // Call Base UI's onClick first (opens the dialog)
    baseUiOnClickRef.current?.(event);
    // Then handle spotlight: mark seen and dismiss
    if (showSpotlightRef.current) {
      markHelpSpotlightSeen();
      setShowSpotlight(false);
    }
  }, []);

  const handleTriggerRender = useCallback(
    (triggerProps: HTMLAttributes<HTMLButtonElement>) => {
      const { onClick: baseUiOnClick, ...restTriggerProps } = triggerProps;
      // Intentional: store latest baseUiOnClick in ref for the stable handler.
      // Idempotent — Base UI always passes a new function reference on each render.
      baseUiOnClickRef.current = baseUiOnClick;

      return (
        <button
          {...restTriggerProps}
          ref={triggerRef}
          type="button"
          className={styles.trigger}
          aria-label={t('help.triggerLabel')}
          data-testid="help-trigger"
          onClick={handleTriggerClick}
        >
          <HelpIcon className={styles.triggerIcon} />
        </button>
      );
    },
    [t, handleTriggerClick]
  );

  const handlePopupRender = useCallback(
    (props: HTMLAttributes<HTMLDivElement>) => (
      <div
        {...props}
        className={styles.popup}
        aria-modal="true"
        aria-labelledby="help-dialog-title"
        data-testid="help-dialog"
      >
        <Dialog.Close render={handleCloseButtonRender} />

        <div className={styles.header}>
          <Dialog.Title render={handleTitleRender} />
          <Dialog.Description render={handleDescriptionRender} />
        </div>

        <div className={styles.sections}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('help.howToUse.title')}</h3>
            <p className={styles.sectionBody}>{t('help.howToUse.body')}</p>
          </section>

          {import.meta.env.VITE_IS_NATIVE !== 'true' && (
            <>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>{t('help.advertising.title')}</h3>
                <p className={styles.sectionBody}>{t('help.advertising.body')}</p>
                <StoreButtons />
                <p className={styles.sectionBody}>{t('help.advertising.noAds')}</p>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>{t('help.pwa.title')}</h3>
                <p className={styles.sectionBody}>{t('help.pwa.body')}</p>
              </section>
            </>
          )}
        </div>

        <footer className={styles.footer}>
          <span className={styles.footerAppName}>{appTitle}</span>
          <span className={styles.footerVersion}>{APP_VERSION}</span>
        </footer>
      </div>
    ),
    [t, appTitle, handleTitleRender, handleDescriptionRender, handleCloseButtonRender]
  );

  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger render={handleTriggerRender} />

        <Dialog.Portal>
          <Dialog.Backdrop render={handleBackdropRender} />
          <Dialog.Popup render={handlePopupRender} />
        </Dialog.Portal>
      </Dialog.Root>

      {showSpotlight && (
        <AppHelpSpotlight triggerRef={triggerRef} onDismiss={handleSpotlightDismiss} />
      )}
    </>
  );
}
