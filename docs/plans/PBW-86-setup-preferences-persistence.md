## Task Analysis

- Main objective: Replace standalone `speech-preference` persistence with a unified client-only IndexedDB preference flow that stores the existing speech preferences plus the approved Setup Screen values, restores them when the user returns to Setup Screen after a match or reload, and does not touch unrelated settings or any backend/API surface.
- Identified dependencies:
  - Shared IndexedDB bootstrap: `src/lib/persistence/indexed-db.ts`
  - Existing speech persistence/types: `src/lib/speech/speech-storage.ts`, `src/lib/speech/types.ts`, `src/lib/speech/index.ts`, `src/lib/speech/speech-service.ts`
  - Setup Screen state/voice handling: `src/components/SetupScreen/useSetupForm.ts`, `src/components/SetupScreen/SetupScreen.tsx`, `src/components/SetupScreen/types.ts`
  - Persistence pattern references: `src/lib/i18n/locale-storage.ts`, `src/lib/input/remote-controller-storage.ts`
  - Regression coverage: `test/lib/speech/*`, `test/components/SetupScreen/*`, `test/current-match/indexed-db.browser.test.ts`
- System impact:
  - Modify the shared IndexedDB schema by adding `setup-preference` and bumping the version from 5 to 6.
  - Move speech and setup persistence to one canonical client-side record, which changes cross-module imports and migration behavior.
  - Update Setup Screen hydration/save timing so only the approved fields persist while the rest of the setup form continues to behave as it does today.
  - Update and expand tests across storage, setup form, shared DB bootstrap, and speech mocks.

## Chosen Approach

- Proposed solution:
  - Create `src/lib/setup/setup-storage.ts` as the canonical persistence module for a single `setup-preference` record.
  - Define one full `SetupPreferences` contract for the persisted business values, then implement slice-aware helpers inside the module so setup writers only update setup-toggle fields and speech writers only update speech fields without overwriting each other.
  - Implement lazy migration inside the new module: load the new `setup-preference` first, and only if it is absent, read legacy `speech-preference`, validate it, merge it onto the current setup defaults, write the new record, and optionally clear the migrated legacy key.
  - Keep `useSetupForm` responsible for hydrating all setup-visible persisted values and saving toggle changes, while `SetupScreen` keeps explicit voice-selection persistence and `speech-service` keeps speech mute/verbosity persistence.
- Justification for simplicity:
  - Rejected approach 1: keep separate `speech-preference` and new `setup-preference` stores and synchronize them. That creates duplicate migration logic and introduces two sources of truth.
  - Rejected approach 2: persist setup toggles ad hoc from each component callback. That would spread merge/default logic across `useSetupForm`, `SetupScreen`, and `speech-service`.
  - Rejected approach 3: introduce a generic persistence framework or store registry just for this issue. The repo already has a simple per-module IndexedDB pattern that is enough here.
  - The chosen path keeps the change localized, follows current storage conventions, and puts migration/validation in one file instead of scattering it across UI code.
- Components to be modified/created:
  - Create: `src/lib/setup/setup-storage.ts`
  - Modify: `src/lib/persistence/indexed-db.ts`
  - Modify: `src/components/SetupScreen/useSetupForm.ts`
  - Modify: `src/components/SetupScreen/SetupScreen.tsx`
  - Modify: `src/lib/speech/speech-service.ts`
  - Modify: `src/lib/speech/index.ts`
  - Remove: `src/lib/speech/speech-storage.ts`
  - Create/update tests: `test/lib/setup/setup-storage.test.ts`, `test/components/SetupScreen/useSetupForm.browser.test.tsx`, `test/components/SetupScreen/SetupScreen.browser.test.tsx`, `test/lib/speech/speech-service.test.ts`, `test/lib/speech/speech-service.browser.test.tsx`, `test/lib/speech/utterance-cancellation.browser.test.tsx`, `test/current-match/indexed-db.browser.test.ts`
  - Plan document path: `/Users/trystan2k/Documents/Thiago/Repos/padelbuddy-web/docs/plans/PBW-86-setup-preferences-persistence.md`

## Implementation Steps

1. Lock the persistence contract and migration boundaries before touching code.
   - Persist only these business values in the new unified contract: `muted`, `verbosity`, `voiceName`, `audioAnnouncementsEnabled`, `servingIndicatorEnabled`, `countdownTimerEnabled`, `countdownTimerDuration`, `sideSwitchPrompts`, `gameMode`, and `decidingSetSuperTiebreak`.
   - Explicitly exclude all other setup fields from persistence: team names, match format, initial server, and any unrelated application settings.
   - Use the existing defaults already referenced by `useSetupForm.ts` and `@/core/match` as the fallback baseline: `defaultAudioAnnouncementsEnabled`, `defaultServingIndicatorEnabled`, `defaultCountdownTimerEnabled`, `defaultCountdownTimerDuration`, `sideSwitchPrompts: true`, `gameMode: 'advantage'` (via `defaultGameMode`), and `decidingSetSuperTiebreak: false`; keep current speech defaults for `muted`, `verbosity`, and `voiceName`.
   - Define the hydration rule up front: restore `voiceName` into setup form state only when `audioAnnouncementsEnabled` is `true`; otherwise retain the stored value in persistence but keep the in-form value `null`.
   - Why: this prevents scope creep and makes migration/default handling deterministic.
   - Risk/Mitigation: if product wants disabling audio to actively clear the stored voice instead of just hiding it in the form, stop and confirm before implementation because that changes the persistence contract.
2. Extend the shared IndexedDB bootstrap to add the new canonical store.
   - Modify `src/lib/persistence/indexed-db.ts` to add `setupPreferenceObjectStoreName = 'setup-preference'`, bump `persistenceDatabaseVersion` from 5 to 6, and add the new store to `sharedIndexedDbObjectStoreNames`.
   - Keep the legacy `speech-preference` identifier available only for migration reads; do not keep it in the shared creation list for fresh installs so new databases create only active stores.
   - Update any shared-store assertions that compare `sharedIndexedDbObjectStoreNames` so they reflect the new canonical setup store.
   - Why: the DB schema change must land before the new module can save or migrate data.
   - Risk/Mitigation: IndexedDB version upgrades are sticky in browsers. Validate both fresh-database and upgrade-path tests before merging. If upgrade behavior fails, revert the version bump within the branch rather than shipping a partially migrated schema.
3. Implement `src/lib/setup/setup-storage.ts` as the single persistence source of truth.
   - Follow the existing storage pattern used by locale and remote-controller persistence:
     - define a record key constant (`setup-preference`)
     - use `resolveIndexedDbStorageConfig(...)`
     - provide `IndexedDbOpenMessages`
     - expose `createSetupStorage()` with `save`, `load`, and `clear` behavior
     - export a singleton and convenience wrappers
   - Define `SetupPreferences` as the business preference shape requested by this issue. Keep `updatedAt` as storage metadata on the stored record rather than folding it into the new public preference type.
   - Add validation/normalization for all persisted fields:
     - `verbosity` must be in `verbosityLevels`
     - `voiceName` must be `string | null`
     - all toggles must be booleans
     - `countdownTimerDuration` must be one of the supported countdown durations
     - `gameMode` must be one of the valid `gameModes` values (`'advantage'` or `'golden-point'`)
     - `decidingSetSuperTiebreak` must be a boolean
   - Add slice-aware save/load helpers so speech-service can mutate speech fields without clobbering setup toggles, and setup-form/setup-screen can mutate setup-visible fields without clobbering speech preferences.
   - Implement backward compatibility inside this module:
     - first attempt to load `setup-preference`
     - if no new record exists, check whether the legacy `speech-preference` store/key exists
     - if legacy speech data is valid, merge it onto current setup defaults, persist the new unified record, and optionally clear the migrated legacy record after a successful write
     - if legacy data is invalid or missing, return `null`/defaults without migrating anything else
   - Why: merge, validation, and migration logic belong in one place, not in components.
4. Rewire Setup Screen hydration and toggle persistence around the new storage module.
   - Update `src/components/SetupScreen/useSetupForm.ts` to load from the unified setup storage on mount instead of loading only `voiceName` from speech storage.
   - Hydrate only the approved persisted setup fields into `formData`, leaving all non-persisted setup fields on their current defaults and translation-driven behavior.
   - Add a guarded persistence effect for the toggle slice so changes to `audioAnnouncementsEnabled`, `servingIndicatorEnabled`, `countdownTimerEnabled`, `countdownTimerDuration`, `sideSwitchPrompts`, `gameMode`, and `decidingSetSuperTiebreak` are written after initial hydration.
   - Use a hydration-ready ref/flag so the first render cannot overwrite stored data with defaults before the async load resolves.
   - Apply the Step 1 rule when hydrating `voiceName`: keep the stored voice in persistence, but only set `formData.voiceName` when audio announcements are enabled.
   - Why: `useSetupForm` is already the single owner of these setup values and is the lowest-risk place to restore/save them.
   - Risk/Mitigation: hydration-vs-save timing is the highest UI risk. Add explicit tests that stored data is loaded before any save effect runs.
5. Move voice and speech persistence onto the unified module without changing speech runtime behavior.
   - Update `src/components/SetupScreen/SetupScreen.tsx` so `handleVoiceSelectionAccept` uses the new setup-storage helper instead of the removed speech-storage module, while preserving the existing error handling/logging behavior.
   - Update `src/lib/speech/speech-service.ts` to import its load/save helpers from the new module and keep the current `initialize`, `setMuted`, and `setVerbosity` flows intact.
   - Update `src/lib/speech/index.ts` so it no longer re-exports from `./speech-storage`; either re-export the speech-facing storage helpers from the unified module or narrow the public surface if nothing still needs those exports after import cleanup.
   - Remove `src/lib/speech/speech-storage.ts` only after all imports, mocks, and tests stop referencing it.
   - Why: this completes the unification while keeping speech behavior changes out of scope.
   - Risk/Mitigation: avoid refactoring speech synthesis logic itself. Only change the persistence dependency and field-merging behavior.
6. Replace the old speech-storage test surface with setup-storage coverage and update dependent mocks.
   - Replace or rename `test/lib/speech/speech-storage.test.ts` to `test/lib/setup/setup-storage.test.ts` and extend it to cover:
     - save/load/clear on the new unified store
     - invalid `verbosity`, `voiceName`, and `countdownTimerDuration` handling
     - fresh databases creating the new shared object-store list
     - legacy `speech-preference` migration into `setup-preference` on first load
     - a pre-existing `setup-preference` record winning over legacy speech data so migration is not repeated
   - Update `test/components/SetupScreen/useSetupForm.browser.test.tsx` to verify:
     - initial hydration restores all approved persisted values
     - `sideSwitchPrompts`, `gameMode`, and `decidingSetSuperTiebreak` are included
     - `voiceName` is restored only when audio announcements are enabled
     - toggle changes call the new setup-save path after hydration
   - Update `test/components/SetupScreen/SetupScreen.browser.test.tsx` to cover the voice-selection save path against the unified storage module.
   - Update `test/lib/speech/speech-service.test.ts`, `test/lib/speech/speech-service.browser.test.tsx`, and `test/lib/speech/utterance-cancellation.browser.test.tsx` so their mocks point at `@/lib/setup/setup-storage` (or the updated speech barrel export) instead of the deleted file.
   - Update `test/current-match/indexed-db.browser.test.ts` shared-bootstrap coverage to use the new setup storage module and prove the shared database still works with current-match, locale, remote-controller, and unified setup preferences together.
7. Finish with regression validation and cleanup.
   - Run the targeted storage/setup/speech test files first, then run `pnpm complete-check`.
   - Manually validate the full user path in the browser:
     - choose a voice and change the approved setup toggles on Setup Screen
     - start a match
     - return to Setup Screen after the match
     - confirm only the approved values are restored
     - reload the page and confirm those values still survive
     - confirm unrelated setup fields still reset via the normal defaults
   - Remove dead imports or stale type references left behind by deleting `speech-storage.ts`, and ensure the only remaining legacy speech-store reference is the migration helper.
   - Why: this closes the loop on both acceptance criteria and cleanup scope.

## Validation

- Success criteria:
  - `setup-preference` is the new canonical client-only store for the approved setup/speech preferences, and the DB version is bumped to 6 with no backend/API changes.
  - The Setup Screen restores only the allowed fields: audio announcements, voice selection (only when audio is enabled), serving indicator, countdown enabled, countdown duration, side-switch prompts, game mode (Golden Point), and deciding-set super tiebreak.
  - Speech-service still loads/saves `muted`, `verbosity`, and `voiceName` through the unified module without overwriting setup-toggle values.
  - Legacy `speech-preference` data migrates forward on first load and does not break fresh installs or repeated loads.
  - Existing tests and mocks no longer depend on `src/lib/speech/speech-storage.ts`.
  - `pnpm complete-check` passes after implementation.
- Checkpoints:
  - Pre-implementation: confirm the persistence contract excludes all non-listed setup fields and that `voiceName` remains stored but only hydrates when audio announcements are enabled.
  - After Step 2: shared IndexedDB tests confirm version 6 bootstraps `setup-preference` and the updated shared store list.
  - After Step 3: setup-storage tests prove save/load/clear, validation, and legacy migration all work with both fresh and upgraded databases.
  - After Step 4: hook/browser tests prove setup hydration completes before the first save and that toggle updates persist the correct slice, including `sideSwitchPrompts`, `gameMode`, and `decidingSetSuperTiebreak`.
  - After Step 5: SetupScreen and speech-service tests prove voice saves and speech preference saves still work after removing `speech-storage.ts`.
  - After Step 7: manual navigate-away/reload verification plus `pnpm complete-check` confirm the user-visible flow is stable.
