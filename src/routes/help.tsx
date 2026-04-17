import { createFileRoute } from '@tanstack/react-router';

import { HelpLandingPage } from '@/components/HelpLandingPage/HelpLandingPage';
import { i18n } from '@/lib/i18n/i18n';

export const Route = createFileRoute('/help')({
  head: () => ({
    meta: [
      {
        title: i18n.t('help.page.meta.title')
      },
      {
        name: 'description',
        content: i18n.t('help.page.meta.description')
      }
    ]
  }),
  component: HelpLandingPage
});
