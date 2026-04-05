## Task Analysis

- Main objective:
  - Replace the legacy Playwright suite in `e2e/` with a new release-readiness suite that covers the full happy path (`setup -> active match -> match end -> continue/reset`), the named critical edge cases, responsive-only viewport coverage, and artifact generation for screenshots/videos.
- Identified dependencies:
  - Playwright runtime and scripts in `playwright.config.ts` and `package.json`.
  - Existing shared fixture pattern in `e2e/fixtures.ts`.
  - Route and component behavior in `src/routes/index.tsx`, `src/routes/match.$id.tsx`, `src/routes/match.finish.$id.tsx`, `src/components/SetupScreen/SetupScreen.tsx`, `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`, `src/components/MatchEndScreen/MatchEndScreen.tsx`, and `src/components/CurrentMatchStartupGate/CurrentMatchStartupGate.tsx`.
  - IndexedDB persistence constants and startup behavior in `src/lib/current-match/indexed-db.ts`, `src/lib/current-match/persistence.ts`, and `src/lib/current-match/startup.ts`.
  - CI artifact upload and branch gating in `.github/workflows/ci.yml`.
  - Existing `.gitignore` already ignores `playwright-report/`, so the required screenshot directory can live under that tree without a new ignore rule.
- System impact:
  - Retire the current spec files by renaming them with a `.skip` suffix.
  - Expand the shared fixture so screenshots are captured once per test and browser state is cleaned deterministically.
  - Add a thin E2E helper layer for current-match seeding, repetitive scoring flows, and responsive viewport definitions.
  - Adjust Playwright output locations so HTML report, JSON results, videos/traces, and final screenshots all land under `playwright-report/`.
  - Keep the existing CI scope restriction to `main` / release branches, but ensure the uploaded artifact always includes the new screenshots directory.

## Chosen Approach

- Proposed solution:
  - Keep the current lightweight fixture-based Playwright architecture and replace the specs with a small, explicit structure:
    - renamed legacy specs for archival (`*.spec.skip.ts`)
    - one shared fixture (`e2e/fixtures.ts`)
    - a minimal helper layer (`e2e/helpers/*.ts`)
    - three focused happy-path spec files
    - one separate spec file per edge-case family
    - one dedicated responsive spec file that loops the required viewport catalog.
- Justification for simplicity:
  - This reuses the repo’s current testing pattern (fixture + local helpers + accessible locators) instead of introducing page objects or a custom reporter.
  - It avoids an overengineered Playwright project matrix. Non-responsive tests stay on the current default browser projects; only the dedicated responsive spec iterates the required viewport list.
  - Artifact capture is centralized in the fixture, so every test gets the same screenshot/video behavior without duplicated `page.screenshot()` calls in each file.
  - Persistence-heavy scenarios reuse the already-established IndexedDB constants and startup behaviors instead of inventing parallel mock infrastructure.
- Components to be modified/created:
  - Rename existing specs:
    - `e2e/setup-screen.spec.ts` -> `e2e/setup-screen.spec.skip.ts`
    - `e2e/match-end-screen.spec.ts` -> `e2e/match-end-screen.spec.skip.ts`
    - `e2e/match-continue-flow.spec.ts` -> `e2e/match-continue-flow.spec.skip.ts`
    - `e2e/responsive-orientation.spec.ts` -> `e2e/responsive-orientation.spec.skip.ts`
  - Modify:
    - `playwright.config.ts`
    - `e2e/fixtures.ts`
    - `.github/workflows/ci.yml`
  - Create:
    - `e2e/helpers/match-flow.ts`
    - `e2e/helpers/persistence.ts`
    - `e2e/helpers/viewports.ts`
    - `e2e/setup-screen.happy-path.spec.ts`
    - `e2e/active-match.happy-path.spec.ts`
    - `e2e/match-end.happy-path.spec.ts`
    - `e2e/advantage-deuce.edge-case.spec.ts`
    - `e2e/golden-point.edge-case.spec.ts`
    - `e2e/tiebreaks.edge-case.spec.ts`
    - `e2e/undo.edge-case.spec.ts`
    - `e2e/persistence-recovery.edge-case.spec.ts`
    - `e2e/responsive-layout.spec.ts`

## Implementation Steps

1. Retire the legacy specs before adding new coverage.
   - Rename the four current `*.spec.ts` files to `*.spec.skip.ts` so they stop running without losing history.
   - Keep `e2e/fixtures.ts` as the suite entry point and extend it rather than replacing it.
   - Pre-implementation assumption check: confirm the current app routes, persistence layer, and startup gate already behave as expected by running the relevant unit/browser tests before rebuilding the E2E layer.

2. Rework `playwright.config.ts` so all generated artifacts land under `playwright-report/` safely.
   - Keep `testDir`, `webServer`, retries, workers, and the current `chromium` / `webkit` projects unless a later validation step proves they are the source of instability.
   - Change reporter/output paths to avoid HTML generation wiping manually saved screenshots:
     - HTML report -> `playwright-report/html`
     - JSON report -> `playwright-report/results.json`
     - Playwright output dir -> `playwright-report/test-results`
   - Change `use` defaults to support the new artifact strategy:
     - `video: 'on'` so every test records a full run
     - `screenshot: 'off'` because the fixture will take one intentional final screenshot per test
     - keep `trace: 'on-first-retry'` for failure debugging
   - Rollback / mitigation note: if artifact size becomes too large in CI, the first rollback lever is to keep videos `on` in CI and downgrade to `retain-on-failure` locally only, but do not do this in the first implementation pass.

3. Expand `e2e/fixtures.ts` into a stable shared fixture instead of repeating setup in every spec.
   - Preserve the existing `addInitScript()` behavior that hides the debug PWA overlay.
   - Add deterministic browser-state cleanup both before and after each test:
     - clear `localStorage`
     - clear `sessionStorage`
     - delete the current-match IndexedDB database
   - Add one centralized final screenshot hook that runs after `await use(page)` and saves to `playwright-report/screenshots/<project-name>/<sanitized-test-name>.png`.
   - Attach the saved screenshot to `testInfo` so it is visible from the HTML report.
   - Keep the fixture thin: no page object abstraction, no test branching logic, only environment preparation and artifact capture.
   - Rollback / mitigation note: wrap screenshot capture in `try/finally` so cleanup still happens even if a page crash or navigation failure prevents screenshot creation.

4. Add a minimal helper layer under `e2e/helpers/`.
   - `e2e/helpers/persistence.ts`
     - Reuse `defaultDatabaseName`, `defaultDatabaseVersion`, and `currentMatchSchemaVersion` from source.
     - Provide helpers to seed:
       - a completed match record
       - an in-progress match record
       - an invalid/corrupt record
       - a schema-mismatch/reset-required record
     - Provide a helper to verify that `current-match` has been cleared after `New Match` / discard/reset flows.
   - `e2e/helpers/match-flow.ts`
     - Provide small reusable helpers for repetitive UI actions only:
       - `gotoSetupScreen()`
       - `startMatch()`
       - `clickNTimes()`
       - `winQuickGame()` / `winQuickSet()` wrappers using UI clicks
       - `dismissSideSwitchPromptIfVisible()`
       - `assertNoHorizontalOverflow()`
     - Keep helpers action-focused and avoid embedding assertions unrelated to the helper’s purpose.
   - `e2e/helpers/viewports.ts`
     - Export the exact required viewport catalog:
       - iPhone SE `375x667`
       - iPhone 15 `390x844`
       - iPhone 17 Pro Max `430x932`
       - iPad `768x1024`
       - iPad Air `820x1180`
       - iPad Pro `1024x1366`
       - MacBook Pro 14 `1512x982`
     - Export a small utility that marks each viewport as portrait or landscape so the responsive assertions stay declarative.

5. Implement the three happy-path spec files with tags on the `describe` block titles so every nested test is filterable.
   - `e2e/setup-screen.happy-path.spec.ts`
     - `@happy-path @setup` describe block.
     - Cover, in 2-3 focused tests:
       - initial render and baseline controls
       - team-name editing, format selection, first-server selection, toggle behavior, countdown duration, and locale switching
       - validation when names are empty
       - successful `Start Match` navigation
       - locale/toggle persistence after reload when that behavior is already part of the setup form persistence flow.
   - `e2e/active-match.happy-path.spec.ts`
     - `@happy-path @active-match` describe block.
     - Split coverage into two tests rather than one giant scenario:
       - score point flow + game completion + set-card updates + side-switch prompt appearance/dismissal
       - full match completion flow that reaches `/match/finish/:id` and proves match auto-completion works cleanly.
     - Use helpers to reduce click noise, but keep all important assertions user-visible (`score`, `set rows`, `prompt`, `URL`).
   - `e2e/match-end.happy-path.spec.ts`
     - `@happy-path @match-end` describe block.
     - Seed a completed match through IndexedDB and cover:
       - summary / stats / winner rendering
       - `New Match` resetting persistence and returning to `/`
       - `Continue` reopening the active route with the preserved score and the match still playable.

6. Implement the edge-case suite with one spec file per edge-case family.
   - `e2e/advantage-deuce.edge-case.spec.ts`
     - `@edge-case @active-match` describe block.
     - Start an advantage-mode match and verify:
       - `40-40` deuce state is reached
       - advantage flips to the scoring side (`ad` / `40`)
       - the opponent can bring the game back to deuce
       - the game only closes after a two-point advantage sequence.
   - `e2e/golden-point.edge-case.spec.ts`
     - `@edge-case @active-match` describe block.
     - Start with golden point enabled and verify that after `40-40`, the very next point wins the game directly with no advantage state.
   - `e2e/tiebreaks.edge-case.spec.ts`
     - `@edge-case @active-match @match-end` describe block.
     - Use two tests in this file:
       - standard set tiebreak at `6-6`, asserting numeric point display and final `7-6` set score
       - deciding-set super tiebreak in best-of-3, asserting numeric race-to-10 scoring and correct completion behavior.
   - `e2e/undo.edge-case.spec.ts`
     - `@edge-case @active-match` describe block.
     - Verify both undo buttons enable only after scoring and that undo can safely rewind across an important boundary (for example, reverting a just-completed game so the set score returns from `1-0` to `0-0`).
   - `e2e/persistence-recovery.edge-case.spec.ts`
     - `@edge-case @setup @active-match @match-end` describe block.
     - Cover the startup persistence-recovery flows already implemented in the app:
       - in-progress record -> resume/discard dialog on `/`
       - corrupt or reset-required record -> recovery UI / one-time notice -> reset/continue path
       - reload after recovery should not re-show the same stale prompt.
   - Risk / mitigation note: persistence-recovery tests are the most brittle because they depend on exact IndexedDB payloads; mitigate by centralizing all record builders in `e2e/helpers/persistence.ts` and importing source constants instead of hardcoding schema/version values.

7. Implement the responsive-only spec without expanding the whole suite’s viewport matrix.
   - Create `e2e/responsive-layout.spec.ts` with a `@responsive` describe block.
   - Inside this file only, iterate the exported viewport catalog and create parameterized tests per viewport.
   - Keep the responsive coverage focused on behaviors that actually vary by viewport:
     - setup screen renders without horizontal overflow and key controls remain visible
     - active match shows the rotate-device blocker for portrait court-side viewports
     - active match shows the scoreboard instead of the blocker for the landscape desktop viewport.
   - This satisfies the “responsive-only tests run on all viewports” requirement while leaving the rest of the suite on the default viewport only.

8. Update `.github/workflows/ci.yml` without changing the current branch scope.
   - Keep the existing `e2e_tests` job condition restricted to `main` / release branches exactly as it is today.
   - Keep the Playwright report upload step on `if: always() && !cancelled()`.
   - Because the new HTML report, screenshots, videos, traces, and JSON results will all live under `playwright-report/`, keep the artifact upload path as `playwright-report/` so success and failure runs both include screenshots automatically.
   - Only add an extra artifact step if validation proves the raw videos are not reachable from the uploaded report tree; otherwise, avoid redundant uploads.

9. Validate the finished suite in increasing scope and stop at the first failing layer.
   - Fast structural checks:
     - `pnpm test:e2e --list`
     - verify only the new specs are listed
     - verify tags are visible in test titles
   - Targeted runs:
     - run each happy-path spec individually
     - run each edge-case spec individually
     - run the responsive spec individually
   - Full suite:
     - `pnpm test:e2e`
     - confirm screenshots exist in `playwright-report/screenshots/`
     - confirm videos/traces exist under `playwright-report/test-results/`
     - confirm the HTML report still opens from `playwright-report/html`
   - Final regression pass:
     - `pnpm complete-check`
   - Rollback / mitigation note: if the full suite is stable locally but too slow in CI, the first optimization should be reducing redundant setup inside specs, not broadening parallelism or rewriting the structure.

## Validation

- Success criteria:
  - Existing runnable specs in `e2e/` are retired (`.skip`) so only the new suite executes.
  - Happy-path coverage exists for setup, active match, match completion, continue, and reset flows.
  - Edge-case coverage exists in separate files for advantage/deuce, golden point, tiebreaks, undo, and persistence recovery.
  - Responsive-only coverage iterates the exact seven required viewport sizes without forcing the rest of the suite onto that matrix.
  - Every test produces one final screenshot saved under `playwright-report/screenshots/`.
  - Every test records video for the full run.
  - CI still runs E2E only on `main` / release branches and uploads the `playwright-report/` artifact on success and failure.
  - Tags are consistently applied so the suite can be filtered by `@happy-path`, `@edge-case`, `@setup`, `@active-match`, `@match-end`, and `@responsive`.
- Checkpoints:
  - Checkpoint 1 — legacy retirement:
    - `pnpm test:e2e --list` no longer shows the archived specs.
  - Checkpoint 2 — config/artifacts:
    - a single sample spec produces:
      - `playwright-report/html/`
      - `playwright-report/results.json`
      - `playwright-report/test-results/`
      - `playwright-report/screenshots/`
  - Checkpoint 3 — happy paths:
    - each of the three happy-path spec files passes independently and the match-end file verifies both continue and reset.
  - Checkpoint 4 — edge cases:
    - each edge-case file passes independently and uses no arbitrary timeouts.
  - Checkpoint 5 — responsive matrix:
    - the responsive file covers all seven viewports and only that file changes viewport size intentionally.
  - Checkpoint 6 — release readiness:
    - `pnpm test:e2e` passes end-to-end
    - `pnpm complete-check` passes
    - CI artifact contents include screenshots on both passing and failing runs.
