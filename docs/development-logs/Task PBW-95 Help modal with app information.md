---
title: Task PBW-95 Help modal with app information
type: note
permalink: development-logs/task-pbw-95-help-modal-with-app-information
---

# Development Log: PBW-95

## Metadata

- Task ID: PBW-95
- Date (UTC): 2026-04-08T00:00:00Z
- Project: padelbuddy-web
- Branch: feature/PBW-95-help-modal-with-app-information
- Commit: n/a

## Objective

- Replace TopBar inline APP_VERSION text with an accessible help trigger and document iterative improvements including a Popover refactor for first-visit spotlight, accessibility fixes, test fixture updates, and final verification.

## Implementation Summary

- Refactored the first-visit spotlight bubble to use Base UI Popover anchored to the existing TopBar help trigger while retaining the custom spotlight overlay/cutout that visually highlights the trigger.
- Kept the custom overlay/cutout implementation for the visual cutout effect; Popover handles anchoring, positioning, and accessibility semantics.
- Added locale title keys for the spotlight popover in en/es/pt so the spotlight heading is localized per language.
- Fixed portal stacking by moving the positioner z-index to the correct layer so the Popover and help dialog stack reliably above other portals/overlays.
- Implemented live-region announcement via a ref-based population strategy to ensure screen readers receive the spotlight text when the Popover opens.
- Updated E2E and general test fixtures to mark the spotlight as pre-seen where appropriate to avoid interfering with unrelated flows during tests.
- Preserved prior deliverables: TopBar help trigger, AppHelpDialog, wider modal and locale-specific store badges, and previous accessibility and review fixes.

## Files Changed

- src/components/ui/TopBar/TopBar.tsx
- src/components/ui/TopBar/AppHelpDialog.tsx
- src/components/ui/TopBar/AppHelpDialog.module.css
- src/components/ui/TopBar/AppHelpSpotlight.tsx
- src/lib/i18n/locales/en.ts
- src/lib/i18n/locales/es.ts
- src/lib/i18n/locales/pt.ts
- src/styles/positioner.module.css
- test/components/ui/TopBar/TopBar.browser.test.tsx
- test/components/ui/TopBar/AppHelpDialog.browser.test.tsx
- test/e2e/fixtures/spotlight_preseen.ts

## Key Decisions

- Use Base UI Popover for anchoring and positioning to leverage existing positioning behavior while keeping the visual cutout overlay custom for design fidelity.
- Use ref-based live-region updates rather than dynamic DOM insertion to provide predictable announcements for assistive tech.
- Keep test fixtures marking the spotlight as pre-seen by default in specific flows to prevent flaky tests caused by unexpected first-visit UI.

## Validation Performed

- pnpm complete-check: pass - 836 unit tests, 84 Playwright tests
- Browser and E2E tests: pass - Popover anchor/positioning, live-region announcements, focus return, and fixture isolation verified.

## Risks and Follow-ups

- Monitor portal stacking and z-index interactions when adding other global portals; consider a centralized layering utility for future overlays.
- Confirm live-region behavior across a broader set of screen readers and OS combinations; consider adding a small matrix to CI smoke tests.
