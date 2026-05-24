## Task Analysis

- Main objective: Add a configurable super tiebreak target with options `7 / 9 / 11` and default `11`, then carry that value through setup validation, scoring, setup persistence, and reload/new-match flows without breaking current defaults, win-by-2 behavior, or legacy stored data.
- Identified dependencies:
  - `PBW-104` foundation: `src/core/match/types.ts`, `src/core/match/guards.ts`, `src/core/match/validation.ts`, `src/lib/current-match/persistence.ts`, `test/core/match/setup-validation.test.ts`, `test/current-match/persistence.test.ts`, `test/core/match/test-helpers.ts`
  - `PBW-105` scoring engine: `src/core/match/engine.ts`, `src/core/match/replay.ts`, `test/core/match/tiebreak-rules.test.ts`, `test/core/match/replay-determinism.test.ts`, `test/core/match/serve-derived-state.test.ts`
  - `PBW-106` setup persistence: `src/lib/setup/setup-storage.ts`, `src/components/SetupScreen/useSetupForm.ts`, `test/lib/setup/setup-storage.test.ts`, `test/components/SetupScreen/useSetupForm.browser.test.tsx`
  - `PBW-107` setup UI: `src/components/SetupScreen/SetupScreen.tsx`, `src/components/SetupScreen/SetupScreen.module.css`, `src/components/SetupScreen/types.ts`, `src/lib/i18n/locales/{en,es,pt}.ts`, `test/components/SetupScreen/SetupScreen.browser.test.tsx`, `e2e/helpers/match-flow.ts`, `e2e/setup-screen.happy-path.spec.ts`
  - `PBW-108` regression/edge cases: `e2e/tiebreaks.edge-case.spec.ts` plus any browser/unit coverage that proves persistence, legacy hydration, and best-of-1 ignore rules
- System impact:
  - Match setup contract grows by one normalized field for the selected super tiebreak target; standard 6-6 tiebreak behavior stays fixed at 7.
  - Existing `setup-preference` records and previously saved current-match records are highest compatibility risk, because a newly required field would otherwise make old records fail hydration/replay.
  - Setup persistence already exists, so simplest path is record-shape extension only; no new store or IndexedDB schema change should be needed unless implementation uncovers a hard blocker.
  - User-facing setup/help copy that currently says fixed “to 10 points” becomes stale and should be updated to configurable wording in the same pass.
  - Assumptions made: child issues `PBW-104` through `PBW-108` are not implemented yet on this branch; no new Pencil screen is required; current `decidingSetSuperTiebreak` boolean remains the UI source of truth for best-of-1 deciding behavior.
  - Main risks: invalidating legacy preference records by requiring the new field too early, breaking reload of older current-match payloads, and accidentally coupling target persistence to the toggle so disabling super tiebreak erases the stored value.

## Chosen Approach

- Proposed solution: Extend the existing setup pipeline instead of inventing new state layers: add a typed `superTiebreakTargetPoints` value with default `11`, normalize missing legacy values to `11` in validators/parsers, thread that normalized value into the scoring engine, persist it alongside `format` in setup preferences, and add a radio-group UI that reuses the existing countdown-duration interaction pattern and design tokens.
- Justification for simplicity:
  - Recommended approach: keep one source of truth per layer — validation normalizes, engine consumes normalized setup, setup-storage persists preferences, UI only edits form state.
  - Rejected approach 1: add a separate best-of-1-only deciding-mode preference/control model. Too much duplicated logic because the repo already uses `decidingSetSuperTiebreak` to drive that decision.
  - Rejected approach 2: introduce a generic “rule config” abstraction or strategy object for tiebreak variants. Overkill for one numeric target and harder to align with current deterministic reducer pattern.
  - Rejected approach 3: bump IndexedDB/current-match schemas immediately and force migration everywhere. Higher risk than simply backfilling missing values at parse time.
- Components to be modified/created:
  - Core match contract: `src/core/match/types.ts`, `src/core/match/guards.ts`, `src/core/match/validation.ts`
  - Core scoring flow: `src/core/match/engine.ts`, `src/core/match/replay.ts`
  - Current-match compatibility: `src/lib/current-match/persistence.ts`
  - Setup persistence: `src/lib/setup/setup-storage.ts`, `src/components/SetupScreen/useSetupForm.ts`
  - Setup UI + styling: `src/components/SetupScreen/SetupScreen.tsx`, `src/components/SetupScreen/SetupScreen.module.css`, `src/components/SetupScreen/types.ts`
  - User-facing copy: `src/lib/i18n/locales/en.ts`, `src/lib/i18n/locales/es.ts`, `src/lib/i18n/locales/pt.ts`
  - Test helpers / E2E helpers: `test/core/match/test-helpers.ts`, `e2e/helpers/match-flow.ts`, `e2e/helpers/persistence.ts`
  - Main verification files: `test/core/match/setup-validation.test.ts`, `test/core/match/tiebreak-rules.test.ts`, `test/core/match/replay-determinism.test.ts`, `test/lib/setup/setup-storage.test.ts`, `test/components/SetupScreen/useSetupForm.browser.test.tsx`, `test/components/SetupScreen/SetupScreen.browser.test.tsx`, `test/current-match/persistence.test.ts`, `e2e/tiebreaks.edge-case.spec.ts`, `e2e/setup-screen.happy-path.spec.ts`

## Implementation Steps

1. `PBW-104` — extend the typed setup contract first.
   - Add the super tiebreak target option list (`7 / 9 / 11`), exported default (`11`), and a guard/helper for validating that value.
   - Extend `MatchSetupInput` / `MatchSetup` with the normalized target field, then update `validateMatchSetup` so new inputs are validated while legacy/missing values are backfilled to `11` where compatibility requires it.
   - Update `src/lib/current-match/persistence.ts` to inject the default target when older saved setup payloads do not contain the new field, so reload/resume keeps working without a schema bump.
   - Refresh shared test builders (`test/core/match/test-helpers.ts`, `e2e/helpers/persistence.ts`) so new setup creation paths compile and default consistently.
   - Risk/mitigation: if this step starts invalidating old records, stop and fix parser normalization before touching engine/UI.
2. `PBW-105` — replace the fixed super-tiebreak target in the scoring engine.
   - Remove the hardcoded “10-point super tiebreak” assumption from `src/core/match/engine.ts` and create deciding-set / best-of-1 super-tiebreak game state from the validated setup target instead.
   - Keep standard set tiebreak entry and target unchanged at `7`; keep win-by-2 logic exactly as-is.
   - Verify continue/replay paths still behave deterministically when prior deciding sets used 7, 9, or 11.
   - Rollback note: if engine changes spill into serving/derived-state logic, keep the change scoped to target creation and completion thresholds only.
3. `PBW-106` — extend setup preference persistence without changing the database shape.
   - Add `format` and `superTiebreakTargetPoints` to `SetupPreferences`, the default preference object, slice merge/equality logic, and hydration/persist flows in `useSetupForm`.
   - Update `parseStoredSetupPreferences` so older records missing the new keys normalize to `format: 'best-of-3'` and `superTiebreakTargetPoints: 11` instead of returning `null` and silently dropping the user’s other saved preferences.
   - Persist the target independently from the super-tiebreak toggle so turning the toggle off never erases the previously selected 7/9/11 value.
   - Checkpoint in this step: no IndexedDB version bump unless testing proves normalization cannot preserve existing records.
4. `PBW-107` — add the setup control and wire match-start payload creation.
   - Reuse the existing countdown-duration radio-group pattern in `SetupScreen.tsx` / `.module.css` for the new target selector so keyboard semantics, disabled styling, and token usage stay consistent with current UI.
   - Keep the existing super-tiebreak toggle as the behavioral switch; when off, disable or visually dim the target control but retain the selected value in form state.
   - Persist and hydrate `format` so the user returns to the last selected match format; for best-of-1 full-set mode, continue ignoring the stored target when building deciding behavior, but still preserve the target in preferences for future super-tiebreak use.
   - Update `handleStartMatch` so the setup input always carries the selected target and still maps best-of-1 toggle-on to `bestOfOneDecidingBehavior: 'super-tiebreak'`.
   - Update locale strings from fixed “to 10 points” wording to configurable wording in all supported languages.
5. `PBW-108` — close with regression coverage and end-to-end verification.
   - Add/adjust unit tests for validation defaults, engine thresholds (`7`, `9`, `11`), win-by-2 preservation, best-of-1 full-set ignore behavior, and current-match legacy record decoding.
   - Add/adjust browser tests for setup hydration/persistence of `format` and `superTiebreakTargetPoints`, plus UI behavior when the toggle is disabled and re-enabled.
   - Update Playwright helpers/specs so setup automation can select the target radio and edge-case tiebreak flows can assert 9-point and 11-point finishes, not only the current 10-point path.
   - Run targeted suites first, then `pnpm complete-check` as final QA gate.

## Validation

- Success criteria:
  - Setup UI exposes exactly `7`, `9`, and `11` as super tiebreak target choices, defaulting to `11`.
  - All super-tiebreak match flows — deciding sets and best-of-1 super-tiebreak deciders — use the selected target while preserving win-by-2.
  - Standard 6-6 set tiebreaks remain first to `7`, win by `2`.
  - Match format, best-of-1 deciding behavior (through the existing toggle-driven flow), and super tiebreak target persist across new matches and reloads.
  - Existing users with no saved preferences still get current defaults; existing saved setup/current-match data without the new field still hydrate/replay successfully via default `11`.
  - Disabling super tiebreak does not erase the stored target, and best-of-1 full-set mode ignores that stored target during match bootstrap.
  - `pnpm complete-check` passes.
- Checkpoints:
  - Pre-implementation assumptions check: confirm field naming (`superTiebreakTargetPoints` or equivalent), default `11`, and no separate best-of-1 preference field unless PBW-104 reveals a real contradiction.
  - After Step 1: `test/core/match/setup-validation.test.ts` and `test/current-match/persistence.test.ts` prove missing-target legacy payloads normalize to `11` instead of failing.
  - After Step 2: `test/core/match/tiebreak-rules.test.ts` and `test/core/match/replay-determinism.test.ts` prove `7/9/11` super-tiebreak targets finish correctly with win-by-2 while standard-tiebreak coverage stays green.
  - After Step 3: `test/lib/setup/setup-storage.test.ts` and `test/components/SetupScreen/useSetupForm.browser.test.tsx` prove persisted `format` and `superTiebreakTargetPoints` hydrate/save correctly and old records keep other preferences.
  - After Step 4: `test/components/SetupScreen/SetupScreen.browser.test.tsx` proves radio accessibility, disabled-state retention, and correct start-match wiring.
  - After Step 5: targeted Playwright tiebreak/persistence flows pass, then `pnpm complete-check` passes. If any compatibility regression appears, prefer parser/default fixes over schema/version bumps.
