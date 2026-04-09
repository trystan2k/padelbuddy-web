import styles from './StoreButtons.module.css';
import { useTranslation } from 'react-i18next';

const storeBadgeBaseUrl = `${import.meta.env.BASE_URL}stores`;

export function StoreButtons() {
  const { t, i18n } = useTranslation();

  // Extract base language code (e.g., 'pt-BR' -> 'pt', 'en-US' -> 'en')
  const rawLang = i18n.language ?? i18n.resolvedLanguage ?? 'en';
  const storeBadgeSuffix = rawLang.split('-')[0]?.toLowerCase() ?? 'en';

  return (
    <div className={styles.storeBadges}>
      <a href="#android-store" className={styles.storeBadgeLink} data-testid="store-link-android">
        <img
          src={`${storeBadgeBaseUrl}/GooglePlay_${storeBadgeSuffix}.svg`}
          alt={t('help.advertising.getItOnGooglePlay')}
          className={styles.storeBadge}
        />
      </a>
      <a href="#ios-store" className={styles.storeBadgeLink} data-testid="store-link-ios">
        <img
          src={`${storeBadgeBaseUrl}/AppStore_${storeBadgeSuffix}.svg`}
          alt={t('help.advertising.downloadOnAppStore')}
          className={styles.storeBadge}
        />
      </a>
    </div>
  );
}
