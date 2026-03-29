---
title: Task PBW-84 Chair Umpire Audio Announcements
type: note
permalink: development-logs/task-pbw-84-chair-umpire-audio-announcements
---

# Development Log: PBW-84

## Metadata

- Task ID: PBW-84
- Date (UTC): 2026-03-29T00:00:00Z
- Project: padelbuddy-web
- Branch: feature/PBW-84-chair-umpire-audio
- Commit: n/a

## Objective

- Add chair-umpire style audio announcements for match play and make them toggleable in setup.

## Implementation Summary

- Added `audioAnnouncementsEnabled` toggle to MatchSetup (default: true, persisted)
- Added toggle to top of Rules card in Setup Screen with scrollable card
- Updated speech message generator with chair-umpire terminology:
  - Standard scores: "Fifteen - Love", "Thirty - All"
  - Deuce (at 40-40 in Advantage mode)
  - Golden Point (at 40-40 in Golden Point mode)
  - Correction prefix for undo
  - Game point / Break point announcements
- ActiveMatchScreen respects audioAnnouncementsEnabled toggle

## Files Changed

- src/core/match/types.ts
- src/core/match/validation.ts
- src/core/match/index.ts
- src/lib/current-match/persistence.ts
- src/components/SetupScreen/types.ts
- src/components/SetupScreen/useSetupForm.ts
- src/components/SetupScreen/SetupScreen.tsx
- src/components/SetupScreen/SetupScreen.module.css
- src/lib/speech/types.ts
- src/lib/speech/message-generator.ts
- src/lib/speech/index.ts
- src/lib/i18n/locales/en.ts
- src/lib/i18n/locales/pt.ts
- src/lib/i18n/locales/es.ts
- src/components/ActiveMatchScreen/ActiveMatchScreen.tsx
- related test files

## Key Decisions

- Used parser fallback for legacy records (no schema version bump)
- Ref mutation fixed with useLayoutEffect
- normalizeScoreValue exported and shared to avoid duplication

## Validation Performed

- Unit tests: pass - updated tests for message-generator and setup toggles
- Manual smoke: pass - toggling in Setup disables/enables announcements in ActiveMatchScreen

## Risks and Follow-ups

- Need to review existing persisted matches for any edge cases where legacy records lack the new field; fallback covers most cases
- Consider adding end-to-end tests covering speech output triggers in CI
