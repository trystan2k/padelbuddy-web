import { createFileRoute } from '@tanstack/react-router';

import { PrivacyPage } from '@/components/PrivacyPage/PrivacyPage';
import { i18n } from '@/lib/i18n/i18n';

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      {
        title: i18n.t('privacy.page.meta.title')
      },
      {
        name: 'description',
        content: i18n.t('privacy.page.meta.description')
      }
    ]
  }),
  component: PrivacyPage
});
