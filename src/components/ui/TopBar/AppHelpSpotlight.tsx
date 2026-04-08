import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject
} from 'react';
import { Popover } from '@base-ui/react/popover';
import { useTranslation } from 'react-i18next';

import { markHelpSpotlightSeen } from '@/lib/user/help_spotlight_storage';

import styles from './AppHelpSpotlight.module.css';

export interface AppHelpSpotlightProps {
  /** The help trigger button element to spotlight. */
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** Callback fired when the spotlight is dismissed. */
  onDismiss: () => void;
}

/** Spotlight margin around the trigger button. */
const SPOTLIGHT_MARGIN = 8;

export function AppHelpSpotlight({ triggerRef, onDismiss }: AppHelpSpotlightProps) {
  const { t } = useTranslation();
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Measure the trigger on mount and resize
  useEffect(() => {
    const measure = () => {
      if (triggerRef.current) {
        setTriggerRect(triggerRef.current.getBoundingClientRect());
      }
    };

    measure();

    // Re-measure on resize
    const handleResize = () => {
      measure();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [triggerRef]);

  const handleDismiss = useCallback(() => {
    markHelpSpotlightSeen();
    onDismiss();
  }, [onDismiss]);

  // Populate live region after mount so screen readers announce the spotlight message
  useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = t('help.spotlight.message');
    }
  }, [t]);

  // Escape key handler at document level
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleDismiss();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleDismiss]);

  // Memoize spotlight style
  const spotlightStyle = useMemo((): CSSProperties | null => {
    if (!triggerRect) {
      return null;
    }
    return {
      top: triggerRect.top - SPOTLIGHT_MARGIN,
      left: triggerRect.left - SPOTLIGHT_MARGIN,
      width: triggerRect.width + SPOTLIGHT_MARGIN * 2,
      height: triggerRect.height + SPOTLIGHT_MARGIN * 2
    };
  }, [triggerRect]);

  // Don't render until we have trigger position
  if (!spotlightStyle) {
    return null;
  }

  return (
    <>
      {/* Screen reader live region - rendered empty first, then populated via useEffect for reliable announcement */}
      <div ref={liveRegionRef} aria-live="polite" aria-atomic="true" className={styles.srOnly} />

      {/* Note: No click-outside dismissal here.
          Adding a backdrop click handler would intercept clicks before they reach the help trigger,
          breaking the single-click behavior where clicking the help icon both dismisses the spotlight
          AND opens the dialog in the same interaction.
          Users dismiss the spotlight via Escape key or the dismiss button inside the popover. */}

      {/* Wrapper for the spotlight cutout (pointer-events: none) and popover */}
      <div className={styles.wrapper} data-testid="spotlight-overlay">
        {/* Spotlight cutout around the trigger - pointer-events: none so clicks pass through */}
        <div className={styles.spotlight} style={spotlightStyle} aria-hidden="true" />

        {/* Base UI Popover anchored to the trigger ref - NOT Tooltip because it has an interactive dismiss */}
        <Popover.Root
          open={true}
          // Controlled open state - always true while spotlight is visible.
          // No onOpenChange handler needed since dismissal is handled via Escape key
          // or the dismiss button which calls handleDismiss directly.
        >
          <Popover.Portal>
            <Popover.Positioner
              anchor={triggerRef}
              side="right"
              sideOffset={SPOTLIGHT_MARGIN + 4}
              collisionPadding={16}
              positionMethod="fixed"
              className={styles.positioner}
            >
              <Popover.Popup
                className={styles.popover}
                data-testid="spotlight-popover"
                initialFocus={false}
              >
                {/* Docs-style arrow that visually merges with the popover edge. */}
                <Popover.Arrow className={styles.arrow} />

                {/* Use Popover.Title for accessible heading */}
                <Popover.Title className={styles.popoverTitle}>
                  {t('help.spotlight.title')}
                </Popover.Title>

                <p className={styles.popoverBody}>{t('help.spotlight.message')}</p>

                {/* Interactive dismiss button - uses Popover.Close so Base UI handles the close path */}
                <Popover.Close
                  className={styles.dismissButton}
                  aria-label={t('help.spotlight.dismiss')}
                  data-testid="spotlight-dismiss"
                  onClick={handleDismiss}
                >
                  {t('help.spotlight.dismiss')}
                </Popover.Close>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </>
  );
}
