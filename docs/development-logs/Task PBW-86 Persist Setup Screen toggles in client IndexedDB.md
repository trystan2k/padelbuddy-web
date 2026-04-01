---
title: Task PBW-86 Persist Setup Screen toggles in client IndexedDB
type: note
permalink: development-logs/task-pbw-86-persist-setup-screen-toggles-in-client-indexed-db
---

# Development Log: PBW-86

## Metadata

- Task ID: PBW-86
- Date (UTC): 2026-04-01T11:03:45Z
- Project: padelbuddy-web
- Branch: feature/PBW-86-persist-setup-screen-toggles-in-client-indexeddb
- Commit: n/a

## Objective

- Persist Setup Screen toggles and speech preferences in a unified client IndexedDB store.

## Implementation Summary

- Created a unified IndexedDB persistence module at src/lib/setup/setup-storage.ts that stores 10 Setup Screen preferences:
  - From speech (migrated): muted, verbosity, voiceName
  - Setup toggles: audioAnnouncementsEnabled, servingIndicatorEnabled, countdownTimerEnabled, countdownTimerDuration, sideSwitchPrompts, gameMode, decidingSetSuperTiebreak
- Implemented slice-aware saves so speech writes don't clobber setup toggles and vice versa.
- Added legacy migration from old speech-preference store to new setup-preference store.
- Added a hydration guard in useSetupForm to prevent saving defaults before async load completes.
- Restored voiceName only when audioAnnouncementsEnabled is true.
- Bumped IndexedDB version from 5 to 6.
- Removed old src/lib/speech/speech-storage.ts and updated all consumers and test mocks.

## Files Changed

- Created: src/lib/setup/setup-storage.ts, test/lib/setup/setup-storage.test.ts
- Modified: src/lib/persistence/indexed-db.ts, src/components/SetupScreen/useSetupForm.ts, src/components/SetupScreen/SetupScreen.tsx, src/lib/speech/speech-service.ts, src/lib/speech/index.ts
- Deleted: src/lib/speech/speech-storage.ts
- Updated tests: test/lib/speech/speech-service.test.ts, test/lib/speech/speech-service.browser.test.tsx, test/lib/speech/utterance-cancellation.browser.test.tsx, test/current-match/indexed-db.browser.test.ts, test/components/SetupScreen/useSetupForm.browser.test.tsx, test/components/SetupScreen/SetupScreen.browser.test.tsx

## Key Decisions

- Use a single "setup-preference" store to centralize setup and speech preferences to simplify migration and reduce duplication.
- Keep slice-aware writes to avoid race conditions between independent feature slices.
- Only restore voiceName when audioAnnouncementsEnabled is true to avoid applying irrelevant preferences.
- Increment DB version to 6 to trigger migration path for existing clients.

## Validation Performed

- Unit tests: 863 passing
- E2E tests: 24 passing
- pnpm complete-check: all gates pass
- Verified tests and updated mocks where necessary.

## Risks and Follow-ups

- Migration path should be monitored in rollout to catch any clients that fail to upgrade DB schema.
- Ensure analytics/telemetry (if any) handles migrated preferences correctly.
- Consider adding a migration telemetry event and a retry path for failed migrations.
