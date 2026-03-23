---
title: Task PBW-65 Add Share functionality on Match End Screen
type: note
permalink: development-logs/task-pbw-65-add-share-functionality-on-match-end-screen
---

# Development Log: PBW-65

## Metadata

- Task ID: PBW-65
- Date (UTC): 2026-03-22
- Project: padelbuddy-web
- Branch: feature/pbw-65-add-share-functionality-on-match-end-screen
- Commit: (leave blank, not yet committed)

## Objective

Implement share functionality on Match End Screen — capture a branded ShareScreen card and share via Web Share API with PNG fallback.

## Implementation Summary

- Created new ShareScreen component (src/components/ShareScreen/) — a dedicated 414x768 branded card design for social sharing, distinct from the Match End screen UI
- ShareScreen conditionally mounted ONLY when share button is clicked (not always rendered)
- Uses modern-screenshot to capture the ShareScreen card
- Web Share API with text + PNG file sharing when navigator.canShare supports files
- PNG download fallback for unsupported browsers
- PBW-58 (TopBar refactor) was already done — verified before starting
- User changed scope mid-implementation: instead of capturing Match End screen, capture a new dedicated ShareScreen design from Pencil

## Files Changed

- src/components/ShareScreen/ShareScreen.tsx (NEW)
- src/components/ShareScreen/ShareScreen.module.css (NEW)
- src/components/ShareScreen/index.ts (NEW)
- src/components/MatchEndScreen/MatchEndScreen.tsx (MODIFIED)
- src/components/MatchEndScreen/MatchEndScreen.module.css (MODIFIED)
- src/components/MatchEndScreen/useMatchEndShare.ts (MODIFIED)
- src/components/Layout/Layout.tsx (MODIFIED)
- public/locales/en.json (MODIFIED)
- public/locales/es.json (MODIFIED)
- public/locales/pt.json (MODIFIED)
- package.json (MODIFIED)
- test/components/MatchEndScreen/MatchEndScreen.browser.test.tsx (MODIFIED)

## Key Decisions

- Chose modern-screenshot over html2canvas (abandoned), html-to-image, dom-to-image-more — best bundle size (185KB), zero deps, worker mode, active maintenance
- ShareScreen is a hidden component, only mounted on share click, then immediately unmounted after capture
- ShareScreen uses same TopBar component as Match End (PBW-58 pattern)
- Score columns follow MATCH winner order (left = winner, right = loser), not per-set winner order
- Date formatting uses Intl.DateTimeFormat with i18n.language for locale awareness
- ShareScreen rendered off-screen (position: fixed; left: -9999px) to prevent visible flash before capture

## Validation Performed

- pnpm complete-check: pass (672 tests, 24 e2e, typecheck, lint, format, build all pass)

## Risks and Follow-ups

- ShareScreen now has an initial dedicated browser test (`test/components/ShareScreen/ShareScreen.browser.test.tsx`), but coverage for the new component may still be incomplete
- modern-screenshot worker mode not implemented yet (using domToBlob direct path)
- react-i18next NO_I18NEXT_INSTANCE warnings in tests — pre-existing, not introduced by this PR
