import styles from './SocialButtons.module.css';

const socialBadgeBaseUrl = `${import.meta.env.BASE_URL}social`;
const instagramProfileUrl = 'https://www.instagram.com/padelbuddyweb/';

export function SocialButtons() {
  return (
    <div className={styles.socialBadges}>
      <a
        href={instagramProfileUrl}
        className={styles.socialBadgeLink}
        data-testid="social-link-instagram"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src={`${socialBadgeBaseUrl}/instagram.svg`}
          alt="Instagram @padelbuddyweb"
          className={styles.socialBadge}
        />
      </a>
    </div>
  );
}
