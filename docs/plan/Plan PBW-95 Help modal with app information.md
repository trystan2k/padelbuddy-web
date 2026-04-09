# Plan PBW-95 — Help Modal with App Information

> This plan encompasses the original help modal feature and two subsequent addenda: the first-visit help spotlight and the Base UI spotlight popover migration.

---

## Task Overview

### Feature 1: Help Modal with App Information

**Main objective**: Replace the inline `APP_VERSION` text currently shown in `TopBar` with an accessible `?` trigger that opens a translated Base UI help modal containing:

- App/about guidance
- Usage guidance
- Advertising/store placeholders
- PWA/offline/install information
- A footer combining app name + `APP_VERSION`

### Feature 2: First-Visit Help Spotlight

**Main objective**: Add a first-visit-only spotlight/tooltip that highlights the existing TopBar help icon on the setup/home screen only, without auto-opening the help modal.

### Feature 3: Base UI Spotlight Popover Migration

**Main objective**: Replace the custom anchored bubble in `AppHelpSpotlight` with a Base UI `Popover` primitive, keeping the custom dimmed overlay/cutout and all existing product behavior unchanged.

---

## Dependencies

### Help Modal

- `src/components/ui/TopBar/TopBar.tsx` — single place where header version metadata is currently rendered
- Base UI Dialog render-prop patterns already exist in `SideSwitchPrompt`, `VoiceSelectionModal`, and `RemoteConfigurationModal`
- Shared modal and overlay styling in `src/styles/shared-setup-modal.module.css` and `src/styles/shared-overlays.module.css`
- Translations in `src/lib/i18n/locales/en.ts`, `es.ts`, and `pt.ts`
- `ShareScreen` uses `TopBar`, so it must opt out of the help trigger to avoid polluting share capture

### First-Visit Spotlight

- `AppHelpDialog.tsx` owns the help trigger and modal
- `TopBar.tsx` already supports `showHelpTrigger`
- `SetupScreen.tsx` is the only TopBar consumer that should opt into the spotlight
- `src/lib/user/id.ts` provides existing browser storage patterns for the seen flag

### Base UI Spotlight Migration

- `AppHelpSpotlight.tsx` owns the custom spotlight overlay, trigger measurement, and live-region announcement
- `AppHelpDialog.tsx` owns help trigger, first-visit state, storage integration, and click path
- `help_spotlight_storage.ts` persists the one-time seen flag

---

## System Impact

### Help Modal

- UI behavior changes in the shared header component used by setup, live match, match end, and share surfaces
- New modal content, trigger styling, and translation keys introduced
- Existing TopBar tests updated; new dialog interaction tests added

### First-Visit Spotlight

- Extends existing help-trigger flow without changing the help modal's core behavior
- Adds one small, UI-local persistence path for a boolean seen flag
- Targeted interaction tests for first-visit, dismissal, and non-reappearance behavior required

### Base UI Spotlight Migration

- Spotlight stays local to the existing TopBar/help-trigger feature
- Product behavior remains stable; only the anchored bubble implementation changes
- Accessibility and interaction behavior revalidated (moving from custom DOM to Base UI popup primitive)

---

## Chosen Approach

### Help Modal

Add a small TopBar-co-located help dialog component that owns its own Base UI Dialog structure and inline SVG `?` trigger, wired into `TopBar` where the version text currently appears. Keep modal content in a dedicated component/CSS module. Add a `showHelpTrigger` opt-out prop so `ShareScreen` can suppress it.

**Why simple approach:**

- Keeps change localized to the one component that currently owns version rendering
- Reuses existing Base UI dialog and shared modal CSS patterns
- Avoids app-wide/global modal state
- Provides a minimal escape hatch for the share capture surface

### First-Visit Spotlight

Keep the enhancement owned near the existing help trigger by adding a dedicated `AppHelpSpotlight` component rendered from `AppHelpDialog` when a setup-screen opt-in prop is enabled. Use a localStorage-backed seen flag, a trigger ref for measurement, and a fixed-position overlay + tooltip that dismisses on overlay click, dismiss button, help-trigger click, or `Escape`.

**Why simple approach:**

- Reuses current `AppHelpDialog` ownership instead of introducing global onboarding state
- Keeps screen scoping simple: only `SetupScreen` opts in
- Uses localStorage for a single browser/device boolean
- Introduces one focused spotlight component rather than a generic onboarding framework

### Base UI Spotlight Popover

Replace only the custom anchored bubble portion of `AppHelpSpotlight` with a controlled Base UI `Popover`, while keeping the custom overlay/cutout, seen-flag flow, and setup-only opt-in unchanged. Anchor via `Popover.Positioner anchor={triggerRef}`.

**Why `Popover` over `Tooltip`:**

- The bubble contains an interactive dismiss button and persists until dismissed — tooltip semantics are wrong
- Using `anchor={triggerRef}` avoids awkward trigger composition between `Dialog.Trigger` and `Popover.Trigger`
- The custom spotlight overlay/cutout remains intact; only the bubble implementation changes

---

## Components to be Created or Modified

### New Components

| File                                                   | Description                                            |
| ------------------------------------------------------ | ------------------------------------------------------ |
| `src/components/ui/TopBar/AppHelpDialog.tsx`           | Help modal dialog with Base UI Dialog                  |
| `src/components/ui/TopBar/AppHelpDialog.module.css`    | Styles for help dialog popup, footer, store badges     |
| `src/components/ui/TopBar/AppHelpSpotlight.tsx`        | First-visit spotlight with Base UI Popover             |
| `src/components/ui/TopBar/AppHelpSpotlight.module.css` | Styles for spotlight popover with arrow                |
| `src/lib/user/help_spotlight_storage.ts`               | SSR-safe localStorage helper for spotlight persistence |

### Modified Components

| File                                         | Changes                                                            |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `src/components/ui/TopBar/TopBar.tsx`        | Replace version text with help trigger; add `showHelpTrigger` prop |
| `src/components/ui/TopBar/TopBar.module.css` | Help trigger styles                                                |
| `src/components/SetupScreen/SetupScreen.tsx` | Mount first-visit spotlight                                        |
| `src/components/ShareScreen/ShareScreen.tsx` | Add `showHelpTrigger={false}` for screenshot isolation             |
| `src/lib/i18n/locales/en.ts`                 | Add `help.*` namespace keys                                        |
| `src/lib/i18n/locales/es.ts`                 | Add `help.*` namespace keys                                        |
| `src/lib/i18n/locales/pt.ts`                 | Add `help.*` namespace keys                                        |
| `design-tokens/base/radius.tokens.json`      | Add spotlight border radius token                                  |

### Test Files

| File                                                       | Description                                    |
| ---------------------------------------------------------- | ---------------------------------------------- |
| `test/components/ui/TopBar/AppHelpDialog.browser.test.tsx` | New — dialog interaction tests                 |
| `test/components/ui/TopBar/TopBar.browser.test.tsx`        | Updated — help trigger presence/absence        |
| `test/components/SetupScreen/SetupScreen.browser.test.tsx` | Updated — spotlight tests                      |
| `test/integration/app-flow.browser.test.tsx`               | Updated — spotlight persistence                |
| `e2e/fixtures.ts`                                          | Updated — store badge and help dialog fixtures |

### Store Badge Assets

| File                              | Description                    |
| --------------------------------- | ------------------------------ |
| `public/stores/AppStore_EN.svg`   | App Store badge (English)      |
| `public/stores/AppStore_ES.svg`   | App Store badge (Spanish)      |
| `public/stores/AppStore_pt.svg`   | App Store badge (Portuguese)   |
| `public/stores/GooglePlay_EN.svg` | Google Play badge (English)    |
| `public/stores/GooglePlay_ES.svg` | Google Play badge (Spanish)    |
| `public/stores/GooglePlay_pt.svg` | Google Play badge (Portuguese) |

---

## Implementation Steps

### Phase 1: Help Modal

1. **Confirm assumptions**: Verify `TopBar` is still the only version-rendering location. Decide whether `ShareScreen` should explicitly pass `showHelpTrigger={false}`. Preserve `#android-store` and `#ios-store` placeholder links exactly.

2. **Create `AppHelpDialog`**: Use Base UI Dialog with render-prop structure (inline SVG `?` trigger, `Dialog.Root`/`Trigger`/`Portal`/`Backdrop`/`Popup`), translated title/description/sections, explicit close control, exact placeholder store links, and footer combining `t('app.title')` with `APP_VERSION`.

3. **Update `TopBar`**: Remove inline version span, render help trigger in same visual area, add optional `showHelpTrigger` prop (default `true`). Keep existing `children` action slot unchanged.

4. **Add CSS Modules**: Trigger styles + modal styles using design tokens and existing shared modal utilities. Ensure modal is scrollable on smaller screens. Validate portrait + mobile-landscape behavior.

5. **Add translations**: Single `help` namespace with keys for `about`, `howToUse`, `advertising`, `pwa`, `footer`, trigger label, close label in en/es/pt. Do not imply in-app install prompt or deeper offline behavior than currently supported.

6. **Add browser tests**: Cover trigger presence/absence, removal of inline version text, open via trigger, close via close button/backdrop/ESC, and exact `href` values for store placeholders. Use stable `data-testid` hooks.

7. **Run verification**: Targeted browser tests → manual QA (keyboard flow, locale switching, responsive behavior) → `pnpm complete-check`.

### Phase 2: First-Visit Spotlight

1. **Add opt-in prop chain**: `showFirstVisitHelpSpotlight` from `SetupScreen` → `TopBar` → `AppHelpDialog`, defaulting to `false` everywhere except setup screen.

2. **Create SSR-safe storage helper**: `help_spotlight_storage.ts` with key `padelbuddy_help_spotlight_seen`. Read in effect so spotlight only appears after mount when flag is absent. Fail-closed (return `true` when localStorage unavailable) to prevent infinite loops in SSR/test environments.

3. **Create `AppHelpSpotlight` component**: Receives help-trigger ref and `onDismiss` callback. Renders:
   - Fixed dimmed overlay
   - Spotlight/cutout around help icon with margin
   - Small tooltip message
   - Dismiss action

4. **Geometry logic**: Measure trigger with `getBoundingClientRect()` after mount and on `resize`. Clamp tooltip placement to viewport. Use `pointer-events: none` on overlay wrapper to allow clicks to pass through to help icon. Do NOT add backdrop-click handler — this preserves single-click trigger behavior.

5. **Integrate dismissal in `AppHelpDialog`**: Overlay click, dismiss button, and `Escape` hide spotlight and mark seen. Clicking help icon marks spotlight seen first, then continues normal help-dialog open behavior. Spotlight must never auto-open the help modal.

6. **Add translation keys**: Spotlight message and dismiss label in en/es/pt.

7. **Add tests**: First-visit visibility, dismissal, storage persistence, help-trigger interaction, setup-only scope.

### Phase 3: Base UI Spotlight Popover Migration

1. **Keep existing flow intact**: First-visit, setup-only, and seen-flag flow in `AppHelpDialog` stays exactly as implemented. Limit changes to the anchored guidance bubble inside `AppHelpSpotlight`.

2. **Replace custom bubble with Base UI `Popover`**: Controlled `Popover.Root open={true}` rendered only while spotlight active, using `Popover.Portal`, `Popover.Positioner`, and `Popover.Popup` anchored to `triggerRef` via `anchor={triggerRef}`.

3. **Choose `Popover` over `Tooltip`**: Document reason: spotlight bubble contains interactive dismiss action, so tooltip semantics are inappropriate.

4. **Keep custom overlay/cutout**: Remove manual tooltip-placement logic. Let Base UI handle anchoring, side selection, viewport collision. Use `side="bottom"`, small `sideOffset`, viewport collision padding, and `positionMethod="fixed"`.

5. **Popover content**: Use Base UI subparts where appropriate (`Popover.Title`, optional `Popover.Description`, `Popover.Close`, `Popover.Arrow`). Keep `initialFocus={false}` and non-tooltip guidance behavior — spotlight must NOT act like an auto-opened modal.

6. **Preserve all dismissal paths**: Overlay click and document-level `Escape` dismiss and mark seen. Popover dismiss button uses popover close path plus existing seen-flag callback. Clicking help icon still marks seen first, then opens help dialog normally.

7. **Update tests**: Assert new Base UI popover semantics/structure without changing expected product behavior.

---

## Dismissal Paths (Spotlight)

| Action          | Behavior                                              |
| --------------- | ----------------------------------------------------- |
| Overlay click   | Dismisses spotlight, marks seen                       |
| Dismiss button  | Dismisses spotlight, marks seen                       |
| `Escape` key    | Dismisses spotlight, marks seen                       |
| Help icon click | Marks spotlight seen, then opens help dialog normally |

**Note**: Click-outside-dismiss is intentionally NOT implemented. Adding a backdrop-click handler to close the spotlight would prevent the single-click trigger behavior (click to dismiss spotlight → click again to open help modal) from working because the second click would be captured by the backdrop handler before reaching the icon.

---

## Store Link Placeholders

Maintain these exact placeholder href values:

- `href="#android-store"` — Google Play store link
- `href="#ios-store"` — App Store link

These are intentional stubs pending real store URLs. Do not replace with real URLs without a separate task.

---

## Validation

### Success Criteria — Help Modal

- [ ] Interactive app headers no longer show inline version text beside the title
- [ ] Translated, accessible `?` trigger opens a Base UI help modal with required sections
- [ ] Modal closes correctly via close control, ESC, and backdrop click
- [ ] Focus returns to trigger after modal closes
- [ ] Footer includes app name plus `APP_VERSION`
- [ ] All new copy available in en, es, and pt
- [ ] Share capture output remains intentional (no accidental help trigger in `ShareScreen`)
- [ ] `pnpm complete-check` passes

### Success Criteria — First-Visit Spotlight

- [ ] Spotlight appears only on setup/home screen, only on first visit
- [ ] Help modal does NOT auto-open when spotlight appears
- [ ] Clicking help icon dismisses spotlight, marks seen, and opens normal help modal
- [ ] Overlay click, dismiss button, and `Escape` dismiss spotlight and mark seen
- [ ] Revisiting on same browser/device does not show spotlight again
- [ ] ShareScreen suppression remains unchanged
- [ ] `pnpm complete-check` passes

### Success Criteria — Base UI Popover Migration

- [ ] Spotlight still appears only on first visit and only on setup/home screen
- [ ] Help modal still does not auto-open when spotlight appears
- [ ] Anchored guidance bubble uses correct Base UI primitive (`Popover`, not `Tooltip`)
- [ ] Clicking help icon still dismisses spotlight, marks seen, and opens normal help modal
- [ ] Overlay click, dismiss button, and `Escape` still dismiss spotlight and mark seen
- [ ] ShareScreen suppression and all non-setup screens unchanged
- [ ] `pnpm complete-check` passes

### Checkpoints

**Pre-implementation:**

- [ ] Verify `TopBar` is still the only version-rendering location
- [ ] Confirm `ShareScreen` should explicitly pass `showHelpTrigger={false}`
- [ ] Confirm `Popover` is chosen because bubble contains interactive content
- [ ] Confirm setup/home opts in explicitly rather than inferring route

**During-implementation:**

- [ ] Verify dialog uses Base UI semantics correctly (`role="dialog"`, accessible name/description, portal/backdrop behavior)
- [ ] Verify help copy does not overstate current PWA/install support
- [ ] Verify overlay does not block intentional help-icon clicks
- [ ] Verify localStorage absence/failure fails closed (no crash, no spotlight loop)
- [ ] Verify popover is anchored via `triggerRef` (not a competing second trigger)
- [ ] Confirm `initialFocus={false}` / non-modal behavior does not steal focus

**Post-implementation:**

- [ ] Switch locales to en/es/pt; open/close modal with mouse and keyboard
- [ ] Confirm responsive modal scrolling on narrow/landscape layouts
- [ ] Rerun share flow to ensure no visual regression when trigger is suppressed
- [ ] Clear spotlight seen key to simulate first visit; confirm spotlight shows on setup/home only
- [ ] Confirm spotlight stays hidden on revisit
- [ ] Confirm spotlight cutout still aligns to help icon on narrow/mobile layouts
- [ ] Confirm popover dismiss button remains keyboard reachable
- [ ] Confirm `Escape` works even when popover has not moved focus
