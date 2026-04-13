---
title: Task PBW-98 Add Media Buttons Remote Control Mode
type: note
permalink: padelbuddy-web/development-logs/task-pbw-98-add-media-buttons-remote-control-mode
---

# Development Log: PBW-98

## Metadata

- Task ID: PBW-98
- Date (UTC): 2026-04-13T06:40:58Z
- Project: padelbuddy-web
- Branch: feature/PBW-98-media-buttons-remote
- Commit: n/a

## Objective

- Add Media Buttons remote control mode to allow users to score/revert points using media keys (Volume Up/Down, Next/Previous Track) on both Web and Native apps.

## Implementation Summary

- Remote controller config model evolved from keyboard-only bindings to `{ mode, keyboardBindings, updatedAt }`.
- New default mode is 'media-buttons' for fresh installs; legacy keyboard-only configs migrate to 'keyboard-mapping' mode.
- Fixed media button mappings: Volume Up → Team A score, Volume Down → Team A revert, Next Track → Team B score, Previous Track → Team B revert.
- RemoteConfigurationModal updated with mode selector (Media Buttons / Keyboard Mapping toggle).
- Media Buttons mode shows fixed read-only mappings; Keyboard Mapping mode preserves existing customizable behavior.
- `useMediaButtonsRemote` hook integrates with Web `navigator.mediaSession` and DOM keydown fallback.
- Native Capacitor bridge wired for Android/iOS media button events.
- Media Session activation independent from audio announcements.

## Files Changed

Created:

- src/lib/input/remote-controller-config.ts
- src/lib/input/media-buttons.ts
- src/lib/input/use-media-buttons-remote.tsx
- src/lib/input/media-buttons-native.ts
- mobile/android/app/src/main/java/com/padelbuddy/web/MediaButtonsPlugin.java
- mobile/ios/App/App/MediaButtonsPlugin.swift

Modified:

- src/lib/input/remote-controller-storage.ts
- src/components/SetupScreen/RemoteConfigurationModal.tsx
- src/components/SetupScreen/RemoteConfigurationModal.module.css
- src/components/SetupScreen/SetupScreen.tsx
- src/components/ActiveMatchScreen/ActiveMatchScreen.tsx
- src/lib/i18n/locales/en.ts
- src/lib/i18n/locales/es.ts
- src/lib/i18n/locales/pt.ts
- mobile/android/app/src/main/java/com/padelbuddy/web/MainActivity.java
- mobile/ios/App/App/capacitor.config.json
- various test files

## Key Decisions

1. Config model: single remote-controller config object with mode + keyboard bindings.
2. Legacy migration: existing keyboard-only configs automatically migrate to 'keyboard-mapping' mode.
3. Isolation: separate `useMediaButtonsRemote` hook keeps keyboard path unchanged.
4. Native bridge wired into hook via `Capacitor.isNativePlatform()` check.

## Validation Performed

- pnpm complete-check: PASS (973 unit tests, 84 E2E tests, all gates passed)
- TypeScript: 0 errors
- Lint: 0 warnings, 0 errors
- Build: Client + SSR built successfully

## Risks and Follow-ups

- Native media button hardware interception needs real device testing.
- iOS plugin registered in capacitor.config.json but may need additional AppDelegate setup.
