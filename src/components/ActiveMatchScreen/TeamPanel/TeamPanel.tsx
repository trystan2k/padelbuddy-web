import { type ComponentPropsWithoutRef, useId } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils/cn';

import type { MatchServingPlayerNumber, MatchTeamId } from '@/core/match/types';

import styles from './TeamPanel.module.css';

interface TeamPanelProps extends Omit<ComponentPropsWithoutRef<'button'>, 'onClick'> {
  teamId: MatchTeamId;
  teamName: string;
  score: string;
  isServing: boolean;
  servingPlayerNumber?: MatchServingPlayerNumber | null;
  showServingIndicator?: boolean;
  onClick: () => void;
}

export function TeamPanel({
  teamId,
  teamName,
  score,
  isServing,
  servingPlayerNumber = null,
  showServingIndicator = true,
  onClick,
  disabled = false,
  className,
  ...props
}: TeamPanelProps) {
  const { t } = useTranslation();
  const servingStatusId = useId();
  const shouldShowServing = isServing && showServingIndicator;
  const servingLabel =
    shouldShowServing && servingPlayerNumber !== null
      ? t('match.servingPlayer', { number: servingPlayerNumber })
      : t('match.serving');
  const displayTeamName =
    shouldShowServing && servingPlayerNumber !== null ? `${teamName} · ${servingLabel}` : teamName;

  const panelClass = teamId === 'team-1' ? styles.team1Panel : styles.team2Panel;
  const servingClass = shouldShowServing ? styles.serving : undefined;

  return (
    <button
      {...props}
      type="button"
      className={cn(styles.panel, panelClass, servingClass, className)}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={t('match.scorePointFor', { teamName })}
      aria-describedby={shouldShowServing ? servingStatusId : undefined}
      data-testid={`team-panel-${teamId}`}
      data-inactivity-ignore=""
    >
      <span className={styles.teamName}>{displayTeamName}</span>
      <span className={styles.score} aria-live="polite">
        {score}
      </span>
      {shouldShowServing && (
        <span id={servingStatusId} className={styles.srOnly}>
          {servingLabel}
        </span>
      )}
    </button>
  );
}
