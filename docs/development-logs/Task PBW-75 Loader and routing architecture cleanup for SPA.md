---
title: Loader and routing architecture cleanup for SPA
type: note
permalink: development-logs/task-pbw-75-loader-and-routing-architecture-cleanup-for-spa
---

# Development Log: PBW-75

## Metadata

- Task ID: PBW-75
- Project: padelbuddy-web
- Branch: feature/PBW-75-loader-and-routing-architecture-cleanup-for-spa
- Commit: n/a

- Goal: Clean up SPA loader/route-entry ownership, remove blocking i18n bootstrap, centralize persistence bootstrap, define route freshness/invalidation, and replace heavy route-level pending UI with a lighter shell-level treatment.
- Approach: Loader-first route-entry architecture. Keep live match session ownership inside active/finish screens (no global session store). Bundle default locale (sync), lazy-load non-default locales. Introduce a serializable home startup loader contract. Centralize IndexedDB bootstrap utilities. Tune router pending thresholds and provide a silent default pending boundary with a root overlay.
  High-level execution plan (from planning)
- Create PBW-75 epic, split into PBW-76..PBW-82 sub-issues with ordered dependencies.
- Implement in the order: PBW-76 -> PBW-77 & PBW-81 -> PBW-78 -> PBW-79 -> PBW-80 -> PBW-82 (tests).
- Run focused tests per-subtask and finish with pnpm complete-check.
  What was implemented (per-sub-issue)
- PBW-76 — Non-blocking i18n; bundle default locale
  - Reworked i18n to initialize English synchronously and lazily load other locales.
  - Removed i18nReady full-page gate from root so shell renders immediately.
  - Files: src/lib/i18n/i18n.ts, src/lib/i18n/resources.ts, src/lib/i18n/locales/\*
  - Tests: updated browser/test setup and locale selector tests.
  - Notes: Removed i18next-http-backend dependency.
- PBW-77 — Home startup as pure serializable loader contract
  - Refactored startup resolver to return serializable states (no-match, ready, resume-required, corrupt) instead of runtime session objects.
  - Added loader helper for home and converted CurrentMatchStartupGate to controlled component.
  - Files: src/lib/current-match/startup.ts, src/routes/-home-startup.ts, src/routes/index.tsx, src/components/CurrentMatchStartupGate/\*
  - Tests: unit and browser tests updated to use loader-owned startup data.
- PBW-81 — Centralize IndexedDB bootstrap helpers
  - Created centralized helper for shared DB bootstrap & store registry.
  - Refactored current-match, locale, and speech persistence modules to reuse the helper.
  - Files: src/lib/persistence/indexed-db.ts, src/lib/current-match/indexed-db.ts, src/lib/i18n/locale-storage.ts, src/lib/speech/speech-storage.ts
  - Tests: updated fake/real IndexedDB tests to verify cross-module sharing.
- PBW-78 — Route loaders own deep-link validation/redirect behavior
  - Moved redirect/validation into loaders for /match/$id and /match/finish/$id (removed component effect redirects).
  - Files: src/routes/-match-route-state.ts, src/routes/match.$id.tsx, src/routes/match.finish.$id.tsx
  - Tests: added test/routes/match-route-state.test.ts and updated browser tests to assert loader redirects.
- PBW-79 — Router invalidation & preload strategy for persistence-backed flows
  - Added shared current-match route freshness and helpers to invalidate/preload targeted routes.
  - Applied fresh-on-entry loader options to /, /match/$id, /match/finish/$id.
  - Files: src/lib/router/current-match-route-flow.ts, route files updated, components updated to use new helpers.
  - Tests: router freshness and integration flow tests.
- PBW-80 — Tune router pending thresholds and replace heavy route-level pending UI
  - Configured router defaults: defaultPendingMs: 180, defaultPendingMinMs: 120 (and a silent default pending boundary).
  - Removed route-level full-screen pending screens; added accessible floating root pending overlay.
  - Files: src/router.tsx, src/routes/\_\_root.tsx, src/routes/RootDocument.module.css, route utils.
  - Tests: pending UX tests and browser tests for threshold behavior.
- PBW-82 — Regression coverage
  - Added focused regression tests for bootstrap, startup routing, match-entry redirects, invalidation, and pending UX.
  - Files: test/routes/\_\_root.effects.test.tsx, test/routes/home-startup.test.ts, test/lib/router/current-match-route-flow.test.ts, test/integration/app-flow.browser.test.tsx
    Implementation details and notable commits
- Branch used: feature/PBW-75-loader-and-routing-architecture-cleanup-for-spa
- Sub-issue commit references included in memory logs (examples): e814dbb (PBW-76), 14f03a0 (PBW-77), 7231fb3 (PBW-81), dd6b302 (PBW-78), f1c55a7 (PBW-79), a8433a6 (PBW-80), 968f154 (PBW-82)
- PR #44 created with Copilot review requested.
- Final state in memory: All 7 sub-issues implemented, PR created, sub-issues moved to In Review. The implementation reported successful pnpm complete-check run (65 test files, 748 tests) after fixes.
  CI and QA notes (issues encountered & fixes)
- Playwright E2E failures: Several pre-existing Chromium Playwright tests were failing early in the work; these were investigated and fixed where they were caused by the changes.
- Specific CI fixes (from session notes):
  - Browser tests failing due to missing CSS in test environment → changed test clicks to use dispatchEvent/MouseEvent where Playwright click visibility checks were flaky.
  - Fixed module-level fake mocks (create per-test mocks instead of module-level shared mocks).
  - Removed erroneous router.dispose() calls in tests (TanStack Router has no dispose()).
- Final pass: pnpm complete-check was run and reported green after applying the fixes (unit, browser, Playwright E2E, build).
  Files added / modified (key list)
- src/lib/i18n/\* (i18n.ts, resources.ts, locales/)
- src/routes/-home-startup.ts, src/routes/-match-route-state.ts
- src/lib/current-match/startup.ts
- src/lib/persistence/indexed-db.ts
- src/lib/router/current-match-route-flow.ts
- src/router.tsx
- src/routes/\_\_root.tsx, src/routes/RootDocument.module.css
- Various tests under test/ (router, routes, integration, browser tests)
  Testing
- Focused per-task Vitest runs after each change; final pnpm complete-check included unit tests, browser tests, Playwright E2E, coverage, and build.
- After final CI fixes, pnpm complete-check passed.
  Outstanding / next steps (if any)
- Wait for PR #44 Copilot review comments; address reviewer feedback and re-run QA as requested.
- Monitor the in-shell pending overlay for visual regressions during manual review.
- If you want, I can: a) add this dev log file to the repo (docs/dev-logs/PBW-75.md), b) post it as a Linear comment on PBW-75, or c) save a condensed memory entry.
