---
title: Task PBW-87 Responsive Overhaul Active Match Landscape Only App Wide Mobile
  Support
type: note
permalink: development-logs/task-pbw-87-responsive-overhaul-active-match-landscape-only-app-wide-mobile-support
---

# Development Log: PBW-87

## Metadata

- Task ID: PBW-87
- Date (UTC): 2026-04-02T00:00:00Z
- Project: padelbuddyweb
- Branch: feature/PBW-87-responsive-overhaul-active-match-landscape-only-app-wide-mobile
- Commit: n/a

## Objective

- Implement responsive design overhaul for the Padel Buddy web app: Active Match screen landscape-only with rotate device blocker, app-wide mobile support and standardized breakpoints.

## Implementation Summary

- Implemented 5 subtasks as part of PBW-87: PBW-88 (rotate device blocker + hook), PBW-89 (app shell responsiveness), PBW-90 (Active Match layout updates), PBW-91 (E2E tests for orientation), PBW-92 (accessibility polish for rotate blocker).
- Review-driven fixes included: lazy useState init to prevent orientation flash, accessibility improvements (role="alertdialog", removed aria-live, focus restoration, inert attribute), simplified orientation hook, replaced device-height with height, standardized boundary operators, restored flex layout correctness, added portrait orientation browser test.

## Files Changed

- src/lib/orientation/useOrientationDetection.ts (new)
- src/lib/orientation/index.ts (new)
- src/components/ui/RotateDeviceBlocker/RotateDeviceBlocker.tsx (new)
- src/components/ui/RotateDeviceBlocker/RotateDeviceBlocker.module.css (new)
- src/components/ui/RotateDeviceBlocker/index.ts (new)
- src/components/ActiveMatchScreen/ActiveMatchScreen.tsx
- src/components/ActiveMatchScreen/ActiveMatchScreen.module.css
- src/components/ActiveMatchScreen/SetsCard/SetsCard.module.css
- src/components/ActiveMatchScreen/TeamPanel/TeamPanel.module.css
- src/components/ActiveMatchScreen/SideSwitchPrompt/SideSwitchPrompt.module.css
- src/components/Layout/Layout.module.css
- src/components/Layout/Layout.tsx
- src/components/MatchEndScreen/MatchEndScreen.module.css
- src/components/MatchEndScreen/MatchStatsCard.module.css
- src/components/MatchEndScreen/MatchSummaryCard.module.css
- src/components/MatchEndScreen/WinnerCard.module.css
- src/components/SetupScreen/SetupScreen.module.css
- src/components/ui/TopBar/TopBar.module.css
- src/components/ui/Toast/ToastViewport.module.css
- src/components/ui/index.ts
- src/lib/i18n/locales/en.ts
- src/lib/i18n/locales/es.ts
- src/lib/i18n/locales/pt.ts
- src/styles.css
- src/routes/index.module.css
- design-tokens/base/dimension.tokens.json
- design-tokens/semantic/typography.tokens.json
- e2e/responsive-orientation.spec.ts (new)
- test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx

## Key Decisions

- CSS var() cannot be used inside @media queries, so breakpoints were hardcoded to 480px (phone) and 768px (tablet/desktop).
- Deleted breakpoint.tokens.json as it served no purpose.
- Used inert HTML attribute for focus trapping instead of a JS focus-trap library to keep the blocker lightweight and declarative.
- Used role="alertdialog" instead of role="dialog" + aria-live for the rotate blocker to ensure proper AT announcement semantics.
- Simplified orientation hook to a single matchMedia listener; removed screen.orientation and deprecated orientationchange handling.
- Replaced deprecated device-height with height in media queries for broader browser compatibility.

## Validation Performed

- pnpm complete-check: pass (typecheck, lint, format, vitest, playwright E2E, build)
- Code review: pass (after fixes)
- Architecture review: pass (after fixes)

## Risks and Follow-ups

- Focus restoration currently captures document.body instead of the exact prior-focused element due to synchronous inert application; documented as a known limitation.
- Vite build produces chunk-size warning (>500KB main chunk) — deferred to future optimization task.
