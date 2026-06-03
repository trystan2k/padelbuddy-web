## Task Analysis

- Main objective:
  - Deliver PBW-113 by mirroring the active-match visual left/right order whenever a rules-based side switch is due, while keeping the change fully derived from existing match setup + replayed match state.
  - Scope: active match flow only. Mirror must apply to the two live team columns, per-team revert controls, serving highlight, `SetsCard`, and `SetsHistoryModal`.
  - Guardrails already locked by user:
    - no persistence schema/API change unless code proves impossible
    - no animation; swap snaps instantly
    - visible column is source of truth for touch interactions
    - mirrored layout persists after prompt dismissal and follows derived parity, not modal visibility
    - one current live visual mapping must be reused across older completed sets shown in summary/history
    - match-end screen unchanged
    - audio/toasts/non-visual team references remain bound to real team IDs
- Identified dependencies:
  - Core side-switch derivation:
    - `src/core/match/derived-state.ts`
    - `src/core/match/types.ts`
  - Active match presentation:
    - `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`
    - `src/components/ActiveMatchScreen/SetsCard/SetsCard.tsx`
    - `src/components/ActiveMatchScreen/SetsHistoryModal/SetsHistoryModal.tsx`
    - `src/components/ActiveMatchScreen/sets-history.ts`
    - `src/components/ActiveMatchScreen/TeamPanel/TeamPanel.tsx` (read-only dependency; behavior should be reused, not redesigned)
  - Relevant test coverage already in place:
    - `test/core/match/serve-derived-state.test.ts`
    - `test/components/ActiveMatchScreen/sets-history.test.ts`
    - `test/components/ActiveMatchScreen/SetsCard.browser.test.tsx`
    - `test/components/ActiveMatchScreen/SetsHistoryModal.browser.test.tsx`
    - `test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx`
    - `e2e/active-match.happy-path.spec.ts`
    - `e2e/persistence-recovery.edge-case.spec.ts`
    - `e2e/helpers/persistence.ts` (only if existing seeding cannot express mirrored resume state cleanly)
- System impact:
  - No persistence, router, speech-service, or match-end changes expected.
  - Small core-model expansion expected: add one derived mirror/parity signal to `MatchDerivedState`, then thread one resolved visual order through active-match UI.
  - No i18n copy change expected; existing labels can be reused with reordered values.
  - Important implementation nuance: mirror parity cannot be inferred from `sideSwitch.shouldPrompt` or from completed-set odd/even totals alone. Example: a 6-0 set has an even total game count but leaves players visually swapped because switches happened after games 1, 3, and 5.
  - Plan file: `/Users/trystan2k/Documents/Thiago/Repos/padelbuddy-web/docs/plan/Plan PBW-113 Mirror active match scoreboard when side switch is due.md`

## Chosen Approach

- Proposed solution:
  - Add one pure derived boolean in core match projection, e.g. `derived.isScoreboardMirrored`, computed from cumulative side-switch parity across the full replayed match state.
  - Reuse current side-switch timing rules by factoring shared helpers in `derived-state.ts`:
    - standard-game switch due at odd completed games; cumulative count = `Math.floor((completedGames + 1) / 2)`
    - tiebreak switch due every 6 played points; cumulative count = `Math.floor(pointsPlayed / 6)`
  - In `ActiveMatchScreen.tsx`, resolve one current visual order tuple from that boolean, e.g. `[leftTeamId, rightTeamId]`, and use it everywhere in the active-match UI.
  - Pass that same visual order into `SetsCard` and `SetsHistoryModal`, with tiny shared reorder helpers in `sets-history.ts`, so older completed sets are shown in current live visual order instead of historical per-set sides.
  - Keep prompt visibility state (`sideSwitchDismissed`) separate from mirror parity. Dismissing the prompt only closes the modal; it must not affect layout.
- Justification for simplicity:
  - Keeps source of truth in existing replay/derived-state pipeline. Undo, reload, and resume then work automatically from persisted actions without new storage.
  - Limits UI changes to active-match presentation files already responsible for left/right rendering.
  - Avoids coupling layout to prompt modal lifecycle, which would fail the persistence-after-dismiss requirement.
  - Avoids persisting a visual-side flag, which would be redundant and fragile.
  - Rejected approach 1: compute mirroring from `sideSwitch.shouldPrompt` or dismissed modal state in `ActiveMatchScreen`. Rejected because layout must persist between prompt moments and across reload.
  - Rejected approach 2: persist current visual side in IndexedDB/API. Rejected because user explicitly wants derived-only behavior and current replay model is enough.
  - Rejected approach 3: reconstruct historical left/right per completed set in summary/history. Rejected because user explicitly wants one current live mapping across the whole active-match UI.
- Components to be modified/created:
  - Core:
    - `src/core/match/types.ts` — add derived mirror flag type
    - `src/core/match/derived-state.ts` — compute cumulative side-switch parity and keep prompt logic on same helper math
  - Active-match UI:
    - `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx` — render columns from resolved visual order; keep remote/audio logic on real team IDs
    - `src/components/ActiveMatchScreen/sets-history.ts` — add tiny score-reordering helpers for current visual order
    - `src/components/ActiveMatchScreen/SetsCard/SetsCard.tsx` — accept visual order and render mirrored current-set summary/ARIA label
    - `src/components/ActiveMatchScreen/SetsHistoryModal/SetsHistoryModal.tsx` — accept visual order and render mirrored sets-won headline + row scores
  - Tests:
    - `test/core/match/serve-derived-state.test.ts`
    - `test/components/ActiveMatchScreen/sets-history.test.ts`
    - `test/components/ActiveMatchScreen/SetsCard.browser.test.tsx`
    - `test/components/ActiveMatchScreen/SetsHistoryModal.browser.test.tsx`
    - `test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx`
    - `e2e/active-match.happy-path.spec.ts`
    - `e2e/persistence-recovery.edge-case.spec.ts`
    - `e2e/helpers/persistence.ts` only if minimal seed overrides are needed

## Implementation Steps

1. Extend core derived state with cumulative mirror parity.
   - In `src/core/match/types.ts`, add one derived field for layout parity, preferably `isScoreboardMirrored: boolean`.
   - In `src/core/match/derived-state.ts`, factor small shared helpers for:
     - standard side-switch due/count
     - tiebreak side-switch due/count
     - cumulative match-wide side-switch count across completed sets plus active set
   - Compute mirror parity from total switch count `% 2 === 1`, gated by `setup.sideSwitchPrompts` so disabled prompts keep the current fixed layout.
   - Keep `getSideSwitchState()` using the same helper math; do not fork separate rules.
   - File-by-file test update:
     - extend `test/core/match/serve-derived-state.test.ts` with cases for odd-game parity, 6-point tiebreak parity, cross-set accumulation, 6-0/7-5 style boundary behavior, disabled-prompts false path, and replay/undo recomputation via shorter action lists.
   - Risk note:
     - Biggest correctness risk lives here. If parity math is wrong, every screen stays wrong after reload. Mitigation: lock formulas with explicit tests before wiring UI.

2. Resolve one visual team order in `ActiveMatchScreen` and thread it through all active-match presentation.
   - In `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`, derive one tuple from the new boolean, e.g. `[leftTeamId, rightTeamId]`, then render both team columns from that order instead of hardcoding team 1 left / team 2 right.
   - Keep `TeamPanel` props tied to the real team being rendered in each column so scoring, revert, and serving highlight all move together automatically.
   - Keep `useMatchAnnouncements`, keyboard shortcuts, media-button remote actions, toasts, and other non-visual references on real underlying team IDs. Only visible touch targets change side.
   - Pass the resolved visual order into:
     - `src/components/ActiveMatchScreen/SetsCard/SetsCard.tsx`
     - `src/components/ActiveMatchScreen/SetsHistoryModal/SetsHistoryModal.tsx`
   - In `src/components/ActiveMatchScreen/sets-history.ts`, add tiny helpers that reorder:
     - current set display score
     - sets-won headline score
     - completed set summary row parts
       using the same current visual order tuple.
   - Keep CSS untouched unless a hidden nth-child/layout assumption appears; current modules look symmetric enough to prefer no style churn.
   - Risk note:
     - Existing stable test IDs are keyed by real team IDs (`team-panel-team-1`, `revert-button-team-2`). Keep those IDs stable and change only DOM order. That minimizes selector churn and preserves non-visual semantics.

3. Update browser + Playwright coverage around mirrored interactions, summary/history order, and resume behavior.
   - `test/components/ActiveMatchScreen/SetsCard.browser.test.tsx`
     - add mirrored-order case so current set score/accessible label flips with visual order.
   - `test/components/ActiveMatchScreen/SetsHistoryModal.browser.test.tsx`
     - add mirrored-order case so overall sets headline and completed rows follow current visual order, not historical team-1/team-2 order.
   - `test/components/ActiveMatchScreen/sets-history.test.ts`
     - add focused unit tests for any new reorder helpers.
   - `test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx`
     - add/adjust integration tests for:
       - odd-game mirror after first due switch
       - prompt dismissal does not unmirror layout
       - left visible column scores the team currently shown on the left
       - left visible revert undoes that same underlying team
       - serving highlight moves with the mirrored column
       - speech payload stays bound to real team IDs after mirrored scoring
       - tiebreak 6-point mirror parity and undo recomputation
   - `e2e/active-match.happy-path.spec.ts`
     - update side-switch-enabled flow to assert mirrored active-match UI after first game, including `SetsCard` order and persistence after dismissing the prompt.
   - `e2e/persistence-recovery.edge-case.spec.ts`
     - add mirrored resume/reload scenario with side-switch prompts enabled so a persisted in-progress record resumes into the correct mirrored layout and stays correct after reload.
   - `e2e/helpers/persistence.ts`
     - only if needed, add minimal optional setup/action overrides so the persistence spec can seed an odd-game or tiebreak mirror state without duplicating IndexedDB write logic.
   - Rollback note:
     - If generic Playwright seed-helper expansion starts growing, stop and keep the new seed logic local to `persistence-recovery.edge-case.spec.ts`. Do not over-abstract test seeding for one scenario.

## Validation

- Success criteria:
  - Active-match team columns mirror instantly and only when `sideSwitchPrompts` is enabled.
  - Mirror parity is derived purely from replayed match state; no persistence schema/API change is introduced.
  - Standard-play parity matches cumulative odd-game switches across the full match, including set boundaries.
  - Tiebreak parity flips every 6 points and accumulates across the match.
  - Dismissing the side-switch prompt does not affect layout.
  - Left visible touch targets score/undo the team currently shown on the left; same for right side.
  - `SetsCard` and `SetsHistoryModal` use the same current live visual order, including older completed sets.
  - Undo, reload, and resume recompute the correct layout from persisted setup/actions.
  - Match-end screen behavior stays unchanged.
  - Audio announcements and other non-visual team references remain tied to real team IDs.
- Checkpoints:
  - Pre-implementation assumptions check:
    - grep active-match files for any remaining hardcoded team-1-left/team-2-right rendering outside `ActiveMatchScreen`, `SetsCard`, and `SetsHistoryModal`
    - confirm side-switch-disabled flows remain intentionally unchanged
  - After Step 1:
    - `test/core/match/serve-derived-state.test.ts` passes with explicit parity coverage, especially 6-0 and tiebreak interval edge cases
    - no persistence or router files touched
  - After Step 2:
    - browser tests prove DOM order swap, mirrored summary/history order, and visible-column interaction mapping
    - no i18n diff and no match-end diff
  - After Step 3:
    - Playwright proves mirrored layout in real browser flow after side-switch prompt and after resume/reload
    - targeted suites pass before full QA:
      - `pnpm vitest test/core/match/serve-derived-state.test.ts`
      - `pnpm vitest test/components/ActiveMatchScreen/sets-history.test.ts`
      - `pnpm vitest test/components/ActiveMatchScreen/SetsCard.browser.test.tsx`
      - `pnpm vitest test/components/ActiveMatchScreen/SetsHistoryModal.browser.test.tsx`
      - `pnpm vitest test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx`
      - `pnpm playwright test e2e/active-match.happy-path.spec.ts e2e/persistence-recovery.edge-case.spec.ts`
    - final regression gate: `pnpm complete-check`
