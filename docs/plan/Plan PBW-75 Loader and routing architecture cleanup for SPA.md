## Task Analysis

- Main objective: Redesign the SPA bootstrap and route architecture so i18n no longer blocks first paint, home/match loaders return pure serializable data, current-match routes use loaders only for entry validation and redirects, live session state stays in component-owned flow hooks, route pending UI matches the speed of local persistence, and regression coverage protects the new routing contract.
- Identified dependencies:
  - `PBW-76` unlocks the whole stream by removing the current root-level i18n blocker in `src/routes/__root.tsx` and `src/lib/i18n/i18n.ts`.
  - `PBW-77` depends on `PBW-76` and converts home startup from component-owned async hydration into a loader-owned serializable contract.
  - `PBW-81` also depends on `PBW-76` and should centralize the duplicated IndexedDB bootstrap helpers before more routing cleanup bakes those duplicates in deeper.
  - `PBW-78` depends on `PBW-77` and moves active/finish entry validation and redirects into loader-time decisions.
  - `PBW-79` depends on `PBW-78` and formalizes route freshness, invalidation, and preload behavior for imperative flows.
  - `PBW-80` depends on `PBW-78` and `PBW-79` because pending UX should only be tuned after loader ownership and cache behavior are stable.
  - `PBW-82` closes the parent issue by codifying the new bootstrap/routing contract in focused unit, browser, and integration coverage and by running `pnpm complete-check`.
- System impact:
  - Root bootstrap: `src/routes/__root.tsx`, `src/router.tsx`, `src/routes/RootDocument.module.css`, `src/routes/-route-utils.tsx`.
  - i18n: `src/lib/i18n/i18n.ts`, `src/lib/i18n/index.ts`, `src/lib/i18n/locale-storage.ts`, and a new bundled resource module under `src/lib/i18n/`.
  - Current-match startup and route-entry logic: `src/routes/index.tsx`, `src/routes/match.$id.tsx`, `src/routes/match.finish.$id.tsx`, `src/routes/-match-route-state.ts`, `src/components/CurrentMatchStartupGate/CurrentMatchStartupGate.tsx`, `src/lib/current-match/startup.ts`, `src/lib/current-match/index.ts`.
  - Persistence utilities: `src/lib/current-match/indexed-db.ts`, `src/lib/i18n/locale-storage.ts`, `src/lib/speech/speech-storage.ts`, plus a new shared persistence helper module.
  - Imperative navigation flows: `src/components/SetupScreen/SetupScreen.tsx`, `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`, `src/components/MatchEndScreen/MatchEndScreen.tsx`, and the startup gate.
  - Tests: `test/routes/**`, `test/current-match/**`, `test/components/**`, `test/lib/i18n/**`, `test/lib/speech/**`, `test/integration/app-flow.browser.test.tsx`, `test/router.test.tsx`, and `test/setup/browser.ts`.

## Chosen Approach

- Proposed solution: Use a loader-first entry architecture with a synchronous-first root shell. Concretely: (1) initialize i18n from a bundled default locale resource so the root document can render immediately, then reconcile persisted non-default locale selection without blocking startup; (2) introduce a pure home-startup loader contract that returns only serializable states such as `ready`, `resume-required`, `corrupt`, and notice/search metadata; (3) move active/finish route validation and redirects into loader helpers that either return validated persisted records or redirect before the route component renders; (4) keep live match mutation ownership inside `useMatchSession`/`createCurrentMatchSession`, not in loaders; (5) formalize route freshness and preload behavior around the three persistence-backed routes (`/`, `/match/$id`, `/match/finish/$id`); and (6) replace the current double pending treatment (route-level full-page pending + root overlay) with a lighter SPA-appropriate continuity signal.
- Justification for simplicity:
  - Chosen approach: loader-first validation + local screen-owned live state. This fixes the real problems with the least architecture churn because it keeps the existing `current-match` session model and route structure, but moves validation/redirect work into the place TanStack Router expects it.
  - Rejected approach 1: introduce a global routing/bootstrap store (Zustand/context reducer) that owns current match, locale, pending, and redirects. This would over-centralize concerns, duplicate TanStack Router state, and make the loader serializability goal harder rather than easier.
  - Rejected approach 2: keep component-owned async bootstrap and only tune `pendingMs`/pending UI. This would reduce flash symptoms but would leave impure home startup contracts, redirect-in-effect race conditions, and stale route ownership unresolved.
  - Rejected approach 3: push all live match state back into route loaders and router cache. This conflicts with the requirement that active flows stay outside loader ownership and would create unnecessary invalidation pressure on every local mutation.
  - Brainstorming outcomes applied here: the critical edge cases are non-default locale reloads, one-time reset notices being consumed exactly once, deep links to active/finish routes after local mutations, home-route cache staleness after persisted changes, and double pending UI during fast local transitions. The chosen plan addresses each with the smallest viable architectural shift.
- Components to be modified/created:
  - I18n bootstrap: `src/lib/i18n/i18n.ts`, `src/lib/i18n/index.ts`, new `src/lib/i18n/resources.ts` (or equivalent), and locale resource files moved or copied into `src/lib/i18n/locales/*` so the default locale can be imported into the bundle.
  - Root/router shell: `src/routes/__root.tsx`, `src/router.tsx`, `src/routes/RootDocument.module.css`, `src/routes/-route-utils.tsx`.
  - Home startup contract: `src/routes/index.tsx`, new route-adjacent startup helper such as `src/routes/-home-startup.ts`, `src/components/CurrentMatchStartupGate/CurrentMatchStartupGate.tsx`, `src/lib/current-match/startup.ts`, `src/lib/current-match/index.ts`.
  - Match entry validation: `src/routes/match.$id.tsx`, `src/routes/match.finish.$id.tsx`, `src/routes/-match-route-state.ts` (or a renamed route-entry helper if a clearer split emerges).
  - Persistence centralization: new `src/lib/persistence/indexed-db.ts` (or equivalent shared helper), refactors in `src/lib/current-match/indexed-db.ts`, `src/lib/i18n/locale-storage.ts`, and `src/lib/speech/speech-storage.ts`.
  - Imperative navigation flow cleanup: `src/components/SetupScreen/SetupScreen.tsx`, `src/components/CurrentMatchStartupGate/CurrentMatchStartupGate.tsx`, `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`, `src/components/MatchEndScreen/MatchEndScreen.tsx`.
  - Regression coverage: `test/routes/__root.test.tsx`, `test/routes/index.test.tsx`, `test/routes/match.$id.browser.test.tsx`, `test/routes/match.finish.$id.browser.test.tsx`, `test/current-match/startup.test.ts`, `test/current-match/CurrentMatchStartupGate.browser.test.tsx`, `test/current-match/startup-gate-state.test.ts`, `test/current-match/indexed-db.browser.test.ts`, `test/lib/i18n/locale-storage.test.ts`, `test/lib/speech/speech-storage.test.ts`, `test/components/MatchEndScreen/MatchEndScreen.browser.test.tsx`, `test/integration/app-flow.browser.test.tsx`, `test/router.test.tsx`, and `test/setup/browser.ts`.

## Implementation Steps

1. **PBW-76 — Bundle default locale and remove i18n bootstrap blocking**
   - **Target files**: `src/lib/i18n/i18n.ts`, `src/lib/i18n/index.ts`, new `src/lib/i18n/resources.ts` (or `src/lib/i18n/locales/*`), `src/routes/__root.tsx`, `test/routes/__root.test.tsx`, `test/setup/browser.ts`, `test/components/ui/LocaleSelector/LocaleSelector.browser.test.tsx`, and optionally a new focused `test/lib/i18n/i18n.test.ts`.
   - **Planned changes**:
     - Replace the current `i18next-http-backend` startup dependency with a module-based resource loader where English is synchronously bundled and non-default locales are added on demand.
     - Remove the `i18nReady` full-page gate from `RootDocument` so the app shell renders immediately on first paint.
     - Keep locale persistence behavior, but stop awaiting IndexedDB inside the root bootstrap path. Initial startup should use bundled English immediately, then reconcile a saved non-default locale after mount without blocking shell render.
     - Keep `changeLocale()` as the single public mutation API so `LocaleSelector` and any tests do not need a broad surface rewrite.
     - Update the browser test setup so it imports bundled English translations directly instead of fetching `/locales/en.json` from the public folder.
   - **Test approach**:
     - Add or update tests proving the root route renders shell markup immediately on cold render.
     - Add i18n-focused tests proving default locale initializes without network I/O, saved locale changes are still applied, and locale selection persists across reloads.
     - Re-run existing `LocaleSelector` tests to confirm no regression to the user-facing locale switcher.
   - **Integration points**:
     - This step must leave the public `changeLocale`, `getCurrentLocale`, and `initializeI18n` surface stable enough for `PBW-77` and the existing test harness.
     - If locale resource files move from `public/` to `src/lib/i18n/`, update test imports and any static asset assumptions in one pass to avoid a half-migrated resource layout.
   - **Risk / rollback note**:
     - Main risk: non-default locale users may see a brief English-first paint before their persisted locale is applied. Mitigate by shipping the simpler bundled-English-first architecture first, then add a synchronous preference hint only if manual QA shows the flash is materially disruptive.
   - **Commit boundary**: create a dedicated `PBW-76` commit after focused i18n/root tests pass.

2. **PBW-77 — Refactor home startup loader to return pure serializable state**
   - **Target files**: `src/routes/index.tsx`, new route helper such as `src/routes/-home-startup.ts`, `src/components/CurrentMatchStartupGate/CurrentMatchStartupGate.tsx`, `src/lib/current-match/startup.ts`, `src/lib/current-match/index.ts`, `test/current-match/startup.test.ts`, `test/current-match/startup-gate-state.test.ts`, `test/current-match/CurrentMatchStartupGate.browser.test.tsx`, `test/routes/index.test.tsx`, and `test/integration/app-flow.browser.test.tsx`.
   - **Planned changes**:
     - Introduce a home-route loader that resolves startup into a fully serializable contract: `ready`, `resume-required`, `corrupt`, and explicit notice/search metadata. Do not return `CurrentMatchSession` instances or any runtime-only objects.
     - Rewrite `src/lib/current-match/startup.ts` so it produces pure route data instead of constructing sessions during startup hydration.
     - Convert `CurrentMatchStartupGate` from an internal async hydrator into a controlled UI/controller that receives loader data as props and owns only ephemeral user-interaction state (`isClearing`, local error messages, dismiss state).
     - Preserve the current behaviors: notice visibility, resume-required prompt, corrupt reset flow, ready/no-match pass-through, and home-search error toast handling.
     - Remove the existing component-local startup loading branch once loader data owns initial state resolution.
   - **Test approach**:
     - Add unit tests for the new pure startup resolver covering `resume-required`, `corrupt`, `ready`, and reset-notice consumption.
     - Update browser tests so the gate is exercised as a pure UI over provided loader data and so home-route behavior no longer depends on a component-level async mount effect.
     - Extend integration coverage so invalid route redirects still land on home with the correct notice/toast behavior after the new loader contract is introduced.
   - **Integration points**:
     - Keep the existing `CurrentMatchStartupGate` filename and export unless a rename materially improves clarity; this minimizes churn for tests and imports.
     - Coordinate with `PBW-79`: the new home loader will introduce cache semantics, so the loader helper should be built in a way that can later accept explicit stale/invalidation rules without another contract rewrite.
   - **Risk / rollback note**:
     - Main risk: the one-time reset notice could be consumed too early if the loader contract is rebuilt on every render. Mitigate by centralizing notice consumption in a single pure helper and locking it with unit coverage before wiring it into the route.
   - **Commit boundary**: create a dedicated `PBW-77` commit after the new startup contract and related tests pass.

3. **PBW-81 — Consolidate persistence bootstrap utilities**
   - **Target files**: new `src/lib/persistence/indexed-db.ts` (or equivalent), `src/lib/current-match/indexed-db.ts`, `src/lib/i18n/locale-storage.ts`, `src/lib/speech/speech-storage.ts`, `test/current-match/indexed-db.browser.test.ts`, `test/lib/i18n/locale-storage.test.ts`, `test/lib/speech/speech-storage.test.ts`, and optionally a new focused shared-helper test.
   - **Planned changes**:
     - Extract the duplicated IndexedDB bootstrap logic into one shared helper: database name/version constants, object-store registration, open/close lifecycle, transaction/request waiting, and blocked/error handling.
     - Preserve the thin domain APIs (`loadCurrentMatch`, `saveCurrentMatch`, `clearCurrentMatch`, `loadLocalePreference`, `saveSpeechPreferences`, etc.) so this refactor does not ripple into route or component code.
     - Make the object-store list and version coordination explicit in one place so future schema/store changes do not require editing three separate modules with hard-coded sibling store names.
     - Prefer a small shared helper rather than a generic repository abstraction; keep all domain-specific encoding/decoding logic in the existing current-match / i18n / speech modules.
   - **Test approach**:
     - Re-run all current-match, locale-storage, and speech-storage tests.
     - Add at least one cross-module test proving that opening the shared database through one module still leaves the other stores available when another module opens it later.
     - Verify no object-store creation order regression by keeping or adding coverage for “store already exists” paths.
   - **Integration points**:
     - This step should be merged before `PBW-78` so the new loader helpers depend on the centralized persistence bootstrap, not on duplicated copy-pasted helpers.
     - Keep the database name/version stable unless there is a proven need to bump the version; avoid combining this cleanup with schema changes.
   - **Risk / rollback note**:
     - Main risk: accidentally changing upgrade behavior and breaking existing persisted records. Mitigate by preserving current store names, preserving the existing version unless a shared registry truly requires a bump, and using browser tests with a real IndexedDB lifecycle before finalizing the refactor.
   - **Commit boundary**: create a dedicated `PBW-81` commit after refactor-focused storage tests pass.

4. **PBW-78 — Clarify current-match route loader ownership and remove legacy paths**
   - **Target files**: `src/routes/match.$id.tsx`, `src/routes/match.finish.$id.tsx`, `src/routes/-match-route-state.ts`, possibly a renamed helper such as `src/routes/-match-route-entry.ts`, `src/routes/-route-utils.tsx`, `test/routes/match.$id.browser.test.tsx`, `test/routes/match.finish.$id.browser.test.tsx`, and `test/integration/app-flow.browser.test.tsx`.
   - **Planned changes**:
     - Move the active/finish route redirect matrix out of component `useEffect` blocks and into loader-time helpers that either return validated persisted records or redirect before render.
     - Constrain loader responsibility to: read persisted current-match data, validate that the route `id` matches persistence, classify active-vs-finish route entry, and redirect with the same home-search error contract when needed.
     - Keep `ActiveMatchScreen` and `MatchEndScreen` focused on rendering + local mutations. They should receive already-validated route data and should no longer need route-entry loading placeholders to cover redirect work.
     - Remove obsolete helpers/branches that only exist because startup or redirect logic used to happen in components (for example, any legacy state unions that only support loading-before-effect-redirect behavior).
     - Preserve deep-link correctness for direct visits to `/match/$id` and `/match/finish/$id` when the persisted record is valid, missing, corrupt, mismatched, or on the wrong lifecycle screen.
   - **Test approach**:
     - Add or update route-entry tests to cover the full matrix: valid active, valid finish, no match, reset-required, corrupt record, mismatched route id, completed match opened on active route, and in-progress match opened on finish route.
     - Update integration tests so route redirects are asserted through loader behavior rather than post-render effect navigation.
     - Add focused tests for any new pure route-entry helper to keep redirect mapping easy to reason about without mounting a full component tree.
   - **Integration points**:
     - This step should leave `ActiveMatchScreen`’s live session ownership untouched; the goal is to clean route entry, not to move score mutations into router cache.
     - Keep the home-search error values (`invalid-match`, `no-match`, `corrupt`) stable so home-route notice/toast handling from `PBW-77` remains compatible.
   - **Risk / rollback note**:
     - Main risk: introducing redirect loops or changing which route owns the “completed vs in-progress” decision. Mitigate by expressing the entry matrix in one pure helper with exhaustive tests before simplifying the route components.
   - **Commit boundary**: create a dedicated `PBW-78` commit after active/finish loader tests and route integration tests pass.

5. **PBW-79 — Define router invalidation and preload strategy for imperative match flows**
   - **Target files**: `src/router.tsx`, `src/routes/index.tsx`, `src/routes/match.$id.tsx`, `src/routes/match.finish.$id.tsx`, `src/components/SetupScreen/SetupScreen.tsx`, `src/components/CurrentMatchStartupGate/CurrentMatchStartupGate.tsx`, `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`, `src/components/MatchEndScreen/MatchEndScreen.tsx`, and optionally a tiny helper such as `src/lib/router/current-match-route-flow.ts`.
   - **Planned changes**:
     - Write down and implement a freshness matrix for the three persistence-backed routes (`/`, `/match/$id`, `/match/finish/$id`): when they should always re-read persistence, when cached data is acceptable, and which transitions should proactively refresh the next route.
     - Replace the current ad hoc `router.clearCache(...)` usage in `MatchEndScreen` with the agreed strategy. The simplest likely end state is to make persistence-backed route loaders effectively fresh-on-entry and use targeted preloading only for the few imperative navigations that immediately follow a write (`start match`, `resume`, `continue match`, and possibly active-to-finish completion).
     - Review current router defaults (`defaultPreload: 'intent'`) and keep them only where they help. Imperative navigations are not link-intent driven, so their preload behavior must be explicit rather than assumed.
     - If TanStack Router API details force a small wrapper around invalidate/preload calls, keep it very small and route-specific so components do not accumulate router-cache logic inline.
   - **Test approach**:
     - Extend `test/router.test.tsx` to assert the new router defaults or route-level freshness settings.
     - Update `MatchEndScreen` tests so they validate the new invalidation/preload behavior instead of the current one-off `clearCache` call.
     - Add or extend integration tests for start/resume/continue flows to prove the next route reads fresh persisted data and never reuses stale current-match entry data.
   - **Integration points**:
     - This step should be implemented after `PBW-78` so loader ownership is already stable; otherwise cache rules will be defined around code that is about to be deleted.
     - Keep the strategy narrow to persistence-backed routes. There is no need to introduce global router invalidation patterns for the whole app.
   - **Risk / rollback note**:
     - Main risk: either under-invalidating (stale route data) or over-invalidating (extra loader churn and new pending flashes). Mitigate by starting with route-specific freshness rules for `/`, `/match/$id`, and `/match/finish/$id` only and validating them against the existing imperative flows before broadening scope.
   - **Commit boundary**: create a dedicated `PBW-79` commit after route freshness behavior is documented in code and flow tests pass.

6. **PBW-80 — Tune router pending thresholds and replace heavy route pending UI**
   - **Target files**: `src/router.tsx`, `src/routes/__root.tsx`, `src/routes/-route-utils.tsx`, `src/routes/RootDocument.module.css`, and the current-match route files if `pendingComponent` definitions are removed or replaced.
   - **Planned changes**:
     - Review TanStack Router pending timing defaults and set explicit SPA-friendly thresholds (start from a short non-zero threshold such as ~150–200 ms and a minimal pending minimum duration, then adjust only if tests/manual review show a better fit).
     - Remove or dramatically reduce the current double pending treatment for match routes: today the router can show both a full-page `RouteLoadingState` and the root-level floating pending notice. The target state should preserve continuity, not swap in a second heavy screen for local IndexedDB work.
     - Keep root bootstrap and route pending visually distinct. After `PBW-76`, root bootstrap should either disappear entirely or remain a rare full-page shell state; route pending should stay a lighter in-context indicator instead of another “status page.”
     - Prefer the root overlay or another subtle continuity treatment over route-level full-screen pending for the local-only match routes unless a genuinely slow path still needs a stronger fallback.
   - **Test approach**:
     - Extend router tests to assert the explicit pending timing configuration.
     - Add one practical pending-UX test using a controlled delayed loader or deferred promise so the UI can prove “no flash on common fast transitions” and “indicator appears when a delay exceeds the threshold.”
     - Keep assertions stable by using fake timers or a deterministic deferred helper rather than relying on real wall-clock timing.
   - **Integration points**:
     - Do this only after `PBW-79`; otherwise stale-cache cleanup and pending cleanup will get mixed together and make regressions harder to diagnose.
     - Preserve the existing error-state components. This issue is about pending weight and continuity, not about changing the established error-recovery design.
   - **Risk / rollback note**:
     - Main risk: masking legitimate longer waits by making pending UI too subtle. Mitigate by threshold tuning plus one explicit delayed-loader test so the indicator still appears when the app truly waits.
   - **Commit boundary**: create a dedicated `PBW-80` commit after pending-UX tests and manual transition checks pass.

7. **PBW-82 — Add regression coverage for bootstrap, routing, invalidation, and pending UX**
   - **Target files**: the updated test files from the earlier steps plus any new focused route-loader or pending harness tests needed to cover gaps.
   - **Planned changes**:
     - Add the missing focused regression suites that lock the final architecture: bootstrap no longer blocks on i18n, home startup states are loader-owned and serializable, active/finish entry validation redirects happen before render, current-match route freshness avoids stale data after imperative mutations, and pending UI behaves like a fast local SPA.
     - Keep the split consistent with current project conventions: pure logic in unit tests, real IndexedDB behavior in browser tests, and flow-level behavior in `test/integration/app-flow.browser.test.tsx`.
     - Run focused test subsets after each sub-issue commit, then finish with the full `pnpm complete-check` gate once all earlier steps are merged.
   - **Test approach**:
     - Bootstrap coverage: root route + i18n initialization tests.
     - Startup coverage: pure startup resolver tests + browser gate/home route tests.
     - Entry/redirect coverage: active/finish route loader matrix tests.
     - Invalidation coverage: start/resume/continue/new-match flows and any targeted router-cache helper tests.
     - Pending coverage: router config test + one practical delayed-loader browser test.
   - **Integration points**:
     - This step should not introduce new production architecture; it should only encode the behavior already delivered in `PBW-76` through `PBW-80`.
     - Keep test helper additions reusable so future routing work can extend them rather than duplicating route harness setup again.
   - **Risk / rollback note**:
     - Main risk: coverage work turns into architecture rework because gaps are found late. Mitigate by running focused tests at each earlier commit boundary so `PBW-82` mainly consolidates and fills small holes rather than discovering foundational bugs for the first time.
   - **Commit boundary**: create a dedicated `PBW-82` commit only after the full suite, including `pnpm complete-check`, passes.

## Validation

- Success criteria:
  - Root bootstrap renders immediately without awaiting async locale resource loading or IndexedDB locale preference reads.
  - The default locale is bundled, non-default locales still load correctly when selected, and locale preference persists across reloads.
  - Home startup state is delivered through a pure serializable loader contract with preserved `resume-required`, `corrupt`, `ready`, and no-match behavior and explicit notice handling.
  - Active and finish routes use loaders only for entry validation and redirects, and deep-link entry behavior remains correct for valid, missing, corrupt, mismatched, and wrong-screen cases.
  - Live match mutation ownership remains inside the active/finish screen flow logic, not inside route loaders or global router cache state.
  - Router freshness/preload behavior is explicit enough that local persistence mutations never produce stale current-match route data.
  - Pending UI no longer flashes a heavy loader on common local-only transitions and is visually distinct from any remaining bootstrap state.
  - Each sub-issue is independently testable and commit-ready, and the final integrated implementation passes `pnpm complete-check`.
- Checkpoints:
  - **Pre-implementation assumptions check**: confirm the implementation will not introduce a new global state store, will keep current-match live mutation ownership inside `useMatchSession`/`createCurrentMatchSession`, and will preserve the existing home-search error contract (`invalid-match`, `no-match`, `corrupt`).
  - **After Step 1 / PBW-76**: verify `src/routes/__root.tsx` no longer blocks on `initializeI18n()`, root tests no longer depend on an app-init loading screen, locale switching still works, and commit `PBW-76` in isolation. Rollback note: if moving locale resources into `src/lib/i18n/` causes too much churn, keep file paths stable temporarily and only introduce a bundled English resource module first.
  - **After Step 2 / PBW-77**: verify the home route exposes a loader-owned serializable startup contract, `CurrentMatchStartupGate` no longer performs initial async hydration on mount, startup notice consumption is deterministic, and commit `PBW-77` in isolation.
  - **After Step 3 / PBW-81**: verify all persistence modules share one IndexedDB bootstrap helper, cross-module store creation still works regardless of open order, existing storage tests remain green, and commit `PBW-81` in isolation. Rollback note: if a shared helper starts leaking domain-specific abstractions, stop at a smaller shared “database bootstrap + transaction helpers” layer.
  - **After Step 4 / PBW-78**: verify active/finish redirects happen in loaders, route components are render-only for ready states, deep-link matrix tests are green, and commit `PBW-78` in isolation. Rollback note: if redirect behavior becomes harder to reason about, keep one pure route-entry helper per route mode instead of forcing an over-generic shared resolver.
  - **After Step 5 / PBW-79**: verify the route freshness matrix is encoded in code, stale current-match data cannot be reproduced in start/resume/continue flows, the old ad hoc invalidation path is removed or clearly superseded, and commit `PBW-79` in isolation.
  - **After Step 6 / PBW-80**: verify route pending no longer flashes a full-page loader on common fast transitions, delayed transitions still surface a visible indicator, bootstrap and route-pending treatments are distinct, and commit `PBW-80` in isolation. Rollback note: if the new pending thresholds hide legitimate slow states, keep the thresholds explicit but restore a slightly stronger indicator rather than bringing back the current double-loader stack.
  - **After Step 7 / PBW-82**: verify regression coverage exists for bootstrap, startup states, active/finish redirects, invalidation/freshness, and pending UX; then run `pnpm complete-check` and only create the final `PBW-82` commit once the full integrated set passes.
  - **Plan file path**: `/Users/trystan2k/Documents/Thiago/Repos/padelbuddy-web/docs/plan/Plan PBW-75 Loader and routing architecture cleanup for SPA.md`
