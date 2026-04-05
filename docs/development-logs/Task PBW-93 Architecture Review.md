---
title: Task PBW-93 Architecture Review
type: note
permalink: development-logs/task-pbw-93-architecture-review
---

# Development Log: PBW-93

## Metadata

- Task ID: PBW-93
- Date (UTC): 2026-04-05T00:00:00Z
- Project: padelbuddy-web
- Branch: n/a
- Commit: n/a

## Objective

- Perform a comprehensive architecture review and implement cross-cutting improvements across the Padel Buddy Web application.

## Implementation Summary

- Re-baselined findings against the current codebase and added missing regression tests (orientation detection). Marked findings as confirmed vs already-resolved.
- Extracted shared type guards into src/core/match/guards.ts and a team-name resolution helper into src/core/match/team-name.ts.
- Decomposed ActiveMatchScreen by extracting speech event creation and pressure detection logic into src/lib/speech/match-announcer.ts and introduced useMatchAnnouncements hook; ActiveMatchScreen reduced from ~643 to ~372 lines.
- Collapsed speech service by removing an unused createSpeechService() factory and associated dead utilities; net -1957 lines removed from the codebase.
- Added an AppErrorBoundary and shared AppStatusPage; moved root initialization concerns to src/routes/-root-effects.ts and simplified \_\_root.tsx.
- Replaced module-level mutable state with explicit, testable stores/managers (ResetNoticeStore and WakeLockManager).
- Consistency cleanups: TrophyIcon, standardized .srOnly a11y CSS, unified component prop typing to ComponentPropsWithoutRef, and added a minimal logRuntimeError helper.

## Files Changed

- src/core/match/guards.ts (new)
- src/core/match/team-name.ts (new)
- src/lib/speech/match-announcer.ts (new)
- src/components/ActiveMatchScreen/useMatchAnnouncements.ts (new)
- src/components/AppStatus/AppStatusPage.tsx (new)
- src/components/ErrorBoundary/AppErrorBoundary.tsx (new)
- src/routes/-root-effects.ts (new)
- src/lib/current-match/reset-notice-store.ts (new)
- src/lib/input/wake-lock-manager.ts (new)
- src/components/ui/Icon/TrophyIcon.tsx (new)
- src/lib/utils/error.ts (new)
- src/components/ActiveMatchScreen/ActiveMatchScreen.tsx (reduced 643→372 lines)
- src/lib/speech/speech-service.ts (removed dead factory)
- src/routes/\_\_root.tsx (simplified, error boundary added)
- Various CSS modules, tests, and supporting components updated

## Key Decisions

- Consolidate duplicated guards and helpers into core/match to avoid drift and improve reuse.
- Remove the unused speech service factory and debounce utility after confirming tests and code usage — reduces maintenance surface and test noise.
- Replace module-level mutable refs with explicit stores/managers to make state deterministic and testable.
- Introduce an AppErrorBoundary and central status page to contain runtime crashes and provide a consistent UX for app-level errors.

## Validation Performed

- Re-baselined findings: manual code review and targeted regression test additions (orientation detection) — verification recorded in change plan.
- Test suites: relevant unit/integration tests updated; regression coverage extended. (Command run: pnpm test — suites related to match/speech/views) — result: verification performed (per session summary).
- Line-count and dead-code verification: codebase reductions confirmed by diff (net -1957 lines removed) and removal of dead test coverage surrounding removed factory.

## Risks and Follow-ups

- Risk: Removing module-level mutable state and the speech factory may surface edge cases in long-running sessions; monitor crash/error telemetry and add focused E2E scenarios if flakiness appears.
- Follow-up: Add more granular tests for pressure detection performance to ensure the new match-announcer projections are not regressing on performance.
- Follow-up: Sweep for any remaining module-level singletons and standardize prop typing across the codebase.
