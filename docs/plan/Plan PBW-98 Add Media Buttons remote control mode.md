## Task Analysis

- Main objective: Add a persisted Remote Control mode selector that defaults to Media Buttons for new configurations, keeps Keyboard Mapping working exactly as it does today when selected, and enables fixed media-button scoring/revert actions on both Web and Native match screens.
- Identified dependencies:
  - Existing remote-config UI and modal patterns: `src/components/SetupScreen/RemoteConfigurationModal.tsx`, `src/components/SetupScreen/RemoteConfigurationModal.module.css`, `src/components/SetupScreen/SetupScreen.tsx`
  - Existing keyboard remote path that must remain stable in keyboard mode: `src/lib/input/keyboard-aliases.ts`, `src/lib/input/use-input-handler.tsx`, `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`
  - Existing remote persistence layer that should continue to own this preference: `src/lib/input/remote-controller-storage.ts`
  - Existing match-start user-gesture preparation that is adjacent to media-session priming: `src/components/SetupScreen/SetupScreen.tsx`, `src/lib/speech/speech-service.ts`, `src/lib/input/wake-lock.tsx`
  - Existing native bridge pattern for custom Capacitor plugins: `src/lib/license/index.ts`, `mobile/android/app/src/main/java/com/padelbuddy/web/LicensePlugin.java`, `mobile/android/app/src/main/java/com/padelbuddy/web/MainActivity.java`
  - Copy/test coverage to extend: `src/lib/i18n/locales/{en,es,pt}.ts`, `test/input/*`, `test/components/SetupScreen/SetupScreen.browser.test.tsx`, `test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx`
- System impact:
  - The persisted remote-controller record must evolve from “keyboard bindings only” to a full config object with mode + keyboard bindings, while safely migrating legacy saved records so existing keyboard users do not silently lose their behavior.
  - The active match input flow must become mode-aware without regressing the current keyboard-only path.
  - Media Buttons mode adds a new cross-cutting lifecycle: media-session claiming/cleanup on Web, plus a thin Native bridge for Android/iOS delivery, and this lifecycle must stay independent from speech announcements.

## Chosen Approach

- Proposed solution:
  - Persist a single `remote controller config` in the existing remote-controller storage record, using the current object store/key, with a shape equivalent to `{ mode, keyboardBindings, updatedAt }`.
  - Keep the current keyboard implementation intact for Keyboard Mapping mode by continuing to use `useInputHandler` and `keyboard-aliases.ts`, only gating it behind `mode === 'keyboard-mapping'`.
  - Add a dedicated Media Buttons runtime adapter for `mode === 'media-buttons'` that owns fixed action mapping, Web media-session activation/cleanup, DOM key fallbacks for media keys, and Native event bridging through a small Capacitor plugin surface.
  - Update the existing Remote Configuration modal to switch between modes, render Media Buttons mappings as read-only, and preserve saved/custom keyboard bindings when users toggle away from keyboard mode and back.
- Justification for simplicity:
  - Rejected approach 1: storing mode in setup preferences or a separate key would split one feature across multiple persistence locations and complicate restore logic for both SetupScreen and ActiveMatchScreen.
  - Rejected approach 2: rewriting `useInputHandler` into a global “all remote types” engine would raise regression risk in the already-working keyboard path; a separate media-buttons hook keeps keyboard behavior isolated and unchanged.
  - Rejected approach 3: coupling Media Session activation to speech/announcement code would make media-button reliability depend on `audioAnnouncementsEnabled`, which directly conflicts with the acceptance criteria.
  - The selected path reuses existing storage, modal, screen, and Capacitor-plugin patterns, while containing the new complexity to a mode-aware config model and a single media-buttons adapter.
- Components to be modified/created:
  - Modify: `src/lib/input/remote-controller-storage.ts`
  - Create: `src/lib/input/remote-controller-config.ts` (mode/config model, defaults, legacy migration helpers)
  - Create: `src/lib/input/media-buttons.ts` (fixed mapping + display metadata)
  - Create: `src/lib/input/use-media-buttons-remote.tsx`
  - Create: `src/lib/input/media-buttons-native.ts`
  - Modify: `src/components/SetupScreen/RemoteConfigurationModal.tsx`, `src/components/SetupScreen/RemoteConfigurationModal.module.css`, `src/components/SetupScreen/SetupScreen.tsx`
  - Modify: `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`
  - Modify: `src/lib/i18n/locales/en.ts`, `src/lib/i18n/locales/es.ts`, `src/lib/i18n/locales/pt.ts`
  - Create/Modify Native bridge files: `mobile/android/app/src/main/java/com/padelbuddy/web/MainActivity.java`, `mobile/android/app/src/main/java/com/padelbuddy/web/MediaButtonsPlugin.java`, `mobile/ios/App/App/AppDelegate.swift`, `mobile/ios/App/App/MediaButtonsPlugin.swift` (or the equivalent App-target plugin registration files used by the implementer)
  - Modify/Create tests: `test/input/remote-controller-storage.test.ts`, `test/input/keyboard-aliases.test.ts`, `test/input/use-media-buttons-remote.browser.test.tsx`, `test/components/SetupScreen/SetupScreen.browser.test.tsx`, `test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx`
  - Plan file: `/Users/trystan2k/Documents/Thiago/Repos/padelbuddy-web/docs/plan/Plan PBW-98 Add Media Buttons remote control mode.md`

## Implementation Steps

1. Define the remote-controller config model and lock the migration rule before coding.
   - Add a shared model for `RemoteControllerMode` (`'media-buttons' | 'keyboard-mapping'`) plus a `RemoteControllerConfig` object that carries the selected mode and the existing customizable keyboard bindings.
   - Set the fresh-install fallback to Media Buttons mode with empty keyboard bindings so new users land on the new default.
   - Treat legacy persisted records that only contain keyboard bindings as `keyboard-mapping` on load so existing users keep their current remote behavior instead of being silently flipped to Media Buttons after upgrade.
   - Risk/Mitigation: this legacy-migration assumption is the main user-facing edge case in the task; if product explicitly wants all historical users forced to Media Buttons, stop and confirm before touching persistence because that changes existing behavior.
2. Refactor remote-controller storage to persist the full config in the existing store/key.
   - Replace the bindings-only load/save helpers with config-centric helpers such as `loadRemoteControllerConfig`, `loadRemoteControllerConfigWithFallback`, and `saveRemoteControllerConfig`, still using the current IndexedDB object store and record key.
   - Update parsing so the storage layer accepts both the new record shape and the legacy `{ bindings, updatedAt }` shape, sanitizes malformed keyboard bindings the same way it does today, and falls back to a valid default config instead of `null` when appropriate.
   - Remove the old “delete the record when all bindings are empty” save path, because mode selection must now persist even when keyboard bindings are blank.
   - Add/adjust unit tests to cover: new-record save/load, default fallback, malformed new records, malformed legacy records, and legacy keyboard-only migration into keyboard mode.
   - Risk/Mitigation: avoid a database version bump unless implementation proves it is truly necessary; keeping the same object store and key lowers upgrade risk and reduces rollback surface.
3. Build the Media Buttons runtime adapter as a standalone hook/service, independent from speech.
   - Create a fixed media-button mapping module for the four accepted actions: Volume Up → Team A score, Volume Down → Team A revert, Next Track → Team B score, Previous Track → Team B revert.
   - Implement a `useMediaButtonsRemote` hook that:
     - registers Web handlers through `navigator.mediaSession` for supported transport actions;
     - adds DOM `keydown` fallback handling for the relevant audio/media key values emitted by browsers or Bluetooth remotes;
     - owns silent media-session claiming/cleanup so the app can reliably receive Media Session actions even when audio announcements are disabled;
     - exposes a narrow callback surface (`onAdd`, `onUndoForTeam`, `onError`) similar to the existing keyboard path.
   - Add a small Capacitor wrapper (`media-buttons-native.ts`) and Native plugin bridge so Android/iOS can emit the same four semantic actions into JavaScript instead of relying on WebView key delivery alone.
   - Follow the existing custom-plugin pattern already used by the license feature: JS wrapper in `src/`, plugin registration in `MainActivity.java`/iOS app target, and event listeners that can be attached/detached cleanly.
   - Add browser-level integration tests for fixed mapping plus activation/cleanup behavior by stubbing `navigator.mediaSession` and verifying handler registration/removal; include a case with `audioAnnouncementsEnabled: false` so the new media-session path is proven independent from speech.
   - Risk/Mitigation: Native media-button delivery is the highest technical risk after persistence; validate event delivery on at least one real Android device and one iOS device before considering the feature shippable, and keep the new adapter isolated so keyboard mode remains unaffected if native work needs iteration.
4. Extend the Remote Control Configuration modal for mode switching and read-only Media Buttons display.
   - Load the full remote-controller config on modal open, not just keyboard bindings.
   - Add an accessible mode selector near the top of the modal using existing project button/pressed-state patterns so users can switch between Media Buttons and Keyboard Mapping without introducing a new design system control.
   - In Media Buttons mode, render the four fixed mappings as read-only rows, hide or disable capture/clear/reset actions, and make it visually obvious that the mapping cannot be edited.
   - In Keyboard Mapping mode, keep the current capture flow, duplicate-key handling, clear/reset defaults behavior, and save/cancel semantics exactly as they work today.
   - Preserve the keyboard draft bindings while the user toggles between modes inside the modal so switching back to Keyboard Mapping does not wipe their customization before save.
   - Update locale strings and CSS module styles for the new selector, read-only state, and any new helper copy.
   - Add browser tests that verify: Media Buttons is selected by default for a fresh config, legacy keyboard configs reopen in keyboard mode, media-mode rows are read-only, keyboard-mode rows remain editable, and saving/restoring the selected mode works.
5. Wire SetupScreen and ActiveMatchScreen to the persisted mode without changing touch scoring behavior.
   - Update SetupScreen to load/cache the remote-controller config early so `handleStartMatch` knows whether Media Buttons mode is active.
   - In `handleStartMatch`, prime the media-buttons session from the user gesture when Media Buttons mode is selected, alongside the existing wake-lock request and speech unlock logic, but do not gate it behind `audioAnnouncementsEnabled`.
   - Update ActiveMatchScreen to load the full remote config on mount, enable `useInputHandler` only in Keyboard Mapping mode, and enable `useMediaButtonsRemote` only in Media Buttons mode.
   - Keep the TeamPanel click handlers and the on-screen revert buttons immediate so touch interactions never inherit any media-session activation or remote buffering behavior.
   - On storage-load failure, fall back to a valid default config and surface the error the same way the current code handles remote-config load failures.
   - Add screen-level browser regressions to prove: keyboard mode still honors the current customizable behavior, media mode dispatches the fixed actions, and switching modes persists across remount/reload.
6. Finish the QA pass, including manual device validation, before rollout.
   - Run targeted unit/browser suites for storage, modal UI, keyboard regression, and media-session activation/cleanup.
   - Add a short manual verification matrix covering: fresh install default = Media Buttons, legacy saved keyboard config restore, all four Media Buttons actions on Web, all four actions on Android/iOS native builds, announcements disabled + media buttons still working, and cleanup when leaving the active match screen.
   - Finish with `pnpm complete-check`.
   - Rollback/Mitigation: do not ship the default-mode flip if the Native bridge or media-session claim is not reliable on device; keep the work in-branch until both Web and Native validations pass, rather than partially shipping a UI default that cannot satisfy the runtime acceptance criteria.

## Validation

- Success criteria:
  - The Remote Control Configuration modal lets users choose between Media Buttons and Keyboard Mapping.
  - Fresh configurations default to Media Buttons mode, while legacy keyboard-only saved configs restore into Keyboard Mapping mode to prevent regression.
  - Media Buttons mode displays the fixed mappings read-only and does not allow editing.
  - Keyboard Mapping mode preserves the current customizable behavior exactly as it works today.
  - The selected mode is persisted and restored from the same remote-controller storage location currently used for remote configuration.
  - Media Buttons actions trigger the correct score/revert callbacks on Web and Native.
  - Media Session activation/cleanup is reliable even when audio announcements are disabled.
  - `pnpm complete-check` passes after implementation.
- Checkpoints:
  - Pre-implementation assumptions check: confirm the migration rule for existing keyboard-only saved records before editing storage/parsing code.
  - After Step 2: storage tests prove default selection, mode persistence, and legacy-record migration all behave deterministically.
  - After Step 3: fixed mapping tests and media-session activation/cleanup tests pass, and a real-device smoke test confirms Native event delivery is viable before UI work is considered complete.
  - After Step 4: SetupScreen browser tests verify the mode selector, read-only Media Buttons UI, and keyboard-editing regression coverage.
  - After Step 5: ActiveMatchScreen browser tests verify keyboard mode remains unchanged and media mode dispatches the correct fixed actions without affecting touch controls.
  - Post-implementation verification: run `pnpm complete-check` and perform manual Web + Android + iOS checks for mode restore, media-button scoring/revert, announcements-disabled reliability, and cleanup when exiting the match screen.
