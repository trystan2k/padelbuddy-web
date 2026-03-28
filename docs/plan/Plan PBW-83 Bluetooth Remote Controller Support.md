## Task Analysis

- Main objective: Add customizable Bluetooth/HID remote support to the active match flow by introducing a SetupScreen configuration modal, persisted key mappings, and an active-screen keyboard listener that can score or revert points from mapped remote buttons without using the Web Bluetooth API.
- Identified dependencies:
  - Existing input module: `src/lib/input/keyboard-aliases.ts`, `src/lib/input/use-input-handler.tsx`, `src/lib/input/wake-lock.tsx`
  - Active match state and scoring: `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`, `src/components/ActiveMatchScreen/useMatchSession.ts`, `src/lib/current-match/session.ts`, `src/core/match/types.ts`
  - IndexedDB bootstrap and storage patterns: `src/lib/persistence/indexed-db.ts`, `src/lib/i18n/locale-storage.ts`, `src/lib/speech/speech-storage.ts`, `test/current-match/indexed-db.browser.test.ts`
  - Setup UI and modal patterns: `src/components/SetupScreen/SetupScreen.tsx`, `src/components/SetupScreen/SetupScreen.module.css`, `src/components/ActiveMatchScreen/SideSwitchPrompt/SideSwitchPrompt.tsx`, `src/components/CurrentMatchStartupGate/CurrentMatchStartupGate.tsx`
  - Copy and localization: `src/lib/i18n/locales/en.ts`, `src/lib/i18n/locales/es.ts`, `src/lib/i18n/locales/pt.ts`
- System impact:
  - Modify the shared IndexedDB bootstrap, which requires a database version bump so existing installs receive the new object store.
  - Rework the input layer from hardcoded `score-team-*` / `undo` aliases into a resolver that supports persisted remote mappings plus legacy fallback aliases.
  - Add new SetupScreen UI and new ActiveMatchScreen side effects, plus browser/unit tests across input, storage, and component layers.
  - Preserve the current scoring domain and `undoScoreAction()` model unless product explicitly asks for a true history-editing “remove last point for team X” feature; the simplest safe interpretation for this issue is team-aware remote revert = guarded undo when the latest scoring action belongs to that team.

## Chosen Approach

- Proposed solution:
  - Keep Bluetooth support at the keyboard-event layer and do not introduce a global provider, route change, or scoring-engine rewrite.
  - Layer persisted remote bindings on top of the existing keyboard alias system: custom remote mappings handle `add-team-1`, `revert-team-1`, `add-team-2`, and `revert-team-2`, while the current built-in aliases continue to work as legacy defaults (`ArrowLeft`, `ArrowRight`, and the current undo keys).
  - Reimplement `useInputHandler` as an ActiveMatchScreen-focused keyboard hook that consumes the live action list plus score/undo callbacks, buffers add presses for a single double-press window (~350–400 ms), converts a second same-team press into a guarded revert, and prevents default browser behavior for any resolved mapped key.
  - Add a focused `RemoteConfigurationModal` in `SetupScreen` using the existing Base UI Dialog pattern and IndexedDB storage pattern already used by locale/speech preferences.
- Justification for simplicity:
  - Rejected approach 1: introducing app-wide remote/input context would add lifecycle complexity for a feature that is only needed on SetupScreen and ActiveMatchScreen.
  - Rejected approach 2: adding new match-domain actions for `revert-team-1` / `revert-team-2` would force a scoring-engine and UI semantics change that is not required to satisfy the accepted remote-controller scope.
  - Rejected approach 3: optimistic add-then-undo double-click handling is harder to reason about and risks score flashing; a single buffered add window is simpler and safer for score integrity.
  - The selected path keeps the change set localized to input/storage/UI integration, reuses existing IndexedDB and Dialog patterns, and limits regression risk in `src/core/match/`.
- Components to be modified/created:
  - Modify: `src/lib/persistence/indexed-db.ts`
  - Modify: `src/lib/input/keyboard-aliases.ts`, `src/lib/input/use-input-handler.tsx`, `src/lib/input/index.ts`
  - Create: `src/lib/input/remote-controller-storage.ts`
  - Modify: `src/components/SetupScreen/SetupScreen.tsx`, `src/components/SetupScreen/SetupScreen.module.css`
  - Create: `src/components/SetupScreen/RemoteConfigurationModal.tsx`, `src/components/SetupScreen/RemoteConfigurationModal.module.css`
  - Modify: `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`
  - Modify: `src/lib/i18n/locales/en.ts`, `src/lib/i18n/locales/es.ts`, `src/lib/i18n/locales/pt.ts`
  - Modify/Create tests: `test/input/keyboard-aliases.test.ts`, `test/input/use-input-handler.browser.test.tsx`, `test/input/regression.test.ts`, `test/current-match/indexed-db.browser.test.ts`, `test/components/SetupScreen/SetupScreen.browser.test.tsx`, `test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx`, `test/input/remote-controller-storage.test.ts`
  - Plan document path: `/Users/trystan2k/Documents/Thiago/Repos/padelbuddy-web/docs/plan/Plan PBW-83 Bluetooth Remote Controller Support.md`

## Implementation Steps

1. Lock the behavior boundary before coding.
   - Files/reference only: `docs/prd/bluetooth-remote-support.md`, `src/core/match/types.ts`, `src/lib/current-match/session.ts`, `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`.
   - Changes to make: document in the implementation notes and code comments that remote `revert-team-1` / `revert-team-2` are implemented as guarded undo against the latest scoring action for that same team, while the existing on-screen revert buttons remain unchanged.
   - Why: the current domain only supports append-only score actions plus `undoScoreAction()`, so silently introducing true team-specific historical deletion would expand scope and risk scoring regressions.
   - Risk/Mitigation: this is the highest-risk semantic assumption; if stakeholders reject guarded undo, stop and split a follow-up issue for scoring-engine changes before implementation continues.
2. Extend IndexedDB bootstrap and add remote-controller persistence.
   - Modify `src/lib/persistence/indexed-db.ts`:
     - add a new shared object store constant for remote-controller preferences;
     - bump `persistenceDatabaseVersion` so previously installed databases receive the new store during upgrade;
     - include the new store in `sharedIndexedDbObjectStoreNames`.
   - Create `src/lib/input/remote-controller-storage.ts` following `locale-storage.ts` / `speech-storage.ts`:
     - define the stored shape for the four configurable remote bindings plus `updatedAt` metadata;
     - expose `createRemoteControllerStorage`, `loadRemoteControllerBindings`, `saveRemoteControllerBindings`, and `clearRemoteControllerBindings`;
     - validate stored data and fall back to `null` / defaults if the record is malformed.
   - Add or update tests:
     - create `test/input/remote-controller-storage.test.ts` mirroring the locale/speech storage suite;
     - extend `test/current-match/indexed-db.browser.test.ts` to verify the new remote store can coexist in the shared database bootstrap with current match, locale, and speech persistence.
   - Why: persistence must exist before either screen can load or save remote mappings.
   - Risk/Mitigation: IndexedDB version bumps are sticky in real browsers, so browser tests must pass before merging; if the upgrade path breaks, revert the version bump within the branch before release rather than shipping a partially upgraded schema.
3. Refactor keyboard mapping from hardcoded aliases into a layered resolver.
   - Modify `src/lib/input/keyboard-aliases.ts`:
     - expand the action model to support `add-team-1`, `revert-team-1`, `add-team-2`, `revert-team-2`, `undo`, and `unknown`;
     - keep the current hardcoded alias set as a legacy fallback map so existing keyboard shortcuts continue to work by default;
     - add key-normalization and lookup helpers that first check persisted remote bindings, then fall back to the legacy alias map;
     - centralize any “display label” helper needed by the configuration modal so key names render consistently.
   - Modify `src/lib/input/index.ts` to export the new types/helpers.
   - Update `test/input/keyboard-aliases.test.ts` and the alias portions of `test/input/regression.test.ts` to cover:
     - legacy default mappings still resolving correctly;
     - custom persisted bindings overriding or augmenting legacy behavior;
     - unknown keys and case normalization;
     - duplicate/empty custom bindings resolving predictably.
   - Why: the hook and the modal both need one authoritative source of truth for resolving and displaying key mappings.
4. Reimplement `useInputHandler` around buffered remote actions instead of session-level debounce.
   - Modify `src/lib/input/use-input-handler.tsx`:
     - replace the current hard dependency on `CurrentMatchSession` with a simpler screen-integration API built around the current action list plus async callbacks such as `onAdd(teamId)` and `onUndo()`;
     - keep the existing modifier-key and editable-target guards so browser shortcuts and text entry are not broken;
     - resolve actions through the new layered keyboard mapping helper;
     - prevent default browser behavior for any resolved mapping;
     - remove the old global 300 ms scoring debounce from keyboard handling and replace it with a per-team buffered add window (~350–400 ms) that delays a score long enough to detect a double-press for the same team;
     - when the second same-team add press lands inside the window, cancel the pending add and execute the guarded revert path instead;
     - when an explicit `revert-team-*` mapping is pressed, call guarded undo immediately;
     - keep timer cleanup and wake-lock cleanup safe on unmount, but do not expand wake-lock scope as part of this issue.
   - Update `test/input/use-input-handler.browser.test.tsx` to cover:
     - single mapped add press commits after the buffer window;
     - double-press within the window reverts instead of scoring;
     - explicit revert mapping only undoes when the latest action belongs to that team;
     - legacy undo keys still work;
     - `preventDefault()` is called for mapped keys;
     - unmapped keys, modifier keys, and focused inputs remain ignored.
   - Update `test/input/regression.test.ts` so remote input still produces the same canonical match state as direct session calls.
   - Why: this is the core engine change required to make remote presses reliable on the active game screen.
5. Add the SetupScreen “Remote Configuration” modal using the existing dialog pattern.
   - Create `src/components/SetupScreen/RemoteConfigurationModal.tsx` and `RemoteConfigurationModal.module.css`.
   - Build it with `@base-ui/react/dialog` following the patterns already used in `SideSwitchPrompt` and `CurrentMatchStartupGate`.
   - Modal responsibilities:
     - load the current stored bindings on open;
     - render four rows for Add Team 1 / Revert Team 1 / Add Team 2 / Revert Team 2;
     - enter a “listening” state when the user chooses to bind one action;
     - capture the next physical key press via `window` keydown while the modal is open, preventing dialog-close side effects for keys like `Escape` when capture is active;
     - enforce one key per configurable action by clearing/replacing duplicates rather than allowing ambiguous assignments;
     - expose `Clear`, `Reset defaults`, `Cancel`, and `Save` actions;
     - use the existing toast system for load/save failure feedback and non-blocking success feedback if the UX needs confirmation.
   - Modify `src/components/SetupScreen/SetupScreen.tsx` and `SetupScreen.module.css` to add a clearly labeled trigger in the pre-match settings area, maintain modal open/close state, and keep the new UI aligned with existing SetupScreen layout and token usage.
   - Why: configuration belongs before the match starts, and the app already has accessible modal patterns that fit this requirement.
   - Risk/Mitigation: keyboard capture inside a dialog can conflict with dialog shortcuts; test `Escape`, arrow keys, Backspace, and Delete explicitly while the modal is in listening mode.
6. Integrate remote input on the active match screen without changing touch behavior.
   - Modify `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`:
     - load persisted remote bindings on mount and keep a local ready/default state;
     - call the reworked `useInputHandler` with `snapshot.actions`, `scorePoint`, `undoScoreAction`, `enabled`, and the loaded mappings;
     - keep the existing TeamPanel click handlers and on-screen revert buttons immediate so touch UX does not inherit the remote delay window;
     - fall back to the legacy alias map if remote preferences fail to load.
   - Do not widen the change into `useMatchSession.ts` unless the hook refactor reveals a genuine need; prefer to keep session management stable.
   - Update `test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx` to simulate keyboard events against the rendered screen and verify add, guarded revert, and `preventDefault()` behavior from the screen boundary rather than only at the hook level.
   - Why: ActiveMatchScreen is the only runtime surface where mapped remote events should affect scoring.
7. Add copy, localization, and regression coverage, then run the full QA gate.
   - Modify `src/lib/i18n/locales/en.ts`, `es.ts`, and `pt.ts` with:
     - the SetupScreen trigger label;
     - modal title, description, action labels, listening state, clear/reset/save/cancel copy;
     - any toast/error strings needed for persistence failures.
   - Re-run and update any affected component snapshots/assertions in:
     - `test/components/SetupScreen/SetupScreen.browser.test.tsx`
     - `test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx`
     - `test/input/*`
     - `test/current-match/indexed-db.browser.test.ts`
   - Finish with targeted manual validation using a Bluetooth keyboard/HID remote plus `pnpm complete-check`.
   - Why: the feature spans storage, i18n, modal UX, and active-screen input, so the final pass must validate both automated coverage and the real-device interaction path.

## Validation

- Success criteria:
  - SetupScreen exposes a working “Remote Configuration” entry point and modal.
  - Users can bind physical keys for Add Team 1, Revert Team 1, Add Team 2, and Revert Team 2, and those bindings persist across reloads through IndexedDB.
  - ActiveMatchScreen responds to mapped keys only while active, prevents default browser behavior for mapped keys, and leaves form inputs/browser shortcuts alone when the screen should not handle them.
  - A single mapped add press scores after the configured buffer window, while a second same-team press inside the window triggers the guarded revert path instead.
  - Legacy default keyboard shortcuts (`ArrowLeft`, `ArrowRight`, current undo keys) still work when no custom remote mapping overrides them.
  - No scoring-engine files in `src/core/match/` need to change for this issue.
  - `pnpm complete-check` passes after the feature is implemented.
- Checkpoints:
  - Pre-implementation: confirm the guarded-undo interpretation for team-specific remote revert; if not accepted, stop and re-scope before coding.
  - After Step 2: IndexedDB tests prove the new shared object store upgrades cleanly and remote bindings can be saved/loaded/cleared.
  - After Step 3: alias resolver tests prove legacy defaults and custom overrides both resolve correctly.
  - After Step 4: hook tests prove buffered add, double-press revert, `preventDefault()`, and editable-target guards all work deterministically.
  - After Step 5: SetupScreen browser tests prove the modal opens, captures keys, saves bindings, and handles duplicate or cleared assignments correctly.
  - After Step 6: ActiveMatchScreen browser tests prove the live screen reacts to mapped remote events without delaying touch interactions.
  - Post-implementation: run manual Bluetooth keyboard/HID checks for single press, double press, explicit revert mapping, refresh persistence, and no-op guarded revert when the latest action belongs to the other team.
  - Rollback trigger: if buffered remote input introduces scoring regressions or IndexedDB upgrade failures, revert the PBW-83 input/storage changes as a unit rather than partially shipping the modal without runtime support.
