---
title: Task PBW-61 Review Active Game Screen layout
type: note
permalink: development-logs/task-pbw-61-review-active-game-screen-layout
---

# Development Log: PBW-61 Review Active Game Screen layout

## Metadata

- Task ID: PBW-61
- Date (UTC): 2026-03-22T00:00:00Z
- Project: padelbuddy-web
- Branch: feature/PBW-61-review-active-game-screen-layout
- Commit: n/a

## Objective

- Review Active Game Screen against Pencil design and implement layout/visual fixes to match design.

## Implementation Summary

- Reviewed Pencil design node VSRKf and current implementation; identified 12 discrepancies and implemented fixes across design tokens, CSS, components, and tests. Changes include token updates, background gradient via CSS variables on Layout, simplification of TeamPanel, removal of InfoCard from composition, button restyling, typography adjustments, layout refactor to use CSS custom properties, stale token cleanup, bugfix for dead CSS var, and addition of new tokens.

## Files Changed

- design-tokens/base/dimension.tokens.json
- design-tokens/base/font.tokens.json
- design-tokens/base/color.tokens.json
- design-tokens/semantic/typography.tokens.json
- design-tokens/semantic/color.tokens.json
- design-tokens/component/button.tokens.json
- design-tokens/app/scoreboard.tokens.json
- design-tokens/dist/variables.css
- src/components/Layout/Layout.module.css
- src/components/ActiveMatchScreen/ActiveMatchScreen.tsx
- src/components/ActiveMatchScreen/ActiveMatchScreen.module.css
- src/components/ActiveMatchScreen/TeamPanel/TeamPanel.tsx
- src/components/ActiveMatchScreen/TeamPanel/TeamPanel.module.css
- src/components/ActiveMatchScreen/SetsCard/SetsCard.module.css
- src/components/MatchEndScreen/MatchEndScreen.module.css
- test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx
- test/components/ActiveMatchScreen/TeamPanel.browser.test.tsx

## Key Decisions

- Use CSS custom properties on Layout for screen-specific backgrounds to allow safe overrides without API changes.
- Use native <button> elements for revert/finish actions rather than shared Button component for simpler semantics and better control.
- Use color-mix() for opacity variants on revert button text colors.
- Use min(352px, 48vw) responsive sizing for display score to scale on mobile.
- Preserve InfoCard component in the repo but remove it from ActiveMatchScreen render; component files not deleted.

## Validation Performed

- pnpm complete-check: pass - All 6 gates passed (typecheck, lint, format, tests 663/663, e2e 24/24, build)
- Basic Memory: note created and verified

## Risks and Follow-ups

- Need to monitor other screens for reliance on removed serve-indicator tokens; ensure no runtime styles break.
- Consider bringing InfoCard back behind a feature flag if needed in future compositions.
