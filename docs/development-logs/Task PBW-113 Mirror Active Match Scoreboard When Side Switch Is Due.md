---
title: PBW-113 Mirror Active Match Scoreboard When Side Switch Is Due
type: development-log
permalink: docs/development-logs/task-PBW-113-mirror-active-match-scoreboard-when-side-switch-is-due
---

# Development Log: PBW-113

## Metadata

- Task ID: PBW-113
- Date (UTC): 2026-06-02T14:04:34Z
- Project: padelbuddy-web
- Branch: feature/PBW-113-mirror-active-match-scoreboard-when-side-switch-is-due
- Commit: 73148aa (merged into main)

## Objective

- Mirror the active match scoreboard visual team order when a side switch is due, so players see the physical court sides reflected on screen.
- Derive `isScoreboardMirrored` state purely from existing match data (no new persisted state).
- Propagate the mirrored visual order across TeamPanel columns, SetsCard, and SetsHistoryModal.
- Handle legacy super-tiebreak fallback for mirror parity computation.
- Ensure persistence recovery and E2E startup timing are stable under mirrored layout.
- Final QA gate green across unit, browser, and E2E test suites.

## Implementation Summary

- **Derived mirrored scoreboard state (`isScoreboardMirrored`)**: Added `isScoreboardMirrored: boolean` to `MatchDerivedState` in `derived-state.ts`. Computed as `getMatchSideSwitchCount(state) % 2 === 1` when `setup.sideSwitchPrompts` is `true`; `false` otherwise. Side-switch count is cumulative across completed sets (using standard game count + tiebreak switch intervals) and the active set. This is a derived-only computation — no new persisted fields, no new actions. Parity flips every odd game boundary and every 6 tiebreak points.

- **Visible-column interaction mapping (`visualTeamOrder`)**: `ActiveMatchScreen` reads `derived.isScoreboardMirrored` and produces `visualTeamOrder` as either `['team-1', 'team-2']` (normal) or `['team-2', 'team-1']` (mirrored). This order drives: (1) TeamPanel column layout via `teamColumns.map()`, (2) SetsCard current-set score display via `getSetDisplayScore(set, visualTeamOrder)`, (3) SetsHistoryModal completed-set rows via `reorderVisualTeamScore()`. Scoring clicks on visible columns map back to real team IDs — speech announcements always use real team IDs, not visual order.

- **`VisualTeamOrder` type and helpers**: Introduced `VisualTeamOrder` type (`readonly [MatchTeamId, MatchTeamId]`) and `DEFAULT_VISUAL_TEAM_ORDER` in `sets-history.ts`. Added `reorderVisualTeamScore<Value>()` generic helper that remaps any `TeamScore<Value>` into the visual team order. All display helpers (`getSetDisplayScore`, `getSetsWonScore`) accept optional `visualTeamOrder` parameter.

- **Legacy super-tiebreak fallback/parity handling**: `getMatchSideSwitchCount` counts side switches cumulatively across sets. For completed sets, it uses standard game count + tiebreak switch intervals. For the active set, it adds ongoing game/tiebreak switches. Legacy super-tiebreak sets that lack `tiebreakPoints` (pre-schema matches) recover parity via the active-set's `game.points` shape through `getActiveSetSideSwitchCount`. The `getCompletedSetTiebreakPoints` helper provides the fallback chain: `tiebreakPoints ?? game.points ?? games`.

- **Persistence legacy side-switch fallback**: `persistence.ts` already had `shouldUseLegacySideSwitchPrompts` (broadened in PBW-102 to cover both in-progress and completed records). Legacy records missing `sideSwitchPrompts` default to `true`, so pre-PBW-113 matches correctly compute mirror parity.

- **E2E stability fixes for persistence recovery/startup timing**: Added `expectVisualTeamOrder` helper to `persistence-recovery.edge-case.spec.ts` that polls `data-testid` attributes to confirm visual column order. Added mirrored-resume E2E test that seeds a match with 4 team-1 points (1 game won, mirrored state), resumes it, verifies prompt + mirrored layout, dismisses prompt, reloads, and confirms layout persists without prompt. Introduced `gotoHomeAndWaitForVisible` retry loop with per-attempt timeout (8s) + total budget (26s) to handle cold-start IndexedDB timing. `dismissSideSwitchPromptIfVisible` helper added to `match-flow.ts` for reusable prompt dismissal.

- **Unit tests for mirror parity**: `serve-derived-state.test.ts` covers: side-switch prompts from odd games + tiebreak intervals, cumulative parity across set boundaries (6-0 → mirrored, 6-0+1 → unmirrored, 7-5 → unmirrored), standard tiebreak set parity (7-6 → odd total games, next-set prompt, parity unmirrored), side-switch prompts off disables mirroring, legacy super-tiebreak parity recovery.

- **Browser tests for mirrored UI**: `ActiveMatchScreen.browser.test.tsx` covers: mirrored visual order persists after dismissing side-switch prompt, mirrored visible columns for scoring (speech payload stays on real team IDs), mirrored revert button with tiebreak parity recomputation after undo. Helper functions: `readVisualTeamOrder`, `getVisibleTeamPanel`, `getVisibleRevertButton`, `readDisplayedScore`. `SetsCard.browser.test.tsx` covers mirrored current-set score and accessible label. `SetsHistoryModal.browser.test.tsx` covers mirrored headline and completed-set rows.

- **Final QA gate**: `pnpm complete-check` green — lint, format, type-check, unit, browser, E2E all passing.

## Files Changed

### Core Engine

- `src/core/match/derived-state.ts` — Added `isScoreboardMirrored()` function and `isScoreboardMirrored` field to `deriveMatchState` output; cumulative `getMatchSideSwitchCount` across set boundaries
- `src/core/match/types.ts` — Added `isScoreboardMirrored: boolean` to `MatchDerivedState`

### Display Components

- `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx` — Reads `isScoreboardMirrored`, computes `visualTeamOrder`, maps to `teamColumns` for TeamPanel/SetsCard/SetsHistoryModal, scoring and revert buttons use visible-column mapping
- `src/components/ActiveMatchScreen/SetsCard/SetsCard.tsx` — Accepts `visualTeamOrder` prop, passes to `getSetDisplayScore`
- `src/components/ActiveMatchScreen/SetsHistoryModal/SetsHistoryModal.tsx` — Accepts `visualTeamOrder` prop, passes to `getSetsWonScore` and `reorderVisualTeamScore`
- `src/components/ActiveMatchScreen/sets-history.ts` — Added `VisualTeamOrder` type, `DEFAULT_VISUAL_TEAM_ORDER`, `reorderVisualTeamScore<Value>()` generic; updated `getSetDisplayScore`, `getSetsWonScore` to accept optional `visualTeamOrder`

### Persistence

- `src/lib/current-match/persistence.ts` — Legacy `sideSwitchPrompts` fallback (already from PBW-102, confirmed compatible with mirror parity)

### Unit Tests

- `test/core/match/serve-derived-state.test.ts` — Mirror parity tests: odd-games, tiebreak-interval, cumulative set-boundary parity, standard tiebreak set parity, side-switch-off disables mirroring, legacy super-tiebreak recovery
- `test/components/ActiveMatchScreen/sets-history.test.ts` — `reorderVisualTeamScore` tests, mirrored display score, mirrored sets-won, mirrored set summary parts

### Browser Tests

- `test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx` — Mirrored visual order after dismiss, mirrored scoring columns with speech verification, mirrored revert button with undo parity recomputation
- `test/components/ActiveMatchScreen/SetsCard.browser.test.tsx` — Mirrored current-set score and accessible label
- `test/components/ActiveMatchScreen/SetsHistoryModal.browser.test.tsx` — Mirrored headline and completed-set rows

### E2E Tests

- `e2e/active-match.happy-path.spec.ts` — Scoring flow with side-switch prompts, visual team order assertion after game win, prompt dismissal
- `e2e/persistence-recovery.edge-case.spec.ts` — Mirrored-resume test: seed 4 team-1 points, resume, verify prompt + mirrored layout, dismiss, reload, verify persisted layout; `expectVisualTeamOrder` helper with polling
- `e2e/helpers/match-flow.ts` — `dismissSideSwitchPromptIfVisible` helper, `sideSwitchPrompts` option in `startMatch`

## Key Decisions

- **Derived-only state**: `isScoreboardMirrored` is computed purely from existing match state. No new persisted fields, no new action types. Keeps persistence schema stable and mirror logic deterministic from replay.
- **Cumulative parity across sets**: Side-switch count aggregates completed-set switches + active-set switches. Parity (`% 2`) determines mirror state. This matches real padel rules where side switches accumulate across the match.
- **Visual order as a mapping layer**: `visualTeamOrder` is a display-time transformation. Real team IDs (`team-1`, `team-2`) remain the source of truth for scoring, persistence, speech, and share. Visual order only affects DOM column order and score label remapping.
- **Generic `reorderVisualTeamScore<Value>`**: Single generic function handles all score types (numbers, strings, SetSummaryScorePart objects). Avoids per-type reordering functions.
- **Legacy super-tiebreak parity recovery**: Pre-schema matches missing `tiebreakPoints` recover parity via `getCompletedSetTiebreakPoints` fallback chain (`tiebreakPoints ?? game.points`). Ensures older matches compute mirror state correctly.
- **E2E polling for visual order**: `expectVisualTeamOrder` uses `expect.poll()` instead of direct assertions — React async rendering can cause brief frame where DOM hasn't reordered yet.
- **E2E retry budget pattern**: `gotoHomeAndWaitForVisible` uses per-attempt timeout (8s) + total budget (26s) pattern (consistent with PBW-102's setup-screen fix). Handles cold-start IndexedDB timing without flaky failures.

## Validation Performed

- `pnpm complete-check` — **PASSES** (lint, format, type-check, unit, browser, E2E all green)
- Code review — **APPROVED**
- Architecture review — **APPROVED**
- Copilot PR review — feedback incorporated (legacy completed-match side-switch fallback broadened)

## Risks and Follow-ups

- Mirror state is derived from cumulative side-switch count — if side-switch counting rules change (e.g., different intervals for different formats), `getMatchSideSwitchCount` must be updated.
- Legacy super-tiebreak fallback (`tiebreakPoints ?? game.points ?? games`) can be removed once all pre-tiebreakPoints matches have expired from user devices.
- E2E does not test mirror state across a full multi-set match (only single-set and resume scenarios) — browser tests cover the cumulative parity logic.
- Visual order polling adds ~100ms latency to E2E assertions — acceptable trade-off for stability.
