---
title: Task PBW-14 Localization and Speech Services
type: note
permalink: development-logs/task-pbw-14-localization-and-speech-services
---

# Development Log: PBW-14

## Metadata

- Task ID: PBW-14
- Date (UTC): 2026-03-14T16:08:13Z
- Project: padelbuddy-web
- Branch: feature/PBW-14-localization-and-speech-services
- Commit: n/a

## Objective

- Add localization (i18n) and browser-native speech services for match event narration and persistent locale preference.

## Implementation Summary

- Implemented an i18n module using react-i18next with browser language detection and IndexedDB persistence. Added translation files for English (en), Portuguese (pt), and Spanish (es).
- Implemented a speech synthesis module leveraging the Web Speech API with voice selection fallbacks, message templates for match events, verbosity levels, and an utterance queue with cancellation.
- Updated AppShell, NotFoundPage, and CurrentMatchStartupGate to use translations and initialized i18n in the root route.
- Added tests and test setup for i18n and speech; test suite reports 336 tests passing and 88.94% coverage.

## Files Changed

- src/lib/i18n/ (8 files: types, storage, detector, config, locales, index)
- src/lib/speech/ (6 files: types, storage, voice-selector, message-generator, service, index)
- src/routes/\_\_root.tsx
- src/components/ (3 components: AppShell, NotFoundPage, CurrentMatchStartupGate)
- test/lib/i18n/ (2 test files)
- test/lib/speech/ (4 test files)
- test/setup/browser.ts

## Key Decisions

- Chose react-i18next for straightforward React integration and compatibility with TanStack Start client-only setup.
- Persisted locale preference in IndexedDB to align with existing client-side persistence patterns.
- Used Web Speech API for native browser speech synthesis to avoid third-party dependencies and reduce bundle size.
- Kept i18n and speech logic in separate modules for clear separation of concerns and easier testing.

## Validation Performed

- npm test: pass - 336 tests passing, coverage 88.94% (as reported by test runner)
- Basic smoke check: verified i18n initialization added to root route and components updated for translation keys.

## Risks and Follow-ups

- Web Speech API voice availability varies by browser and OS; fallback to English or mute is implemented but may result in degraded UX on unsupported platforms.
- Consider server-side i18n support if SSR is introduced in the future; current setup is client-only.
- Add runtime feature flagging to allow disabling speech synthesis for accessibility testing and mobile bandwidth considerations.
