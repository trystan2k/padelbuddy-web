---
title: PBW-103 Configurable Super Tiebreak with Subtask Delivery
type: development-log
permalink: docs/development-logs/task-pbw-103-configurable-super-tiebreak
---

# Development Log: PBW-103

## Metadata

- Task ID: PBW-103
- Date (UTC): 2026-05-24T00:00:00Z
- Project: padelbuddy-web
- Branch: feature/PBW-103-configurable-super-tiebreak
- Commit: n/a (multi-commit delivery)

## Objective

- Implement configurable super tiebreak target points (7/9/11) with default 11, delivered through subtasks PBW-104 through PBW-108. Preserve legacy in-progress match compatibility for historical target 10 via explicit metadata and fallback logic. Ensure full unit, browser, and E2E regression coverage with final QA pass.

## Implementation Summary

- **PBW-104 — Core validation/types**: Added super tiebreak target type (`SuperTiebreakTarget = 7 | 9 | 11`), validation helpers, default value 11. Extended match configuration types to carry the new field.
- **PBW-105 — Engine & replay**: Updated scoring engine to use configurable target instead of hardcoded 10. Replayed match logic respects persisted target per match. Legacy in-progress matches with no explicit metadata fall back to target 10 (historical default).
- **PBW-106 — Setup persistence**: Extended IndexedDB persistence layer to store `superTiebreakTarget` in match config. Default 11 for new matches. Backward-compatible reads for records missing the field.
- **PBW-107 — Setup UI**: Added super tiebreak target selector (7/9/11 pills) to setup screen. Visual feedback for selected value. Persists choice to match config on start.
- **PBW-108 — Locales, help copy, E2E helpers/specs, regression coverage**: Updated i18n keys for all supported locales with super tiebreak descriptions. Updated help modal content. Added E2E page-object helpers for target selection. Added E2E specs covering 7/9/11 scenarios. Updated unit and browser tests for engine edge cases and UI rendering. Updated existing E2E specs to reflect new default (11 vs old 10).
- **Final QA & E2E stability**: Ran `pnpm complete-check` — all lint, format, type-check, unit, browser, and E2E tests pass. Fixed flaky E2E selectors and timing issues.

### Subtask Breakdown

| Subtask | Scope                                                   | Status |
| ------- | ------------------------------------------------------- | ------ |
| PBW-104 | Core types, validation, defaults                        | Done   |
| PBW-105 | Scoring engine, replay, legacy fallback                 | Done   |
| PBW-106 | IndexedDB persistence, backward compat                  | Done   |
| PBW-107 | Setup screen UI, target selector                        | Done   |
| PBW-108 | Locales, help copy, E2E helpers/specs, regression tests | Done   |

## Files Changed

- Core types & validation:
  - `src/types/match.types.ts` — Added `SuperTiebreakTarget` type, extended `MatchConfig`
  - `src/validation/match-config.validation.ts` — Target validation helpers
- Engine & replay:
  - `src/engine/scoring.engine.ts` — Configurable target logic, legacy fallback
  - `src/engine/replay.ts` — Replay respects per-match target
- Persistence:
  - `src/store/match-store.ts` — Extended config persistence
  - `src/store/schemas/match-config.schema.ts` — IndexedDB schema for new field
- Setup UI:
  - `src/screens/setup-screen/setup-screen.tsx` — Target selector component
  - `src/screens/setup-screen/setup-screen.module.css` — Selector styles
- Locales & help:
  - `src/locales/en.ts` — Super tiebreak target strings
  - `src/locales/es.ts` — Spanish translations
  - `src/locales/pt.ts` — Portuguese translations
  - `src/components/help-modal/help-content.tsx` — Updated help copy
- Tests:
  - `src/engine/__tests__/scoring.engine.test.ts` — Unit tests for configurable targets
  - `src/screens/setup-screen/__tests__/setup-screen.browser.test.ts` — Browser tests for selector
  - `e2e/specs/super-tiebreak.spec.ts` — E2E specs for 7/9/11 scenarios
  - `e2e/helpers/super-tiebreak.helper.ts` — E2E page-object helpers
  - Updated existing E2E specs for new default target

## Key Decisions

- **Default target 11**: Chosen as the official WPA/ITF padel super tiebreak standard. Previous hardcoded 10 was non-standard.
- **Legacy target 10 fallback**: In-progress matches persisted before this feature lack `superTiebreakTarget` metadata. Engine detects absence and falls back to 10 to preserve match integrity and avoid breaking ongoing games.
- **Target options limited to 7/9/11**: Prevents invalid configurations while covering common club/league variations. Enforced at type level via union type, not runtime check alone.
- **Metadata-first approach**: Target stored per-match in config, not globally. Allows different matches to use different targets without state conflicts.

## Validation Performed

- `pnpm complete-check` — Full pipeline pass (lint, format, type-check, unit, browser, E2E)
- Unit tests: configurable target scoring logic for 7, 9, and 11 points; edge cases (deuce at target-1, win by 2)
- Browser tests: setup screen selector rendering, interaction, persistence verification
- E2E tests: full match flow with each target; legacy in-progress match resume with implicit target 10
- Manual verification: setup screen visual, match play-through to super tiebreak for each target

## Risks and Follow-ups

- **Risk**: Existing deployed matches in IndexedDB without `superTiebreakTarget` field rely on fallback logic. If fallback is accidentally removed, those matches could break. Mitigation: fallback is covered by E2E regression test.
- **Risk**: Future tiebreak rule changes (e.g., win-by-1 instead of win-by-2) would require engine changes beyond target config alone.
- **Follow-up**: Monitor user feedback on target options — may add custom target input if clubs request non-standard values.
- **Follow-up**: Consider adding super tiebreak target to match end screen summary for clarity.
