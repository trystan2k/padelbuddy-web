import { useTranslation } from 'react-i18next';

import type { HelpPageMediaId } from './help-page-content';
import styles from './HelpLandingPage.module.css';

interface HelpScreenshotPlaceholderProps {
  mediaId: HelpPageMediaId;
}

export function HelpScreenshotPlaceholder({ mediaId }: HelpScreenshotPlaceholderProps) {
  const { t } = useTranslation();
  const keyPrefix = `help.page.media.${mediaId}`;

  return (
    <figure className={styles.placeholderFigure}>
      <div className={styles.placeholderSurface} role="img" aria-label={t(`${keyPrefix}.title`)}>
        <p className={styles.placeholderBadge}>{t(`${keyPrefix}.description`)}</p>
      </div>
      <figcaption className={styles.placeholderCaption}>
        <strong>{t('help.page.common.captionLabel')}:</strong> {t(`${keyPrefix}.caption`)}{' '}
        <strong>{t('help.page.common.captureHintLabel')}:</strong> {t(`${keyPrefix}.captureHint`)}
      </figcaption>
    </figure>
  );
}
