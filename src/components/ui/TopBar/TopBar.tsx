import { useCallback, useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils/cn';
import { getViewTransitionNavigationOptions } from '@/lib/utils/view-transitions';

import { AppHelpSpotlight } from './AppHelpSpotlight';
import styles from './TopBar.module.css';

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

interface TopBarProps extends ComponentPropsWithoutRef<'div'> {
  /** Optional brand icon source displayed next to the title. */
  iconSrc?: string;
  /** Alt text for the brand icon. Use an empty string to mark it as decorative (`aria-hidden`). */
  iconAlt?: string;
  /** Primary top bar heading, rendered as an `h1`. */
  title?: string;
  /** Secondary supporting text shown below the title. */
  subtitle?: string;
  /** Optional right-side actions slot content. */
  children?: ReactNode;
  /** Hide the help trigger, e.g. for surfaces that should not expose it (share capture). */
  showHelpTrigger?: boolean;
  /** Show the first-visit spotlight pointing to the help trigger. */
  showFirstVisitHelpSpotlight?: boolean;
}

export function TopBar({
  iconSrc,
  iconAlt = '',
  title,
  subtitle,
  children,
  className,
  showHelpTrigger = true,
  showFirstVisitHelpSpotlight = false,
  ...props
}: TopBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const helpTriggerRef = useRef<HTMLButtonElement>(null);

  const hasBranding = iconSrc || title || subtitle;

  const handleHelpTriggerClick = useCallback(() => {
    void navigate({
      to: '/help',
      ...getViewTransitionNavigationOptions()
    });
  }, [navigate]);

  const helpTrigger = showHelpTrigger && (
    <button
      ref={helpTriggerRef}
      type="button"
      className={styles.helpTrigger}
      aria-label={t('help.triggerLabel')}
      data-testid="help-trigger"
      onClick={handleHelpTriggerClick}
    >
      <HelpIcon className={styles.helpTriggerIcon} />
    </button>
  );

  return (
    <div className={cn(styles.container, className)} {...props}>
      {hasBranding && (
        <div className={styles.branding}>
          <div className={styles.titleRow}>
            {iconSrc && (
              <img
                src={iconSrc}
                alt={iconAlt}
                aria-hidden={iconAlt ? undefined : true}
                className={styles.icon}
              />
            )}
            {title && (
              <div className={styles.titleText}>
                <h1 className={styles.appName}>{title}</h1>
                {helpTrigger}
                {showHelpTrigger && showFirstVisitHelpSpotlight ? (
                  <AppHelpSpotlight
                    triggerRef={helpTriggerRef}
                    showOnFirstVisit={showFirstVisitHelpSpotlight}
                  />
                ) : null}
              </div>
            )}
          </div>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}

      {children != null ? <div className={styles.actions}>{children}</div> : null}
    </div>
  );
}
