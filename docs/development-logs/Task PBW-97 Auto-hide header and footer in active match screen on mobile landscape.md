---
title: Task PBW-97 Auto-hide header and footer in active match screen on mobile landscape
type: note
permalink: padelbuddy-web/development-logs/task-pbw-97-auto-hide-header-and-footer-in-active-match-screen-on-mobile-landscape
---

# Development Log: PBW-97

## Metadata

- Task ID: PBW-97
- Date (UTC): 2026-04-12
- Project: padelbuddy-web
- Branch: feature/PBW-97-auto-hide-header-and-footer-in-active-match-screen-on-mobile-landscape

## Objective

Add compact-height inactivity auto-hide behavior to ActiveMatchScreen: only the footer hides after 5 seconds of inactivity in mobile landscape (viewport height <= 480px), header stays visible, and an "Exit fullscreen" button appears in the header to reveal the footer again.

## Implementation Summary

- Created `useInactivityTimer` hook (src/hooks/useInactivityTimer.ts) — stable across re-renders, exposes isActive and reset()
- Integrated into ActiveMatchScreen with compact-height detection via matchMedia('(max-height: 480px)')
- Only footer hides after inactivity; header stays visible
- "Exit fullscreen" placeholder button appears in header when footer is hidden; clicking it reveals footer
- Footer hide CSS lives in Layout.module.css targeting .layout[data-controls-hidden='true'] .footer
- Score controls and remote scoring keys do NOT reset timer; non-scoring interactions DO

## Files Changed

- src/hooks/useInactivityTimer.ts (new)
- test/hooks/useInactivityTimer.browser.test.tsx (new)
- src/components/ActiveMatchScreen/ActiveMatchScreen.tsx (modified)
- src/components/ActiveMatchScreen/ActiveMatchScreen.module.css (modified)
- src/components/Layout/Layout.module.css (modified)
- src/lib/i18n/locales/en.ts (modified)
- src/lib/i18n/locales/es.ts (modified)
- src/lib/i18n/locales/pt.ts (modified)
- test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx (modified)

## Key Decisions

- Header always visible — only footer hides after inactivity
- useInactivityTimer stores config in refs to avoid effect restarts when formattedTime updates every second
- data-controls-hidden placed on Layout root <main> element; CSS descendant selector in Layout.module.css
- "Exit fullscreen" is a placeholder with no real fullscreen API behavior
- Hook exposes reset() for programmatic reveal from the header button

## Validation Performed

- pnpm complete-check: pass — 80 test files, 903 tests
- Live browser verification on Pixel 7 landscape (915x412): footer hides after 5s, Exit fullscreen button appears, clicking reveals footer
- TypeScript, lint, format: all pass

## Risks and Follow-ups

- None at this time — feature complete and verified
