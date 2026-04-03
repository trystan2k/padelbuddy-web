# Plan PBW-87 Responsive Overhaul

## Issue

- **ID**: PBW-87 — Responsive overhaul: Active Match LANDSCAPE-only + app-wide mobile responsiveness
- **URL**: https://linear.app/padelbuddyweb/issue/PBW-87/responsive-overhaul-active-match-landscape-only-app-wide-mobile

## Context

The app was designed for iPad 6th gen resolution (1024x768). Smaller devices (phones) and portrait orientations show poor layouts and UI breakage.

## Key Decisions Confirmed

| Decision                | Choice                                                                |
| ----------------------- | --------------------------------------------------------------------- |
| Landscape enforcement   | CSS + JavaScript orientation detection only (no Orientation API lock) |
| Breakpoint strategy     | Width-based: phone < 480px, tablet 768-1023px, desktop ≥ 1024px       |
| Rotate blocker style    | Full takeover - blocks interaction, auto-dismisses on landscape       |
| Header on small screens | Collapses to ~48px instead of 64px                                    |
| Breakpoint token file   | `design-tokens/app/breakpoint.tokens.json`                            |
| Rotate icon             | Inline SVG                                                            |

## Implementation Order (Subtasks)

1. **PBW-88** — Active Match: enforce LANDSCAPE + rotate-device blocker ← STARTING HERE
2. **PBW-89** — App shell responsiveness audit & fixes
3. **PBW-90** — Active Match: component layout updates (landscape)
4. **PBW-91** — QA & responsive test coverage
5. **PBW-92** — Responsive polish & small fixes

---

## Slice 1: PBW-88 — Active Match: Enforce LANDSCAPE + Rotate Device Blocker

### Overview

Create the rotate-device blocker component and orientation detection for the Active Match screen.

### Tasks

1. **Create breakpoint tokens** (`design-tokens/app/breakpoint.tokens.json`)
   - phone-max-width: 639px
   - tablet-max-width: 1023px
   - desktop-min-width: 1024px

2. **Create orientation detection hook** (`src/lib/orientation/useOrientationDetection.ts`)
   - Detect portrait vs landscape using `window.matchMedia`
   - Listen for orientation changes
   - Return `{ isPortrait: boolean, isLandscape: boolean }`

3. **Create RotateDeviceBlocker component** (`src/components/ui/RotateDeviceBlocker/`)
   - Full-screen overlay with backdrop
   - Inline SVG phone rotate icon
   - Instructional text (using existing i18n)
   - Non-dismissible, blocks all interaction
   - Uses design tokens for styling

4. **Add translations** (en, pt, es)
   - Key: `match.rotateDevice.*`
   - Title: "Rotate your device"
   - Description: "This screen works best in landscape mode. Please rotate your device to continue."

5. **Integrate into ActiveMatchScreen**
   - Add orientation detection
   - Render RotateDeviceBlocker when `isPortrait === true`
   - Auto-dismiss when `isLandscape === true`

6. **Update Layout.module.css**
   - Add phone breakpoint styles

### Files to Create/Modify

**Create:**

- `design-tokens/app/breakpoint.tokens.json`
- `src/lib/orientation/index.ts`
- `src/lib/orientation/useOrientationDetection.ts`
- `src/components/ui/RotateDeviceBlocker/RotateDeviceBlocker.tsx`
- `src/components/ui/RotateDeviceBlocker/RotateDeviceBlocker.module.css`
- `src/components/ui/RotateDeviceBlocker/index.ts`

**Modify:**

- `design-tokens/base/dimension.tokens.json` (reference)
- `design-tokens/style-dictionary.config.json` (include new source)
- `src/lib/i18n/locales/en.ts`
- `src/lib/i18n/locales/pt.ts`
- `src/lib/i18n/locales/es.ts`
- `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`
- `src/components/ActiveMatchScreen/ActiveMatchScreen.module.css`
- `src/components/Layout/Layout.module.css`

---

## Slice 2: PBW-89 — App Shell Responsiveness Audit & Fixes

### Overview

Audit and fix the Layout component and shell for phone responsiveness.

### Tasks

1. Audit Layout component CSS
2. Add responsive header (collapse to ~48px on phones)
3. Ensure footer adapts to content
4. Add phone breakpoint styles to SetupScreen
5. Update screen tokens if needed

---

## Slice 3: PBW-90 — Active Match: Component Layout Updates

### Overview

Ensure Active Match components work well in landscape on all device sizes.

### Tasks

1. Review/update TeamPanel for landscape phone layouts
2. Review/update SetsCard positioning
3. Review/update SideSwitchPrompt
4. Review/update TopBar in Active Match context

---

## Slice 4: PBW-91 — QA & Responsive Test Coverage

### Overview

Add Playwright E2E tests for orientation behavior.

### Tasks

1. Add Playwright E2E test: Active Match portrait shows blocker
2. Add Playwright E2E test: Active Match landscape shows scoreboard
3. Add Playwright E2E test: Orientation change dismisses blocker
4. Add Playwright E2E test: Setup screen renders on phone without overflow
5. Add Playwright E2E test: Other screens render on phone without overflow

---

## Slice 5: PBW-92 — Responsive Polish & Small Fixes

### Overview

Handle edge cases and fix any regressions.

### Tasks

1. Test orientation change during scoring action
2. Test unusual aspect ratios (foldables)
3. Accessibility check for rotate prompt
4. Fix any regressions from previous slices
5. Final visual verification

---

## Assumptions

1. Orientation detection via `window.matchMedia('(orientation: portrait)')`
2. Phone baseline: iPhone SE (375px), iPhone 13/14/15 (390px width)
3. Tablet baseline: iPad 9/10/11/Pro portrait and landscape
4. No PWA/offline functionality changes
5. Existing CSS Modules architecture maintained

---

## Acceptance Criteria

- [ ] Active Match screen displays only in landscape; when opened in portrait it shows a full-screen rotate-device blocker
- [ ] The rotate-device blocker is visually consistent with design tokens
- [ ] All other screens render correctly on phone sizes in both portrait and landscape
- [ ] No critical visual regressions on tablet/iPad landscape (1024x768+)
- [ ] Responsive breakpoints use existing design tokens
- [ ] Playwright E2E tests cover orientation behavior
