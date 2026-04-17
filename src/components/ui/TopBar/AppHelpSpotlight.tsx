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
import { hasHelpSpotlightBeenSeen, markHelpSpotlightSeen } from '@/lib/user/help_spotlight_storage';

import styles from './AppHelpSpotlight.module.css';

/** Spotlight margin around the trigger button. */
const SPOTLIGHT_MARGIN = 8;

interface AppHelpSpotlightProps {
  /** The help trigger button element to spotlight. */
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** Whether to show spotlight for first-time users. */
  showOnFirstVisit?: boolean;
  /** Callback fired when the spotlight is dismissed. */
  onDismiss?: () => void;
}

/**
 * A first-visit spotlight that highlights the help trigger button.
 */
export function AppHelpSpotlight({
  triggerRef,
  showOnFirstVisit = false,
  onDismiss
}: AppHelpSpotlightProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const measureTriggerRect = useCallback(() => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
  }, [triggerRef]);

  useEffect(() => {
    if (!showOnFirstVisit) {
      return undefined;
    }

    if (hasHelpSpotlightBeenSeen()) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
      measureTriggerRect();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [measureTriggerRect, showOnFirstVisit]);

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    measureTriggerRect();

    let frame = 0;
    const handleViewportChange = () => {
      measureTriggerRect();
    };

    // Ref assignment can lag behind initial visibility in some render paths.
    // Retry measurement until the trigger node becomes available.
    const retryMeasureUntilReady = () => {
      measureTriggerRect();

      if (!triggerRef.current) {
        frame = window.requestAnimationFrame(retryMeasureUntilReady);
      }
    };

    if (!triggerRef.current) {
      frame = window.requestAnimationFrame(retryMeasureUntilReady);
    }

    window.addEventListener('resize', handleViewportChange, { passive: true });
    window.addEventListener('scroll', handleViewportChange, {
      capture: true,
      passive: true
    });

    const resizeObserver =
      typeof ResizeObserver === 'undefined' || !triggerRef.current
        ? null
        : new ResizeObserver(() => {
            measureTriggerRect();
          });

    if (resizeObserver && triggerRef.current) {
      resizeObserver.observe(triggerRef.current);
    }

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
      resizeObserver?.disconnect();
    };
  }, [isVisible, measureTriggerRect, triggerRef]);

  const handleDismiss = useCallback(() => {
    markHelpSpotlightSeen();
    setIsVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    // Attach listener as soon as spotlight is eligible (not just after it becomes visible),
    // so clicks during the 500ms delay still mark the spotlight as seen.
    if (!showOnFirstVisit || hasHelpSpotlightBeenSeen()) {
      return undefined;
    }

    const handleTriggerActivation = () => {
      handleDismiss();
    };

    const triggerElement = triggerRef.current;
    triggerElement?.addEventListener('click', handleTriggerActivation);

    return () => {
      triggerElement?.removeEventListener('click', handleTriggerActivation);
    };
  }, [handleDismiss, showOnFirstVisit, triggerRef]);

  // Populate live region after mount so screen readers announce the spotlight message
  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = t('help.spotlight.message');
    }

    return undefined;
  }, [isVisible, t]);

  // Escape key handler at document level
  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

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
  }, [handleDismiss, isVisible]);

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

  if (!showOnFirstVisit || !isVisible || !spotlightStyle) {
    return null;
  }

  return (
    <>
      {/* Screen reader live region - rendered empty first, then populated for reliable announcement */}
      <div ref={liveRegionRef} aria-live="polite" aria-atomic="true" className={styles.srOnly} />

      {/* Wrapper for spotlight cutout and popover */}
      <div className={styles.wrapper} data-testid="spotlight-overlay">
        <div className={styles.spotlight} style={spotlightStyle} aria-hidden="true" />

        <Popover.Root open={true}>
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
                <Popover.Arrow className={styles.arrow} />

                <Popover.Title className={styles.popoverTitle}>
                  {t('help.spotlight.title')}
                </Popover.Title>

                <p className={styles.popoverBody}>{t('help.spotlight.message')}</p>

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
