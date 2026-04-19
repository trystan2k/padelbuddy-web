import { useTranslation } from 'react-i18next';

import type { HelpPageMediaId } from './help-page-content';
import styles from './HelpLandingPage.module.css';

interface HelpScreenshotPlaceholderProps {
  mediaId: HelpPageMediaId;
}

/** Media IDs that have static (non-localised) images. */
const staticMediaSrcById: Partial<Record<HelpPageMediaId, string>> = {
  hero: '/help/herocreenshot.png'
};

/** Media IDs that have per-language screenshots named `{id}_{lang}.png`. */
const localisedMediaIds = new Set<HelpPageMediaId>([
  'mainFlow',
  'setupOverview',
  'remoteConfig',
  'voiceSelection',
  'liveMatch',
  'sideSwitch',
  'shareImage',
  'matchEnd',
  'historyList',
  'historyEmpty',
  'resumeDialog',
  'helpSpotlight',
  'platformComparison'
]);

/** Maps a camelCase mediaId to the lowercase filename stem used on disk. */
function toFileStem(mediaId: HelpPageMediaId): string {
  return mediaId.toLowerCase();
}

export function HelpScreenshotPlaceholder({ mediaId }: HelpScreenshotPlaceholderProps) {
  const { t, i18n } = useTranslation();
  const keyPrefix = `help.page.media.${mediaId}`;

  let mediaSrc: string | undefined;
  if (localisedMediaIds.has(mediaId)) {
    const lang = i18n.language ?? 'en';
    mediaSrc = `/help/${toFileStem(mediaId)}_${lang}.png`;
  } else {
    mediaSrc = staticMediaSrcById[mediaId];
  }

  return (
    <figure className={styles.placeholderFigure}>
      <div className={styles.placeholderSurface} role="img" aria-label={t(`${keyPrefix}.title`)}>
        {mediaSrc && <img src={mediaSrc} alt={t(`${keyPrefix}.title`)} />}
      </div>
      <figcaption className={styles.placeholderCaption}>
        <strong>{t('help.page.common.captionLabel')}:</strong> {t(`${keyPrefix}.caption`)}{' '}
        <strong>{t('help.page.common.captureHintLabel')}:</strong> {t(`${keyPrefix}.captureHint`)}
      </figcaption>
    </figure>
  );
}
