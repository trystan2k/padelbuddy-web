---
title: Task PBW-68 Code Review and Improvements
type: note
permalink: development-logs/task-pbw-68-code-review-and-improvements
---

# Development Log: PBW-68 Code Review and Improvements

## Metadata

- Task ID: PBW-68
- Date (UTC): 2026-04-03
- Project: PadelBuddy Web
- Scope: Item 1 — Architecture Review
- Source plan: `docs/plans/PBW-68-code-review-and-improvements.md`

## Purpose

- Record the approved cleanup scope for PBW-68 before any production refactors begin.
- Confirm which architecture strengths must be preserved and which hotspots are in scope for cleanup.

## Confirmed strengths to preserve

- **Pure domain core**: `src/core/match/engine.ts`, `src/core/match/derived-state.ts`, `src/core/match/replay.ts`, and `src/core/match/validation.ts` keep scoring logic isolated from UI and route concerns.
- **Route orchestration**: route flow and current-match coordination are already centered in `src/routes/*`, `src/lib/router/current-match-route-flow.ts`, and `src/lib/current-match/*`.
- **CSS Modules + design tokens**: component styling is predominantly local to CSS Modules, and global token variables are already available through `src/styles.css` importing `../design-tokens/dist/variables.css`.
- **Existing test coverage**: the refactor surface is already protected by component, route, domain, persistence, and i18n tests.

## Architecture risks and cleanup hotspots

- **Barrel sprawl**: 31 `index.ts` re-export files in `src/` broaden dependency surfaces and hide true module ownership.
- **Large orchestration files**: UI and coordination responsibilities are concentrated in a few oversized files, increasing change risk and review cost.
- **Cross-cutting duplication**: repeated Toast rendering, route error rendering, overlay/modal CSS, screen-reader helpers, and notice-card styling create inconsistent maintenance points.
- **i18n gaps at the edges**: most translation coverage exists, but accessibility labels, debug UI, fallback copy, and route metadata still rely on literals or `defaultValue` fallbacks.
- **Token gaps**: most CSS is token-aligned, but a limited set of colors, dimensions, letter-spacing values, and SVG/runtime values still bypass the token system.

## Large files identified

- `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx` — 647 lines
- `src/components/SetupScreen/SetupScreen.tsx` — 580 lines
- `src/components/MatchEndScreen/MatchEndScreen.tsx` — 428 lines
- `src/lib/speech/speech-service.ts` — 617 lines
- `src/lib/setup/setup-storage.ts` — 492 lines

## Exact cleanup targets by item

### Item 2 — Remove barrel files

- Delete the 31 confirmed barrel files after imports are rewritten.
- Highest-impact import surfaces called out by the plan:
  - `src/components/ui/index.ts`
  - `src/core/match/index.ts`
  - `src/lib/current-match/index.ts`
  - `src/lib/i18n/index.ts`
  - `src/lib/input/index.ts`
  - `src/lib/orientation/index.ts`
  - `src/lib/pwa/index.ts`
  - `src/lib/speech/index.ts`
- Heavy import consumers to update first:
  - `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`
  - `src/components/SetupScreen/SetupScreen.tsx`
  - `src/components/MatchEndScreen/MatchEndScreen.tsx`
  - `src/routes/__root.tsx`
  - `src/routes/index.tsx`
  - `src/routes/match.$id.tsx`
  - `src/routes/match.finish.$id.tsx`

### Item 3 — Extract hardcoded strings to i18n

- Replace remaining UI-facing literals in:
  - `src/components/ui/Spinner/Spinner.tsx`
  - `src/components/ui/Toast/ToastViewport.tsx`
  - `src/components/ui/Toast/useToast.tsx`
  - `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`
  - `src/components/CurrentMatchStartupGate/CurrentMatchStartupGate.tsx`
  - `src/components/DebugPwa/DebugPwa.tsx`
  - `src/components/MatchEndScreen/MatchEndScreen.tsx`
  - `src/components/PadelCourtSpinner/PadelCourtSpinner.tsx`
  - `src/components/SetupScreen/VoiceSelectionModal.tsx`
  - `src/routes/__root.tsx`
- Add supporting keys in:
  - `src/lib/i18n/locales/en.ts`
  - `src/lib/i18n/locales/es.ts`
  - `src/lib/i18n/locales/pt.ts`

### Item 4 — Remove duplicated styles

- Consolidate the exact duplicated CSS blocks called out in:
  - `src/components/ActiveMatchScreen/SideSwitchPrompt/SideSwitchPrompt.module.css`
  - `src/components/CurrentMatchStartupGate/CurrentMatchStartupGate.module.css`
  - `src/components/PadelCourtSpinner/PadelCourtSpinner.module.css`
  - `src/components/SetupScreen/RemoteConfigurationModal.module.css`
  - `src/components/SetupScreen/VoiceSelectionModal.module.css`
  - `src/components/ui/RotateDeviceBlocker/RotateDeviceBlocker.module.css`
  - `src/components/MatchEndScreen/MatchSummaryCard.module.css`
  - `src/components/ui/Spinner/Spinner.module.css`
  - `src/components/ui/Toast/Toast.module.css`
  - `src/components/ui/Toast/ToastViewport.module.css`
  - `src/components/NotFoundPage/NotFoundPage.module.css`
  - `src/routes/index.module.css`
  - `src/components/ShareScreen/ShareScreen.module.css`

### Item 5 — Remove/extract duplicated code

- Consolidate exact logic duplication in:
  - `src/components/ui/Toast/ToastViewport.tsx`
  - `src/components/ui/Toast/useToast.tsx`
  - `src/routes/__root.tsx`
  - `src/routes/-route-utils.tsx`
  - `src/routes/match.$id.tsx`
  - `src/routes/match.finish.$id.tsx`
- Optional only if simpler after extraction:
  - `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`
  - `src/components/SetupScreen/RemoteConfigurationModal.tsx`

### Item 6 — Replace inline styles with CSS Modules

- Move the hidden share-capture style out of:
  - `src/components/MatchEndScreen/MatchEndScreen.tsx`
- Into:
  - `src/components/MatchEndScreen/MatchEndScreen.module.css`

### Item 7 — Replace hardcoded values with design tokens

- Token migration targets highlighted by the plan:
  - `src/routes/__root.tsx`
  - `src/components/PadelCourtSpinner/PadelCourtSpinner.module.css`
  - `src/components/PadelCourtSpinner/PadelCourtSpinner.tsx`
  - `src/components/ui/RotateDeviceBlocker/RotateDeviceBlocker.module.css`
  - `src/components/ActiveMatchScreen/SideSwitchPrompt/SideSwitchPrompt.module.css`
  - `src/components/ActiveMatchScreen/TeamPanel/TeamPanel.module.css`
  - `src/components/ShareScreen/ShareScreen.module.css`
  - `src/components/ActiveMatchScreen/SetsCard/SetsCard.module.css`
  - `src/components/MatchEndScreen/MatchEndScreen.tsx`

### Item 8 — Replace template literal `className` with `cn()`

- Single confirmed cleanup target:
  - `src/components/DebugPwa/DebugPwa.tsx`
- Shared helper already available:
  - `src/lib/utils/cn.ts`

## Risk notes

- **Barrel removal**: high churn with low logic risk; the main failure mode is broken import graphs across `src/` and `test/`.
- **Token migration**: highest visual-regression risk because several values live in layout-critical or SVG-heavy surfaces and not every literal has an exact semantic token match.
- **CSS consolidation**: visually sensitive around overlays, modal shells, notice cards, and z-index/centering behavior; extract only exact duplicates.

## Explicit non-goals for PBW-68

- No scoring-engine rewrite.
- No new global state.
- No token-system redesign.

## Test coverage baseline

Key test directories and suites that protect the planned cleanup:

- `test/core/match/*`
- `test/components/SetupScreen/*`
- `test/components/ActiveMatchScreen/*`
- `test/components/MatchEndScreen/*`
- `test/components/ui/*`
- `test/components/ShareScreen/*`
- `test/components/DebugPwa/*`
- `test/routes/*`
- `test/current-match/*`
- `test/lib/i18n/*`
- `test/lib/router/current-match-route-flow.test.ts`
- `test/lib/setup/setup-storage.test.ts`
- `test/lib/speech/*`

## Approval gate summary

PBW-68 should preserve the existing pure-domain + route-orchestration architecture and limit its scope to dependency cleanup, duplication removal, i18n completion, and token alignment. Any follow-up work that rewrites the scoring model, introduces new shared state, or redesigns the token system is outside the approved scope for this issue.
