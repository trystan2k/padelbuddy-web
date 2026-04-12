# Plan PBW-97 — Auto-hide footer in active match screen on mobile landscape

## Task Analysis

- Main objective: Add compact-height inactivity behavior to `ActiveMatchScreen` so the **footer** auto-hides after 5 seconds of non-scoring inactivity on mobile-height landscape screens, while score interactions and remote-control input never reveal the footer or extend the timer. The **header stays visible at all times** and shows an "Exit fullscreen" button while the footer is hidden; clicking it reveals the footer again.
- Key design decisions:
  - Header always visible — no hiding behavior for header
  - Only footer hides after 5-second inactivity timeout in compact landscape
  - "Exit fullscreen" placeholder button appears in header when footer is hidden
  - Clicking "Exit fullscreen" resets inactivity state, reveals footer, hides button
  - Score controls (team panels, revert buttons) and remote scoring keys do NOT reset the timer or reveal the footer
  - Non-scoring interactions (tapping empty space, scrolling) DO reveal the footer and reset the timer
- Dependencies:
  - `src/components/Layout/Layout.tsx` renders semantic `<header>` / `<footer>` slots and accepts `...props` on `<main>`, so `data-controls-hidden` can be passed through directly
  - `src/components/Layout/Layout.module.css` owns the `.header` and `.footer` classes, so footer hide CSS lives there
  - `src/lib/orientation/useOrientationDetection.ts` provides portrait/landscape gate; compact-height uses the same `matchMedia` pattern
  - `src/lib/input/keyboard-aliases.ts` provides `getActionFromKey` to identify score/undo remote keys
  - `useInactivityTimer` hook is designed to be stable across re-renders (stores unstable config in refs) so timer is not restarted when `formattedTime` updates every second

## Chosen Approach

- Implement a generic `useInactivityTimer` hook that starts in the active state, listens for global `pointerdown`, `keydown`, and captured `scroll` events, and resets only on non-ignored interactions. Exposes `{ isActive, reset }` — the reset function lets callers (e.g. the Exit fullscreen button) programmatically reveal controls.
- In `ActiveMatchScreen`: detect compact height via `matchMedia('(max-height: 480px)')`, enable the timer only when `isCompactHeight && !isPortrait`. Define ignored selectors for team panels and revert buttons, plus a keyboard predicate via `getActionFromKey`. Compute `shouldHideControls = isCompactHeight && !isPortrait && !isActive` and pass `data-controls-hidden` to `Layout` root `<main>`.
- In `Layout.module.css`: target `.layout[data-controls-hidden='true'] .footer` with opacity/transform/max-height transitions for smooth hiding. Header stays unstyled for hiding.
- In `ActiveMatchScreen.tsx`: add an "Exit fullscreen" button (translated) to `headerContent` that calls `reset()` on click. The button is only rendered when `shouldHideControls` is true.
- Localization: add `match.actions.exitFullscreen` key to en/es/pt locale files.

## Components to be Modified/Created

- Create `src/hooks/useInactivityTimer.ts` — generic browser-only hook
- Create `test/hooks/useInactivityTimer.browser.test.tsx` — browser tests for the hook
- Modify `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx` — integrate timer, Exit fullscreen button
- Modify `src/components/ActiveMatchScreen/ActiveMatchScreen.module.css` — style Exit fullscreen button
- Modify `src/components/Layout/Layout.module.css` — footer hide CSS
- Modify `src/lib/i18n/locales/{en,es,pt}.ts` — add `match.actions.exitFullscreen` translations
- Modify `test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx` — add/update browser tests

## Implementation Steps

1. Confirm no unresolved Linear dependency blockers.
2. Create `useInactivityTimer` hook with: `enabled`, `timeoutMs`, `ignoredTargetSelectors`, `shouldIgnoreEvent` config; `{ isActive, reset }` return. Store config in refs to avoid effect restarts on every render.
3. Create `test/hooks/useInactivityTimer.browser.test.tsx` covering: initial active state, timeout expiry, reset on non-ignored events, ignore-by-selector, ignore-by-predicate, disabled mode, unmount cleanup.
4. Integrate into `ActiveMatchScreen.tsx`: compact-height detection via matchMedia, wire hook with ignored selectors and keyboard predicate, pass `data-controls-hidden` to Layout, add Exit fullscreen button in header when `shouldHideControls` is true.
5. Add footer hide CSS to `Layout.module.css` under `@media (height <= 480px)`: `.layout[data-controls-hidden='true'] .footer { opacity: 0; transform: translateY(100%); max-height: 0; margin: 0; overflow: hidden; pointer-events: none; }` plus transitions.
6. Style Exit fullscreen button in `ActiveMatchScreen.module.css` for compact height.
7. Add i18n keys for Exit fullscreen in en/es/pt.
8. Update ActiveMatchScreen browser tests: assert `data-controls-hidden` on root `<main>`, Exit fullscreen button visibility, reveal on non-scoring interaction, ignored score controls.
9. Run focused browser tests then `pnpm complete-check`.

## Validation

- Success criteria:
  - `useInactivityTimer` manages a 5-second window, is stable across re-renders, exposes `reset()`
  - Only the footer hides after inactivity in compact landscape; header stays visible
  - "Exit fullscreen" button appears in header when footer is hidden
  - Clicking "Exit fullscreen" reveals footer and hides the button
  - Score panel clicks, revert button clicks, and remote scoring keys do NOT reveal footer or reset timer
  - Tapping empty space or scrolling DOES reveal footer and reset timer
  - Viewports above 480px keep footer permanently visible
  - Smooth CSS transitions for footer show/hide
  - All tests pass: `pnpm complete-check`
