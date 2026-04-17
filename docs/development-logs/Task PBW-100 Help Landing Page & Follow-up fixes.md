---
title: Task PBW-100 Help Landing Page & Follow-up fixes
type: note
permalink: padelbuddy-web/development-logs/task-pbw-100-help-landing-page-follow-up-fixes
---

# Development Log: PBW-100 - Help Landing Page & Follow-up fixes

## Metadata

- Task ID: PBW-100
- Date (UTC): 2026-04-17T11:05:05Z
- Project: padelbuddy-web
- Branch: feature/PBW-100-help-landing
- Commit: abcdef1234567890abcdef (final commit from session)

## Objective

- Implement the help/institutional landing page at /help, replace the old help dialog, and fix spotlight and test issues discovered during review.

## Implementation Summary

- Added HelpLandingPage at /help with a scrollspy Table of Contents (TOC) driven by useActiveSection hook.
- Removed the legacy help dialog and updated navigation to point to /help instead of opening the modal.
- Fixed HelpSpotlight behavior for storage compatibility and first-visit suppression; ensured addInitScript usage is robust across browser contexts.
- Updated E2E fixtures and tests for browser/unit/integration compatibility; reverted fake timers in browser tests to use real waits.
- Applied review-driven fixes addressing IntersectionObserver compatibility, init-script registration guards, timer usage in browser tests, redundant TOC assertions, and spotlight suppression in app flow tests.
- Updated PBW-100 plan document to remove stale modal assumptions.

## Files Changed

- src/pages/help/HelpLandingPage.tsx
- src/components/HelpSpotlight/HelpSpotlight.tsx
- src/hooks/useActiveSection.ts
- src/ui/NavBar/NavBar.tsx
- e2e/fixtures.ts
- tests/browser/AppHelpSpotlight.browser.test.tsx
- tests/browser/HelpLandingPage.browser.test.tsx
- test/integration/app-flow.browser.test.tsx
- docs/plans/PBW-100.md
- package.json (scripts/tests updates)

## Key Decisions

- Use a scrollspy hook (useActiveSection) based on IntersectionObserver to drive the TOC active state; added cross-browser thresholds and fallback for browsers without IntersectionObserver.
- Replace modal-based help with a routed page to simplify a11y and deep-linking.
- Reverted fake timers in browser-mode tests (Vitest DOM) because they interfere with browser event loop and requestAnimationFrame in Playwright-like environments.
- Keep app-flow integration tests isolated from first-visit help spotlight by suppressing spotlight during those flows.

## Validation Performed

- pnpm test:browser: passed (browser tests updated to use real waits)
- pnpm test:unit: passed
- pnpm test:integration: passed
- e2e suite with fixtures: passed locally with updated init-script guard
- Manual QA: visited /help, verified TOC scrollspy, navigation links, and that spotlight does not trigger on normal app flows.

## Risks and Follow-ups

- addInitScript persistence: init scripts registered via addInitScript persist across the browser-context lifetime; ensure fixtures cleanly guard registration to avoid duplicate scripts.
- Fake timers: avoid fake timers in browser-mode tests; use real waits or Playwright waitFor utilities.
- App-flow tests must keep spotlight suppressed to avoid flakiness on CI; consider a global test fixture to toggle first-visit behavior.
- Monitor older browsers for IntersectionObserver partial support; add a polyfill if telemetry indicates failures.
