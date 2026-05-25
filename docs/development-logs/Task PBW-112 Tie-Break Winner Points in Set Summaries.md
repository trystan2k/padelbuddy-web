---
title: PBW-112 Tie-Break Winner Points in Set Summaries
type: development-log
permalink: docs/development-logs/task-pbw-112-tie-break-winner-points-in-set-summaries
---

# Development Log: PBW-112

## Metadata

- Task ID: PBW-112
- Date (UTC): 2026-05-25T12:00:00Z
- Project: padelbuddy-web
- Branch: feature/PBW-112-tie-break-winner-points-set-summaries
- Commit: c4766e0 (branch not yet merged)

## Objective

- Show both tiebreak point totals (winner + loser) in completed standard tie-break sets with smaller typography where space permits. Surfaces: match end summary, history games column, active match sets history modal, shared result image/card.

## Implementation Summary

- Added/refined shared model `src/core/match/set-summary.ts` for structured set score data.
- Created reusable presentational atom `src/components/SetScoreValue/SetScoreValue.tsx` rendering tiebreak detail conditionally.
- Updated four consumer surfaces to consume the shared model and atom:
  - **Match end summary** (`MatchSummaryCard`) — tiebreak sets show full point totals with smaller font.
  - **History screen games column** (`HistoryScreen`) — same treatment in history table.
  - **Active match sets history modal** (`SetsHistoryModal`) — same treatment in modal view.
  - **Share screen / card** (`ShareScreen`, `match-share.ts`) — same treatment in shareable image.
- Applied maintainability fixes:
  - Removed string round-trip parsing — scores now flow as structured data, not serialized/parsed strings.
  - Unified history visible/share score derivation into single shared path.
  - Reused `SetScoreValue` atom across all surfaces instead of per-surface inline rendering.
- Behavior preserved for: super tiebreak sets, non-tiebreak sets, in-progress sets.

## Files Changed

### Shared Model & Presentational Atom

- `src/core/match/set-summary.ts` — structured set score model with tiebreak point data
- `src/components/SetScoreValue/SetScoreValue.tsx` — reusable atom rendering set score with optional tiebreak detail

### Match End Summary

- `src/components/MatchEndScreen/MatchSummaryCard.tsx` — consume shared model + atom
- `src/components/MatchEndScreen/MatchSummaryCard.module.css` — smaller typography for tiebreak points
- `src/components/MatchEndScreen/view-model.ts` — derive structured set summaries from match state

### History Screen

- `src/components/HistoryScreen/HistoryScreen.tsx` — consume shared model + atom
- `src/components/HistoryScreen/HistoryScreen.module.css` — styling for tiebreak detail in games column

### Active Match Sets History Modal

- `src/components/ActiveMatchScreen/SetsHistoryModal/SetsHistoryModal.tsx` — consume shared model + atom
- `src/components/ActiveMatchScreen/SetsHistoryModal/SetsHistoryModal.module.css` — styling adjustments

### Share Screen / Card

- `src/components/ShareScreen/ShareScreen.tsx` — consume shared model + atom
- `src/components/ShareScreen/ShareScreen.module.css` — styling for tiebreak detail in share image
- `src/lib/share/match-share.ts` — unified share score derivation using shared model

### Tests

- `test/components/MatchEndScreen/view-model.test.ts` — unit tests for set-summary view model
- `test/components/MatchEndScreen/MatchEndScreen.browser.test.tsx` — browser tests for match end display
- `test/components/HistoryScreen/HistoryScreen.browser.test.tsx` — browser tests for history display
- `test/components/ActiveMatchScreen/SetsHistoryModal.browser.test.tsx` — browser tests for modal display
- `test/components/ShareScreen/ShareScreen.browser.test.tsx` — browser tests for share card display

### E2E

- `e2e/history.happy-path.spec.ts` — updated happy-path with tiebreak score expectations
- `e2e/tiebreaks.edge-case.spec.ts` — updated edge-case specs for tiebreak detail rendering

## Key Decisions

- **Shared `set-summary.ts` model over per-surface parsing**: Eliminates string round-trip parsing; single source of truth for set score structure. Reduces drift risk across surfaces.
- **Reusable `SetScoreValue` atom**: Centralizes tiebreak rendering logic. Any new surface displaying set scores reuses this component. Avoids four duplicate implementations.
- **Smaller typography only where space permits**: Tiebreak point totals rendered with reduced font size to avoid layout overflow. Constraint-driven decision per surface.
- **Super tiebreak / non-tiebreak / in-progress unchanged**: Explicit no-op guard ensures existing behavior preserved. Reduces regression risk.

## Validation Performed

- `pnpm complete-check` — full suite passes (lint, format, type-check, unit tests, browser tests, e2e).
- Manual verification across all four surfaces: match end, history, modal, share card.
- Confirmed super tiebreak sets render unchanged (no tiebreak detail shown).
- Confirmed non-tiebreak sets render unchanged.
- Confirmed in-progress sets render unchanged.

## Risks and Follow-ups

- **Share card image width**: Tiebreak detail in share card uses smaller font; extremely long scores (e.g., 20-18) may still overflow on narrow share images. Monitor and potentially truncate or scale dynamically.
- **E2E visual regression**: No automated visual regression tests yet. Consider adding screenshot comparison for tiebreak score rendering across surfaces.
- **Future surfaces**: Any new surface needing set scores should import `SetScoreValue` directly — document this convention in component README or architecture notes.
