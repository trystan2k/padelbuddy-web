import { useTranslation } from 'react-i18next';

import type { HelpSectionContent } from './help-page-content';
import { HelpScreenshotPlaceholder } from './HelpScreenshotPlaceholder';
import styles from './HelpLandingPage.module.css';

interface HelpSectionProps {
  section: HelpSectionContent;
}

export function HelpSection({ section }: HelpSectionProps) {
  const { t } = useTranslation();

  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className={styles.section}>
      <header className={styles.sectionHeader}>
        <h2 id={`${section.id}-title`} className={styles.sectionTitle}>
          {t(section.titleKey)}
        </h2>
        <p className={styles.sectionBody}>{t(section.bodyKey)}</p>
      </header>

      {section.items.length > 0 && (
        <ul className={styles.itemList}>
          {section.items.map((item) => (
            <li key={item.titleKey} className={styles.itemListEntry}>
              <div className={styles.itemCard}>
                <h3 className={styles.itemTitle}>{t(item.titleKey)}</h3>
                <p className={styles.itemBody}>{t(item.bodyKey)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {section.media.length > 0 && (
        <div className={styles.mediaStack}>
          {section.media.map((mediaId) => (
            <HelpScreenshotPlaceholder key={mediaId} mediaId={mediaId} />
          ))}
        </div>
      )}
    </section>
  );
}
