import './shared'

import { beforeAll } from 'vitest'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { resetI18nInitialization } from '@/lib/i18n/i18n'

// Initialize i18n before all browser tests
beforeAll(async () => {
  // Reset any previous initialization state
  resetI18nInitialization()

  // Initialize i18n with test configuration using initReactI18next
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    },
    resources: {
      en: {
        translation: {
          app: {
            title: 'Padel Buddy',
            description: 'A deliberately styled starter shell for the live score tracker.'
          },
          appShell: {
            eyebrow: 'App foundation',
            lead: 'A deliberately styled starter shell for the live score tracker.',
            statusPills: {
              clientOnly: 'Client-only',
              mobileReady: 'Mobile-ready',
              accessibleBaseline: 'Accessible baseline'
            },
            foundation: {
              sectionLabel: 'Styling foundation',
              sectionTitle: 'Bootstrap status',
              sectionText: 'The shell now establishes shared global styles.'
            },
            foundationItems: {
              tanstackShell: {
                title: 'TanStack Start shell',
                detail: 'Route generation and the client-only bootstrap.'
              },
              designTokens: {
                title: 'Shared design tokens',
                detail: 'Global variables define spacing, color, typography.'
              },
              scopedStyling: {
                title: 'Scoped component styling',
                detail: 'CSS Modules keep shell presentation isolated.'
              }
            },
            baseUiCheck: {
              trigger: 'Open Base UI check',
              eyebrow: 'Interaction baseline',
              title: 'Base UI is wired',
              description: 'This dialog confirms the starter shell.',
              close: 'Close panel'
            }
          },
          notFound: {
            eyebrow: 'Page not found',
            title: 'We could not find that route.',
            description: 'The app foundation is running, but this page does not exist.',
            backLink: 'Go back to the home screen'
          },
          startupGate: {
            loading: {
              eyebrow: 'Startup check',
              title: 'Checking for a saved match',
              body: 'Padel Buddy is restoring the current-match workspace before opening the shell.'
            },
            corrupt: {
              eyebrow: 'Startup recovery',
              title: 'Saved match needs recovery',
              body: 'The current-match record could not be restored safely. Reset the saved match to continue into the app shell.',
              resetButton: 'Reset and continue'
            },
            notice: {
              title: 'Saved match was reset',
              body: 'An older saved match was cleared because it no longer matches the current app schema.',
              dismiss: 'Dismiss'
            },
            resume: {
              eyebrow: 'Saved match found',
              title: 'Resume saved match?',
              body: 'Padel Buddy restored an in-progress current match. Resume keeps the action log and restores the live score state through replay.',
              resumeButton: 'Resume saved match',
              discardButton: 'Discard saved match'
            }
          },
          speech: {
            verbosity: {
              minimal: 'Minimal',
              standard: 'Standard',
              verbose: 'Verbose'
            }
          },
          score: {
            points: {
              '0': 'Love',
              '15': 'Fifteen',
              '30': 'Thirty',
              '40': 'Forty',
              Ad: 'Advantage'
            },
            announcements: {
              all: 'all',
              game: 'Game',
              set: 'Set',
              match: 'Match',
              serving: 'Serving'
            }
          }
        }
      }
    }
  })
})
