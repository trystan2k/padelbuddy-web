# Plan: PBW-68 - Code Review and Improvements

## Overview

Scanned the active codebase, `design-tokens/`, and existing tests to build this plan from actual repository findings rather than assumptions. Linear dependency check showed **no issue relations** for `PBW-68` (`linear issue relation list PBW-68` returned `No relations`). Item 9 is intentionally excluded because it is already complete.

High-confidence scan summary:

- **31 pure re-export barrel files** were confirmed in `src/`.
- **Hardcoded UI-facing strings** remain in a focused set of screens/components, especially accessibility labels, debug UI, fallback team names, and route metadata.
- **Duplicated CSS** is concentrated in overlays, screen-reader-only helpers, modal shells, notice cards, and the Toast styles.
- **Duplicated code** is concentrated in the Toast viewport renderer, route error rendering, and route loader/redirect scaffolding.
- **Inline styles** were reduced already; only **one runtime `style=` usage** remains.
- **Template-literal `className`** usage is down to **one confirmed occurrence**.
- **Hardcoded design values** are concentrated in the spinner illustration, modal/overlay sizing, letter-spacing values, a few SVG/runtime values, and route metadata.

Design-token inventory reviewed before planning:

- `design-tokens/base/color.tokens.json`
- `design-tokens/base/space.tokens.json`
- `design-tokens/base/dimension.tokens.json`
- `design-tokens/base/radius.tokens.json`
- `design-tokens/base/font.tokens.json`
- `design-tokens/semantic/color.tokens.json`
- `design-tokens/semantic/typography.tokens.json`
- `design-tokens/component/button.tokens.json`
- `design-tokens/component/card.tokens.json`
- `design-tokens/component/chip.tokens.json`
- `design-tokens/component/toggle.tokens.json`
- `design-tokens/app/screen.tokens.json`
- `design-tokens/app/scoreboard.tokens.json`
- `design-tokens/style-dictionary.config.json`

Recommended commit cadence for this issue: **8 commits total, one per item, with user review before each commit**.

## Architecture Review (Item 1)

### Current architecture assessment

**Strengths confirmed in the current codebase**

- The match domain is already separated into a strong pure-core layer under `src/core/match/` (`engine.ts`, `derived-state.ts`, `replay.ts`, `validation.ts`) with broad test coverage under `test/core/match/*`.
- Route orchestration is reasonably isolated via `src/routes/*`, `src/lib/router/current-match-route-flow.ts`, and `src/lib/current-match/*`.
- Design tokens are already wired globally through `src/styles.css:7` importing `design-tokens/dist/variables.css`, so most CSS Modules already have a token path available.
- The repo has meaningful browser/component coverage for the screens and shared primitives that this issue will touch, especially:
  - `test/components/SetupScreen/*`
  - `test/components/ActiveMatchScreen/*`
  - `test/components/MatchEndScreen/*`
  - `test/components/ui/*`
  - `test/routes/*`
  - `test/current-match/*`
  - `test/lib/i18n/*`

**Architecture risks / cleanup hotspots confirmed by scan**

- **Barrel sprawl**: 31 barrel files in `src/` create broad import surfaces and make it harder to see real dependencies.
- **Very large orchestration-heavy files** are carrying both behavior and view responsibilities:
  - `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx` — 647 lines
  - `src/components/SetupScreen/SetupScreen.tsx` — 580 lines
  - `src/components/MatchEndScreen/MatchEndScreen.tsx` — 428 lines
  - `src/components/SetupScreen/useSetupForm.ts` — 319 lines
  - `src/components/MatchEndScreen/useMatchEndShare.ts` — 257 lines
  - `src/lib/speech/speech-service.ts` — 617 lines
  - `src/lib/setup/setup-storage.ts` — 492 lines
- **Cross-cutting UI infrastructure duplication** exists in both styles and code:
  - duplicated Toast renderer and Toast styles
  - duplicated route error UI
  - duplicated overlay/modal/screen-reader utilities
- **i18n is mostly present but not enforced at the edges**. Missing keys are currently hidden by `defaultValue` usage or hardcoded accessibility/debug strings.
- **Token usage is mostly good in CSS Modules, but not complete**. A small group of components still hardcode colors/sizes directly, especially SVG-heavy components and debug/overlay surfaces.

**Recommendation for Item 1 deliverable**

- Keep Item 1 as a documentation-first checkpoint. The implementation commit should create a durable architecture/code-review artifact summarizing:
  - strengths worth preserving
  - the exact cleanup scope approved for PBW-68
  - why only certain duplicates should be abstracted
  - a risk register for the later commits
- The artifact should live alongside project docs, ideally as `docs/development-logs/Task PBW-68 Code Review and Improvements.md`, with this plan kept as the execution source of truth.

## Item-by-Item Implementation

### Item 1: Architecture Review

#### Findings

Files and docs reviewed for the architecture assessment:

- `ARCHITECTURE.md:3-168`
- `src/styles.css:7` — global token import
- `src/core/match/engine.ts`, `src/core/match/derived-state.ts`, `src/core/match/replay.ts`, `src/core/match/validation.ts`
- `src/lib/current-match/session.ts`
- `src/lib/router/current-match-route-flow.ts`
- `src/routes/-match-route-state.ts`
- `src/routes/__root.tsx:26-74`
- Large screen/orchestration files identified during scan:
  - `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx` (647 lines)
  - `src/components/SetupScreen/SetupScreen.tsx` (580 lines)
  - `src/components/MatchEndScreen/MatchEndScreen.tsx` (428 lines)
  - `src/components/SetupScreen/useSetupForm.ts` (319 lines)
  - `src/components/MatchEndScreen/useMatchEndShare.ts` (257 lines)
- Existing coverage confirming safe cleanup surface:
  - `test/components/SetupScreen/*`
  - `test/components/ActiveMatchScreen/*`
  - `test/components/MatchEndScreen/*`
  - `test/components/ui/*`
  - `test/routes/*`
  - `test/current-match/*`
  - `test/lib/i18n/*`

Primary review conclusions:

- Keep the current **pure domain + route orchestration + CSS Modules + token variables** shape.
- Focus PBW-68 on **dependency surface cleanup**, **duplication removal**, **i18n completion**, and **token alignment**.
- Avoid introducing new global stores or large component hierarchy rewrites in this issue.

#### Changes

- Create and commit a documented architecture/code-review artifact in `docs/development-logs/Task PBW-68 Code Review and Improvements.md`.
- Include:
  - confirmed strengths to preserve
  - exact cleanup targets by item
  - risk notes for barrel removal and token migration
  - explicit non-goals for PBW-68 (no scoring-engine rewrite, no new global state, no token-system redesign)
- Keep this implementation plan in `docs/plans/PBW-68-code-review-and-improvements.md` as the execution reference.

#### Risk: Low

Documentation-only, but it should be treated as the approval gate for the subsequent seven commits.

#### Test impact

- No production runtime impact expected.
- Optional validation only: `pnpm complete-check` after the doc commit is still useful to ensure no incidental file changes slipped in.

### Item 2: Remove Barrel Files

#### Findings

**All confirmed pure re-export barrel files in `src/`**

- `src/components/ActiveMatchScreen/InfoCard/index.ts`
- `src/components/ActiveMatchScreen/SetsCard/index.ts`
- `src/components/ActiveMatchScreen/SideSwitchPrompt/index.ts`
- `src/components/ActiveMatchScreen/TeamPanel/index.ts`
- `src/components/ActiveMatchScreen/index.ts`
- `src/components/DebugPwa/index.ts`
- `src/components/Layout/index.ts`
- `src/components/MatchEndScreen/index.ts`
- `src/components/PadelCourtSpinner/index.ts`
- `src/components/SetupScreen/index.ts`
- `src/components/ShareScreen/index.ts`
- `src/components/ui/Button/index.ts`
- `src/components/ui/Card/index.ts`
- `src/components/ui/Chip/index.ts`
- `src/components/ui/Divider/index.ts`
- `src/components/ui/LocaleSelector/index.ts`
- `src/components/ui/RotateDeviceBlocker/index.ts`
- `src/components/ui/SectionLabel/index.ts`
- `src/components/ui/Spinner/index.ts`
- `src/components/ui/TextInput/index.ts`
- `src/components/ui/Toast/index.ts`
- `src/components/ui/Toggle/index.ts`
- `src/components/ui/TopBar/index.ts`
- `src/components/ui/index.ts`
- `src/core/match/index.ts`
- `src/lib/current-match/index.ts`
- `src/lib/i18n/index.ts`
- `src/lib/input/index.ts`
- `src/lib/orientation/index.ts`
- `src/lib/pwa/index.ts`
- `src/lib/speech/index.ts`

**Production imports that currently depend on those barrels**

- `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx:6,7,13,15,26,28,30-32`
- `src/components/ActiveMatchScreen/InfoCard/InfoCard.tsx:3`
- `src/components/ActiveMatchScreen/SetsCard/SetsCard.tsx:3-4`
- `src/components/ActiveMatchScreen/SideSwitchPrompt/SideSwitchPrompt.tsx:5`
- `src/components/ActiveMatchScreen/TeamPanel/TeamPanel.tsx:6`
- `src/components/ActiveMatchScreen/useMatchSession.ts:7-8`
- `src/components/ActiveMatchScreen/useMatchTimer.ts:3`
- `src/components/CurrentMatchStartupGate/CurrentMatchStartupGate.tsx:6,11`
- `src/components/DebugPwa/DebugPwa.tsx:10`
- `src/components/MatchEndScreen/MatchEndScreen.tsx:6-10,12`
- `src/components/MatchEndScreen/MatchStatsCard.tsx:3`
- `src/components/MatchEndScreen/MatchSummaryCard.tsx:3-4`
- `src/components/MatchEndScreen/WinnerCard.tsx:3-5`
- `src/components/MatchEndScreen/view-model.ts:7`
- `src/components/SetupScreen/RemoteConfigurationModal.tsx:7-8,20`
- `src/components/SetupScreen/SetupScreen.tsx:11-16,22-30`
- `src/components/SetupScreen/VoiceSelectionModal.tsx:7-8,17`
- `src/components/SetupScreen/types.ts:1`
- `src/components/SetupScreen/useSetupForm.ts:16`
- `src/components/SetupScreen/validateSetupForm.ts:1`
- `src/components/ShareScreen/ShareScreen.tsx:3`
- `src/components/ui/LocaleSelector/LocaleSelector.tsx:4,12`
- `src/components/ui/index.ts:8-20` (barrel depending on more barrels)
- `src/lib/current-match/helpers.ts:1`
- `src/lib/current-match/persistence.ts:15`
- `src/lib/current-match/session.ts:9`
- `src/lib/input/use-input-handler.tsx:5`
- `src/lib/setup/setup-storage.ts:11`
- `src/lib/speech/types.ts:1`
- `src/routes/-home-startup.ts:5`
- `src/routes/-match-route-state.ts:1-2`
- `src/routes/-route-utils.tsx:4`
- `src/routes/__root.tsx:15,17-19,24`
- `src/routes/index.tsx:5,7`
- `src/routes/match.$id.tsx:3-4`
- `src/routes/match.finish.$id.tsx:3-5`

**Test imports that currently depend on barrels**

- `test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx:9`
- `test/components/ActiveMatchScreen/SetsCard.browser.test.tsx:9`
- `test/components/ActiveMatchScreen/useMatchSession.browser.test.tsx:10`
- `test/components/ActiveMatchScreen/useMatchTimer.browser.test.tsx:7`
- `test/components/MatchEndScreen/MatchEndScreen.browser.test.tsx:7-8`
- `test/components/MatchEndScreen/view-model.test.ts:3-4`
- `test/components/SetupScreen/SetupScreen.browser.test.tsx:7`
- `test/components/ShareScreen/ShareScreen.browser.test.tsx:3`
- `test/components/ui/LocaleSelector/LocaleSelector.browser.test.tsx:6-8`
- `test/components/ui/Spinner/Spinner.browser.test.tsx:6`
- `test/components/ui/Toast/Toast.browser.test.tsx:7`
- `test/core/match/match.test.ts:11`
- `test/core/match/replay-determinism.test.ts:3`
- `test/core/match/scoring-core.test.ts:3`
- `test/core/match/serve-derived-state.test.ts:9`
- `test/core/match/setup-validation.test.ts:3`
- `test/core/match/test-helpers.ts:7`
- `test/core/match/tiebreak-rules.test.ts:3`
- `test/current-match/CurrentMatchStartupGate.browser.test.tsx:31`
- `test/current-match/indexed-db.browser.test.ts:9-11`
- `test/current-match/indexed-db.test.ts:8`
- `test/current-match/persistence.test.ts:3,10`
- `test/current-match/session.test.ts:3,10`
- `test/current-match/startup-gate-state.test.ts:8`
- `test/current-match/startup.test.ts:6`
- `test/input/debounce.test.ts:3`
- `test/input/keyboard-aliases.test.ts:9`
- `test/input/regression.test.ts:3,5-6`
- `test/input/remote-controller-storage.test.ts:7`
- `test/input/use-input-handler.browser.test.tsx:7-8`
- `test/input/wake-lock.browser.test.tsx:6`
- `test/integration/app-flow.browser.test.tsx:8-9,16`
- `test/lib/i18n/i18n.test.ts:10`
- `test/lib/i18n/locale-storage.test.ts:3`
- `test/lib/speech/message-generator.test.ts:3`
- `test/lib/speech/speech-service.browser.test.tsx:4`
- `test/lib/speech/utterance-cancellation.browser.test.tsx:4`
- `test/routes/__root.test.tsx:3`
- `test/routes/match-route-state.test.ts:3`
- `test/routes/match.$id.browser.test.tsx:41`
- `test/routes/match.finish.$id.browser.test.tsx:41`
- `test/routes/route-utils.test.tsx:4`
- `test/setup/browser.ts:5`

#### Changes

- Replace every barrel-based import with direct module imports before deleting the barrels.
- Convert broad imports first:
  - `@/components/ui` → direct component paths
  - `@/core/match` → direct imports from `types.ts`, `engine.ts`, `derived-state.ts`, `replay.ts`, or `validation.ts` as needed
  - `@/lib/current-match`, `@/lib/i18n`, `@/lib/input`, `@/lib/pwa`, `@/lib/speech`, `@/lib/orientation` → direct source files
- Update test imports in the same commit so the repo is barrel-free in both `src/` and `test/`.
- Delete the 31 barrel files only after typecheck is clean.
- Keep import paths extensionless and aligned with the repo’s existing alias conventions.

#### Risk: High

This is the widest dependency-surface change in PBW-68. The risk is not behavioral logic, but broken imports, missed type-only exports, or inconsistent path rewrites across tests.

#### Test impact

Most directly affected suites:

- `test/core/match/*.test.ts`
- `test/current-match/*.test.ts`
- `test/input/*.test.ts*`
- `test/components/ui/*`
- `test/components/SetupScreen/*`
- `test/components/ActiveMatchScreen/*`
- `test/components/MatchEndScreen/*`
- `test/components/ShareScreen/*`
- `test/routes/*`
- `test/integration/app-flow.browser.test.tsx`

### Item 3: Extract hardcoded strings to i18n

#### Findings

Confirmed hardcoded UI-facing strings still in production `.tsx` files:

- `src/components/ui/Spinner/Spinner.tsx:22` — default `label = 'Loading'`
- `src/components/ui/Toast/ToastViewport.tsx:26` — `aria-label="Close"`
- `src/components/ui/Toast/useToast.tsx:92` — `aria-label="Close"`
- `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx:320-321` — fallback team names `'Team 1'` / `'Team 2'`
- `src/components/CurrentMatchStartupGate/CurrentMatchStartupGate.tsx:131` — fallback error copy `'Unable to clear the saved match right now.'`
- `src/components/DebugPwa/DebugPwa.tsx:106,115,121,128,132,136,141,144,158-170` — `t(..., { defaultValue })` fallbacks still hardcoded in component code:
  - `Open PWA Debug`
  - `PWA Debug`
  - `Close`
  - `SW Supported`
  - `SW Registered`
  - `SW Ready`
  - `Version`
  - `Cache`
  - `Updating...`
  - `Update SW`
  - `Clearing...`
  - `Clear Cache`
- `src/components/MatchEndScreen/MatchEndScreen.tsx:387,390,395` — debug modal strings:
  - `Share screen debug preview`
  - `DEBUG — ShareScreen Preview`
  - `Close debug modal`
- `src/components/PadelCourtSpinner/PadelCourtSpinner.tsx:52` — default `label = 'Loading, please wait...'`
- `src/components/SetupScreen/VoiceSelectionModal.tsx:50-51` — `defaultValue: 'Team A'` / `defaultValue: 'Team B'` because the target keys do not exist in locale files
- `src/routes/__root.tsx:37,41,57` — hardcoded document metadata:
  - `Padel Buddy`
  - `Client-only TanStack Start foundation for the Padel Buddy score tracker.`
  - `Padel Buddy` (Apple title)

Additional scan conclusion:

- No other plain JSX text nodes were found outside the Match End debug preview, which means most remaining i18n debt is concentrated in accessibility labels, metadata, debug UI, and fallback/default strings.

Locale files to update:

- `src/lib/i18n/locales/en.ts`
- `src/lib/i18n/locales/es.ts`
- `src/lib/i18n/locales/pt.ts`

#### Changes

- Add missing locale keys in all three locale files for:
  - generic close/loading strings used by accessibility labels
  - Debug PWA copy
  - Match End debug preview copy
  - startup fallback clear-error message
  - shared team fallback/default names
  - route head/app metadata if those strings are to be localized through `__root.tsx`
- Replace all remaining inline literals/defaultValue fallbacks with `t(...)` calls or existing keys.
- Reuse existing keys where appropriate instead of creating duplicates, especially for team labels/default names.
- Remove `defaultValue` from production UI strings once the corresponding locale keys exist.

#### Risk: Medium

Low runtime logic risk, but medium UX risk because missing keys or mismatched interpolations can silently degrade the UI in non-English locales.

#### Test impact

Most directly affected suites:

- `test/components/DebugPwa/DebugPwa.browser.test.tsx`
- `test/components/ui/Spinner/Spinner.browser.test.tsx`
- `test/components/ui/Toast/Toast.browser.test.tsx`
- `test/components/ActiveMatchScreen/ActiveMatchScreen.browser.test.tsx`
- `test/current-match/CurrentMatchStartupGate.browser.test.tsx`
- `test/components/MatchEndScreen/MatchEndScreen.browser.test.tsx`
- `test/components/PadelCourtSpinner/PadelCourtSpinner.browser.test.tsx`
- `test/lib/i18n/i18n.test.ts`
- `test/routes/__root.test.tsx`

### Item 4: Remove duplicated styles

#### Findings

Confirmed duplicated CSS blocks across CSS Modules:

1. **Overlay/backdrop block duplicated in 6 files**

- `src/components/ActiveMatchScreen/SideSwitchPrompt/SideSwitchPrompt.module.css:4-9`
- `src/components/CurrentMatchStartupGate/CurrentMatchStartupGate.module.css:102-107`
- `src/components/PadelCourtSpinner/PadelCourtSpinner.module.css:50-55`
- `src/components/SetupScreen/RemoteConfigurationModal.module.css:1-6`
- `src/components/SetupScreen/VoiceSelectionModal.module.css:1-6`
- `src/components/ui/RotateDeviceBlocker/RotateDeviceBlocker.module.css:1-6`

2. **Screen-reader-only helper duplicated in 4 files**

- `src/components/MatchEndScreen/MatchSummaryCard.module.css:138-146`
- `src/components/PadelCourtSpinner/PadelCourtSpinner.module.css:38-47`
- `src/components/SetupScreen/RemoteConfigurationModal.module.css:110-119`
- `src/components/ui/Spinner/Spinner.module.css:38-47`

3. **Toast typography/layout/close styles duplicated between two files**

- `src/components/ui/Toast/Toast.module.css:1-66`
- `src/components/ui/Toast/ToastViewport.module.css:25-136`
- Repo search found **no imports** of `Toast.module.css`, making it a strong candidate for deletion after verification.

4. **Modal title shell styles duplicated between setup modals**

- `src/components/SetupScreen/RemoteConfigurationModal.module.css:8-45,122-153`
- `src/components/SetupScreen/VoiceSelectionModal.module.css:8-38,133-147`
- Exact duplicate blocks include `.overlay`, `.container` shell structure, `.header`, `.title`, and similar `.footer` layout patterns.

5. **Notice/status card styling duplicated across landing and error states**

- `src/components/CurrentMatchStartupGate/CurrentMatchStartupGate.module.css:1-124`
- `src/components/NotFoundPage/NotFoundPage.module.css:1-86`
- `src/routes/index.module.css:1-52`
- Exact shared blocks include page centering, notice/card gradient shell, eyebrow styling, and notice copy grid.

6. **Score/team header grid duplicated**

- `src/components/MatchEndScreen/MatchSummaryCard.module.css:55-58`
- `src/components/ShareScreen/ShareScreen.module.css:111-116`

#### Changes

- Delete `src/components/ui/Toast/Toast.module.css` if verification confirms it is unused.
- Extract a single reusable screen-reader-only utility and a single reusable overlay/backdrop utility instead of keeping copied blocks.
- Extract only the **exact** modal-shell duplication shared by `RemoteConfigurationModal` and `VoiceSelectionModal`; do not over-abstract the full modal internals if the remaining rules diverge.
- Consolidate the shared notice-card primitives only where declarations are identical; keep intentionally different card variants separate.
- Re-run visual checks after every shared-style extraction because these files affect modal positioning and overlay stacking.

#### Risk: Medium

CSS duplication cleanup is visually risky even when behavior is unchanged, especially for modal centering, z-index ordering, and responsive rules.

#### Test impact

Most directly affected suites:

- `test/components/ui/Toast/Toast.browser.test.tsx`
- `test/components/SetupScreen/SetupScreen.browser.test.tsx`
- `test/components/ActiveMatchScreen/SideSwitchPrompt.browser.test.tsx`
- `test/current-match/CurrentMatchStartupGate.browser.test.tsx`
- `test/components/NotFoundPage/NotFoundPage.browser.test.tsx`
- `test/components/DebugPwa/DebugPwa.browser.test.tsx`
- `test/components/PadelCourtSpinner/PadelCourtSpinner.browser.test.tsx`
- `test/components/ShareScreen/ShareScreen.browser.test.tsx`
- `test/components/MatchEndScreen/MatchEndScreen.browser.test.tsx`

### Item 5: Remove/extract duplicated code

#### Findings

Confirmed duplicated logic patterns in production code:

1. **Toast viewport renderer duplicated almost verbatim**

- `src/components/ui/Toast/ToastViewport.tsx:7-33`
- `src/components/ui/Toast/useToast.tsx:72-100`
- Both map the same toast manager data into the same `BaseToast.Root / Content / Title / Description / Close` tree.

2. **Route error UI duplicated**

- `src/routes/__root.tsx:76-106` (`RootErrorState` inner UI)
- `src/routes/-route-utils.tsx:28-55` (`RouteErrorState`)
- The error card body, translation keys, retry CTA, and `getErrorMessage()` use are duplicated.

3. **Match route loader structure duplicated**

- `src/routes/match.$id.tsx:14-42`
- `src/routes/match.finish.$id.tsx:15-44`
- Both loaders fetch current match data, resolve route state, redirect on invalid status, throw if not ready, and return shaped loader data.

4. **Remote controller binding bootstrap pattern duplicated, but with divergent UI behavior**

- `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx:374-399`
- `src/components/SetupScreen/RemoteConfigurationModal.tsx:58-84`
- The async `loadRemoteControllerBindingsWithFallback()` + mounted-guard + empty-bindings fallback pattern is duplicated; however, the modal also raises a toast on error, so this is a lower-priority extraction candidate than the three cases above.

#### Changes

- Keep Item 5 focused on the **highest-value exact duplicates**:
  1. consolidate the Toast renderer into one implementation
  2. consolidate the route error card body into one shared implementation
  3. extract a small shared match-route loader helper if it keeps the two route files simpler than the current duplication
- Treat the remote-binding bootstrap duplication as optional follow-up inside the same commit only if the resulting abstraction is clearly simpler.
- Do **not** introduce generic abstractions for everything that merely looks similar; only extract duplicates that become more readable after extraction.

#### Risk: Medium

Moderate regression risk because this item touches route loading, global error surfaces, and toast rendering, all of which are cross-cutting.

#### Test impact

Most directly affected suites:

- `test/components/ui/Toast/Toast.browser.test.tsx`
- `test/routes/__root.test.tsx`
- `test/routes/route-utils.test.tsx`
- `test/routes/match.$id.browser.test.tsx`
- `test/routes/match.finish.$id.browser.test.tsx`
- `test/routes/match-route-state.test.ts`
- `test/lib/router/current-match-route-flow.test.ts`

### Item 6: Replace inline styles with CSS modules

#### Findings

Repo-wide search found **one confirmed inline style usage** in production `.tsx` files:

- `src/components/MatchEndScreen/MatchEndScreen.tsx:39-44` — `hiddenScreenStyle` constant
- `src/components/MatchEndScreen/MatchEndScreen.tsx:334` — `<div aria-hidden="true" style={hiddenScreenStyle}>`

Additional scan conclusion:

- No `style={{ ... }}` usages were found anywhere in `src/**/*.tsx`.
- No other `style=` usage was found in production `.tsx` besides the hidden ShareScreen capture container above.

#### Changes

- Move `hiddenScreenStyle` into `src/components/MatchEndScreen/MatchEndScreen.module.css` as a dedicated utility class for the hidden capture region.
- Remove the TS object constant entirely.
- Keep the hidden capture behavior unchanged so the share workflow still works.

#### Risk: Low

Very small surface area, but it touches the hidden DOM used for share capture, so visual/manual verification is still required.

#### Test impact

Most directly affected suites:

- `test/components/MatchEndScreen/MatchEndScreen.browser.test.tsx`
- `test/components/ShareScreen/ShareScreen.browser.test.tsx`
- `test/routes/match.finish.$id.browser.test.tsx`

### Item 7: Replace hardcoded values with design tokens

#### Findings

**Design-token source reviewed before this scan**

- Base tokens provide reusable color, space, dimension, radius, and font values (notably `40px`, `46px`, `52px`, `64px`, `72px`, `88px`, `232px`, `500px`, `320px`, `173px`, `177px`, etc. where applicable).
- Semantic typography already exposes letter-spacing tokens (`wide-md`, `wide-lg`, `wide-xl`, `tight-sm`, `tight-xl`) and semantic size aliases.

**Confirmed hardcoded color/value usages in production files**

1. **Hardcoded colors**

- `src/routes/__root.tsx:45` — `content: '#2F7CF6'`
- `src/components/PadelCourtSpinner/PadelCourtSpinner.module.css:18,23` — `fill: #d4e157`
- `src/components/PadelCourtSpinner/PadelCourtSpinner.tsx:93` — `fill="#1a3a5c"`
- `src/components/PadelCourtSpinner/PadelCourtSpinner.tsx:94` — `stroke="#2f7cf6"`
- `src/components/PadelCourtSpinner/PadelCourtSpinner.tsx:104,110-115` — hardcoded `white` SVG stroke values

2. **Hardcoded dimensions / sizes / typography with direct or likely token matches**

- `src/components/PadelCourtSpinner/PadelCourtSpinner.module.css:9-13` — `width: 284px`, `height: 140px`, `24px/20px/6px` shadow values
- `src/components/PadelCourtSpinner/PadelCourtSpinner.tsx:82,95,105-106` — `viewBox="0 0 284 140"`, `strokeWidth="3"`, `strokeWidth="2"`, `strokeDasharray="4 4"`
- `src/components/ui/RotateDeviceBlocker/RotateDeviceBlocker.module.css:40-41` — `width: 64px; height: 64px`
- `src/components/ui/RotateDeviceBlocker/RotateDeviceBlocker.module.css:111-112` — `width: 52px; height: 52px`
- `src/components/ActiveMatchScreen/SideSwitchPrompt/SideSwitchPrompt.module.css:22` — `width: min(..., 320px)`
- `src/components/ActiveMatchScreen/TeamPanel/TeamPanel.module.css:79` — `letter-spacing: -10px`
- `src/components/ActiveMatchScreen/TeamPanel/TeamPanel.module.css:102` — `font-size: clamp(232px, 65vmin, 500px)`
- `src/components/ActiveMatchScreen/TeamPanel/TeamPanel.module.css:103` — `letter-spacing: -6px`
- `src/components/ShareScreen/ShareScreen.module.css:60` — `letter-spacing: 2px`
- `src/components/ShareScreen/ShareScreen.module.css:69` — `letter-spacing: -1px`
- `src/components/ShareScreen/ShareScreen.module.css:107` — `letter-spacing: 1.2px`
- `src/components/ShareScreen/ShareScreen.module.css:196` — `letter-spacing: 1.6px`
- `src/components/ActiveMatchScreen/SetsCard/SetsCard.module.css:73` — `width: clamp(144px, 28vw, var(--app-scoreboard-sets-overlay-width))`
- `src/components/MatchEndScreen/MatchEndScreen.tsx:42` — `left: '-9999px'` in hidden capture style

3. **Additional hardcoded visual literals that need triage, not blind replacement**

- `src/components/ui/RotateDeviceBlocker/RotateDeviceBlocker.module.css:25` — `box-shadow: 0 4px 12px ...`
- `src/components/ActiveMatchScreen/SideSwitchPrompt/SideSwitchPrompt.module.css:28` — `box-shadow: 0 4px 12px ...`
- `src/components/SetupScreen/RemoteConfigurationModal.module.css:23` — `box-shadow: 0 12px 36px ...`
- `src/components/SetupScreen/VoiceSelectionModal.module.css:23,86` — `box-shadow: 0 12px 36px ...`, `0 12px 30px ...`
- `src/components/MatchEndScreen/MatchEndScreen.module.css:167` — `backdrop-filter: blur(4px)`
- `src/components/MatchEndScreen/MatchStatsCard.module.css:11` — `box-shadow: 0 16px 40px ...`

Interpretation:

- Some values map cleanly to existing design-token variables.
- Some values are **design literals with no obvious existing token** in `design-tokens/`; these should be replaced only if there is a valid existing token or a clearly approved nearest semantic token. Do not invent unrelated token mappings just to eliminate literals.

#### Changes

- Replace direct color literals with existing token variables wherever the runtime surface allows it:
  - use CSS variables in CSS Modules
  - use token-backed values or CSS-variable-friendly SVG attributes where possible in TSX/SVG
- Replace direct typography/spacing/dimension literals with the corresponding token variable when an existing token already matches the value/intent.
- For runtime-only values like route metadata (`theme-color`) or SVG props, use the smallest possible token-backed source of truth instead of re-hardcoding values in TSX.
- For values with **no clean existing token match**, document them in the commit and either:
  - map to an existing semantically correct token, or
  - leave them unchanged with an explicit exception note rather than introducing a wrong token reference.

#### Risk: High

This is the highest visual-regression item in the issue. Several affected files are layout-critical or illustration-heavy, and not every literal currently has a perfect token equivalent.

#### Test impact

Most directly affected suites:

- `test/routes/__root.test.tsx`
- `test/components/PadelCourtSpinner/PadelCourtSpinner.browser.test.tsx`
- `test/components/ActiveMatchScreen/SideSwitchPrompt.browser.test.tsx`
- `test/components/ActiveMatchScreen/TeamPanel.browser.test.tsx`
- `test/components/ShareScreen/ShareScreen.browser.test.tsx`
- `test/components/MatchEndScreen/MatchEndScreen.browser.test.tsx`
- `test/components/DebugPwa/DebugPwa.browser.test.tsx`
- Manual visual verification against the Pencil design is mandatory for this item.

### Item 8: Replace template literal classNames with cn()

#### Findings

Confirmed template-literal `className` usage in production code:

- `src/components/DebugPwa/DebugPwa.tsx:164` — ``className={`${styles.button} ${styles.buttonDanger}`}``

Repo-wide result:

- No other `className={\`...\`}`or string-concatenation className patterns were found in`src/\*_/_.{tsx,ts}`.

#### Changes

- Import `cn` from `src/lib/utils/cn.ts` into `src/components/DebugPwa/DebugPwa.tsx`.
- Replace the template literal with `cn(styles.button, styles.buttonDanger)`.
- Keep button logic unchanged.

#### Risk: Low

Purely mechanical cleanup with no intended behavior change.

#### Test impact

Most directly affected suites:

- `test/components/DebugPwa/DebugPwa.browser.test.tsx`
- `test/lib/utils/cn.test.ts`

## Execution Order

Recommended commit order, with user review before every commit:

1. **Item 1 — Architecture Review**
   - Establish the written review artifact and lock the approved cleanup scope.
2. **Item 2 — Remove Barrel Files**
   - Largest dependency-surface cleanup; do it before later edits to reduce ongoing path churn.
3. **Item 5 — Remove/extract duplicated code**
   - Consolidating Toast/error/route-loader duplication early reduces the number of places later commits need to touch.
4. **Item 3 — Extract hardcoded strings to i18n**
   - After deduping the shared UI surfaces, localize the reduced set of actual rendering points.
5. **Item 8 — Replace template literal classNames with cn()**
   - Tiny, isolated cleanup after the DebugPwa i18n work settles.
6. **Item 6 — Replace inline styles with CSS modules**
   - Move the last inline style into CSS before the CSS cleanup/token pass.
7. **Item 4 — Remove duplicated styles**
   - Normalize shared CSS structure once the CSS surface is stable.
8. **Item 7 — Replace hardcoded values with design tokens**
   - Highest visual risk; leave it last so layout/component structure is already stable and reviewable.

## Testing Strategy

Global rule for PBW-68: after **each item commit candidate**, run the smallest relevant test slice first, then run `pnpm complete-check` before asking for user review.

Recommended validation per item:

- **Item 1**: doc sanity review; optional `pnpm complete-check`.
- **Item 2**: `pnpm typecheck`, then the impacted route/core/current-match/input/component suites, then `pnpm complete-check`.
- **Item 3**: i18n-focused component tests plus `test/lib/i18n/i18n.test.ts` and `test/routes/__root.test.tsx`.
- **Item 4**: affected browser component tests plus manual visual comparison for overlays/modals/toasts.
- **Item 5**: route, toast, and current-match navigation tests; confirm no regression in global error rendering.
- **Item 6**: Match End + Share Screen browser tests; manual share-flow sanity check.
- **Item 7**: browser tests for every touched visual component plus manual Pencil comparison for Active Match, Match End, Share, loading spinner, and rotation blocker states.
- **Item 8**: `test/components/DebugPwa/DebugPwa.browser.test.tsx`, optional `test/lib/utils/cn.test.ts`, then full check.

Success criteria for the full issue:

- All 8 planned commits are completed independently and reviewed by the user before commit creation.
- `src/` is barrel-free.
- All remaining UI-facing production strings come from `src/lib/i18n/locales/{en,es,pt}.ts`.
- Confirmed duplicate CSS/code hotspots are removed or consolidated without over-abstraction.
- No inline production styles remain.
- Hardcoded visual values are replaced by existing design-token references wherever a correct token exists, with exceptions explicitly documented if a clean token mapping does not exist.
- All template-literal className usage is removed in favor of `cn()`.
- `pnpm complete-check` passes after the final item.
