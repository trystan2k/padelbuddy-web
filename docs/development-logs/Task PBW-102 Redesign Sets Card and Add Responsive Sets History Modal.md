---
title: PBW-102 Redesign Sets Card and Add Responsive Sets History Modal
type: development-log
permalink: docs/development-logs/task-PBW-102-redesign-sets-card-and-add-responsive-sets-history-modal
---

# Development Log: PBW-102

## Metadata

- Task ID: PBW-102
- Date (UTC): 2026-05-24T15:21:19Z
- Project: padelbuddy-web
- Branch: feature/PBW-102-redesign-sets-card-and-add-responsive-sets-history-modal
- Commit: d8d383c (staged changes awaiting commit)
- Sub-issues: PBW-111 (SetsCard redesign), PBW-110 (SetsHistoryModal), PBW-109 (auto-open/close logic)

## Objective

- Redesign SetsCard to show only the current-set score as a compact trigger.
- Build a responsive SetsHistoryModal (Base UI dialog) that displays overall sets score in the header and completed-set history only.
- Add a setup-screen toggle for auto-open behavior that persists via IndexedDB.
- Stabilize E2E cold-start specs and fix modal focus/scroll issues.

## Implementation Summary

- **SetsCard redesign (PBW-111)**: Replaced the full set-grid card with a compact trigger showing only the current set score. Tapping the card opens the SetsHistoryModal. Removed scroll-based grid logic. Uses `getCurrentSet` / `getSetDisplayScore` helpers from `sets-history.ts`. Super-tiebreak display falls back to tiebreak points when individual game scores are not meaningful.

- **SetsHistoryModal (PBW-110)**: New modal built on `@base-ui/react` dialog. Header displays overall sets-won score (e.g. "Sets 1 – 0") via `getSetsWonScore`. Body renders only completed sets — no in-progress set shown. Fixed focus management so dialog receives focus on open; fixed scroll containment so background does not scroll. 30-second auto-close timer with full state reset on close. Finish-navigation bypass suppresses auto-open when match-end transition is imminent. Super-tiebreak sets fall back to `tiebreakPoints` (with legacy `game.points` shape support).

- **Auto-open setup toggle**: New `autoOpenSetsHistoryModal` boolean added to `SetupFormData`, `MatchSetupInput`, `MatchSetup`, and `SetupPreferences`. Toggle exposed on SetupScreen UI. Value persists through `setup-storage.ts` (IndexedDB) with `true` as default for new installs. Parsing uses `typeof` guard for backward compatibility with stored records missing the field.

- **Side-switch default change**: `sideSwitchPrompts` default changed from `true` to `false` in `defaultSetupPreferences`. Legacy matches (both in-progress and completed) without the field in their persisted record fall back to `true` via `shouldUseLegacySideSwitchPrompts` guard in `persistence.ts`, preserving existing behavior. Originally scoped to in-progress only (`shouldUseLegacyInProgressSideSwitchPrompts`); Copilot follow-up broadened the guard to cover completed records too — completed matches loaded for review/share also need the legacy fallback since they predate the field.

- **E2E cold-start stabilization**: Refactored `match-flow.ts` helper — replaced single `setupReadyTimeoutMs` (15s) with per-attempt timeout (8s) + total budget (26s). Added `resetPersistence` option to clear IndexedDB before navigation. Added `autoOpenSetsHistoryModal` option to match-flow start-match API. Updated all 7 E2E specs to accommodate SetsCard UI changes and new setup fields.

- **i18n**: Added translation keys for modal title, set history labels, and super-tiebreak badge across en, es, pt locales.

## Files Changed

### Core Components

- `src/components/ActiveMatchScreen/SetsCard/SetsCard.tsx` — Compact current-score trigger with `onOpenHistory` callback
- `src/components/ActiveMatchScreen/SetsCard/SetsCard.module.css` — Simplified styles for single-row card
- `src/components/ActiveMatchScreen/SetsHistoryModal/SetsHistoryModal.tsx` — New modal: Base UI dialog, overall header score, completed-set history only, auto-close timer
- `src/components/ActiveMatchScreen/SetsHistoryModal/SetsHistoryModal.module.css` — Modal styles with responsive breakpoints
- `src/components/ActiveMatchScreen/sets-history.ts` — Helpers: `getCurrentSet`, `getSetDisplayScore`, `getSetsWonScore`, `getSetsHistoryAutoOpenSignature`, super-tiebreak legacy score fallback
- `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx` — Integrated SetsHistoryModal, auto-open hook, `autoOpenSetsHistoryModal` from match setup
- `src/components/ActiveMatchScreen/ActiveMatchScreen.module.css` — Layout adjustments for modal integration

### Setup Screen & Match Types

- `src/components/SetupScreen/SetupScreen.tsx` — Added auto-open toggle UI control
- `src/components/SetupScreen/types.ts` — Added `autoOpenSetsHistoryModal` to `SetupFormData`
- `src/components/SetupScreen/useSetupForm.ts` — Toggle state management in setup form
- `src/core/match/types.ts` — Added `autoOpenSetsHistoryModal` to `MatchSetupInput` (optional) and `MatchSetup` (required)
- `src/core/match/validation.ts` — Validation for new field

### Persistence & Storage

- `src/lib/setup/setup-storage.ts` — Added field to `SetupPreferences`, default `true`, `typeof` guard in parser for backward compat
- `src/lib/current-match/persistence.ts` — Parse `autoOpenSetsHistoryModal` with fallback to `true`; `shouldUseLegacySideSwitchPrompts` (broadened from in-progress-only to all records) for `sideSwitchPrompts` backward compat

### Localization

- `src/lib/i18n/locales/en.ts` — English keys for sets history modal
- `src/lib/i18n/locales/es.ts` — Spanish keys for sets history modal
- `src/lib/i18n/locales/pt.ts` — Portuguese keys for sets history modal

### Tests

- `test/components/ActiveMatchScreen/SetsCard.browser.test.tsx` — Updated for compact card layout
- `test/components/ActiveMatchScreen/SetsHistoryModal.browser.test.tsx` — New modal browser tests
- `test/components/ActiveMatchScreen/sets-history.test.ts` — Unit tests for all sets-history helpers
- `test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx` — Updated integration tests
- `test/components/SetupScreen/SetupScreen.browser.test.tsx` — Tests for auto-open toggle
- `test/components/SetupScreen/useSetupForm.browser.test.tsx` — Updated form tests
- `test/components/SetupScreen/validateSetupForm.test.ts` — Validation test for new field
- `test/current-match/indexed-db.browser.test.ts` — Updated persistence tests
- `test/current-match/persistence.test.ts` — Tests for `autoOpenSetsHistoryModal`, legacy in-progress side-switch fallback, and regression test for completed-record side-switch fallback
- `test/lib/setup/setup-storage.test.ts` — Tests for new field storage and parsing

### E2E

- `e2e/helpers/match-flow.ts` — Refactored cold-start: per-attempt timeout + total budget, `resetPersistence`, `autoOpenSetsHistoryModal` option
- `e2e/active-match.happy-path.spec.ts` — Updated for SetsCard UI
- `e2e/match-end.happy-path.spec.ts` — Updated for SetsCard UI
- `e2e/tiebreaks.edge-case.spec.ts` — Updated for super-tiebreak display
- `e2e/undo.edge-case.spec.ts` — Updated for SetsCard interactions
- `e2e/persistence-recovery.edge-case.spec.ts` — Updated for SetsCard state
- `e2e/golden-point.edge-case.spec.ts` — Updated for SetsCard display
- `e2e/advantage-deuce.edge-case.spec.ts` — Updated for SetsCard display
- `e2e/responsive-layout.spec.ts` — Updated for responsive modal layout

### Documentation

- `docs/plan/Plan PBW-102 Redesign sets card and add responsive sets history modal.md` — Implementation plan

## Key Decisions

- **Base UI Dialog**: Chose `@base-ui/react` dialog for built-in a11y, focus trap, render-props API. Consistent with PBW-39 migration.
- **Header shows overall sets score**: `getSetsWonScore` counts completed-set winners — gives immediate context without scanning rows.
- **Completed-set history only**: In-progress set excluded from modal body to avoid confusion between live score (card) and historical score (modal).
- **Auto-open only on set completion**: Auto-open fires when the set-completion signature changes (`getSetsHistoryAutoOpenSignature`), not on every render. Prevents spurious opens.
- **Auto-open setup toggle with persistence**: New field defaults `true` for new installs. Stored in IndexedDB via `setup-storage`. Parsing uses `typeof` guard for backward compat with records missing the field.
- **Side-switch default `false` for new setups**: Changed default in `defaultSetupPreferences`. Legacy matches (in-progress and completed) without the field fall back to `true` via `shouldUseLegacySideSwitchPrompts` guard in `persistence.ts`. Guard was initially scoped to in-progress only; Copilot follow-up broadened it to completed records too since completed matches loaded for review/share also predate the field. No silent behavior change for any existing matches.
- **30-second auto-close with full reset**: Timer-based close avoids modal hanging. State fully resets (no memory leaks, no stale timers).
- **Finish-navigation bypass**: Auto-open suppressed when match-end transition is imminent — prevents modal flash before screen change.
- **Super-tiebreak legacy fallback**: `getCompletedSuperTiebreakScore` tries `tiebreakPoints` first, then legacy `game.points` shape, then falls back to `set.games`. Handles matches persisted before the tiebreakPoints field was added.
- **E2E cold-start fix**: Replaced single 15s timeout with 8s per-attempt + 26s total budget in `match-flow.ts`. Reduces flaky failures on slow CI.

## Validation Performed

- `pnpm complete-check` — **PASSES** (lint, format, unit, browser, e2e all green) — re-verified after Copilot follow-up fix
- Code review — **APPROVED** (final review)
- Architecture review — **APPROVED** (final architecture review)

## Risks and Follow-ups

- Auto-open timing may need tuning if users report intrusiveness during rapid set transitions.
- Super-tiebreak display uses score fallback; a point-by-point visualization could be a future enhancement.
- E2E does not explicitly test the 30-second auto-close timer (timing-dependent tests are fragile); browser tests cover the close logic.
- Legacy super-tiebreak shape fallback can be removed once all pre-tiebreakPoints matches have expired from user devices.
- Legacy `sideSwitchPrompts` fallback (broadened to all records) can be removed once all pre-field matches have expired from user devices.
