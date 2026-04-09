import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/Card/Card';

import styles from './InfoCard.module.css';

interface InfoCardProps {
  isGoldenPoint: boolean;
  isSuperTiebreak: boolean;
  sideSwitchPrompts: boolean;
}

/**
 * InfoCard component - Displays court details (golden point, super tiebreak, side-switch prompts).
 * Follows Pencil design node ID: 5ynmX
 * Container: 177px width, corner radius 20px
 */
export function InfoCard({ isGoldenPoint, isSuperTiebreak, sideSwitchPrompts }: InfoCardProps) {
  const { t } = useTranslation();

  return (
    <Card className={styles.container} data-testid="info-card">
      <span className={styles.label}>{t('match.info.title')}</span>
      <div className={styles.items}>
        <span className={styles.item}>
          {isGoldenPoint ? t('match.info.goldenPointOn') : t('match.info.goldenPointOff')}
        </span>
        <span className={styles.item}>
          {isSuperTiebreak ? t('match.info.superTiebreakOn') : t('match.info.superTiebreakOff')}
        </span>
        <span className={styles.item}>
          {sideSwitchPrompts ? t('match.info.sideSwitchOn') : t('match.info.sideSwitchOff')}
        </span>
      </div>
    </Card>
  );
}
