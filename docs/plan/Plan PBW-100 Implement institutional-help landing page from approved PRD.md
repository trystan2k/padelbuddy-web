## Task Analysis

- Main objective: Implement PBW-100 as a dedicated public `/help` landing/institutional page derived from `docs/prd/institutional-page.md`, with full public PRD coverage, localized copy in `src/lib/i18n/locales/{en,es,pt}.ts`, styled screenshot placeholders, and setup-specific help-entry behavior that routes to the page while the existing help modal remains available on the other app surfaces.
- Identified dependencies:
  - Existing help-trigger and spotlight flow in `src/components/ui/TopBar/AppHelpDialog.tsx`, `src/components/ui/TopBar/AppHelpSpotlight.tsx`, and `src/components/ui/TopBar/TopBar.tsx`.
  - Existing screen shells and styling patterns in `src/components/Layout/Layout.tsx`, `src/components/ui/LocaleSelector/LocaleSelector.tsx`, `src/components/StoreButtons/StoreButtons.tsx`, and the CSS Modules/token usage already present in `SetupScreen`, `HistoryScreen`, `MatchEndScreen`, and `ShareScreen`.
  - Existing route structure in `src/routes/index.tsx`, `src/routes/history.tsx`, `src/routes/match.$id.tsx`, `src/routes/match.finish.$id.tsx`, plus generated `src/routeTree.gen.ts`.
  - Existing locale structure in `src/lib/i18n/locales/en.ts`, `es.ts`, and `pt.ts`, where `help.*` already contains modal/spotlight copy and should be extended instead of creating a disconnected namespace.
  - Existing product behavior that must stay stable: `ShareScreen` still hides the help trigger, first-visit spotlight remains setup-only, store badges keep placeholder hrefs, and Base UI dialog behavior on non-setup screens must not regress.
  - Working assumption for simplicity: setup/home is the only screen that switches from modal help to the full page unless PBW-100 acceptance comments explicitly name more surfaces.
- System impact:
  - Route structure:
    - Create `src/routes/help.tsx` for a single canonical `/help` route.
    - Use hash anchors inside the page instead of nested child routes to keep navigation simple: `#what-is`, `#main-flow`, `#setup`, `#live-match`, `#match-end`, `#history`, `#recovery`, `#help-system`, `#accessibility`, `#platforms`, and `#small-details`.
  - Public PRD content that must be rendered on the page:
    1. `What is Padel Buddy?`
    2. `The Main Flow of the App`
    3. `Setting Up a Match` with all 14 public subsections: Team Names, Match Format, Golden Point or Advantage, Super Tiebreak, First Server, Serving Indicator, Side-Switch Prompts, Countdown Timer, Audio Announcements, Voice Selection, Remote Controller Setup, Language Selector, History Shortcut, and Store Buttons on Web/PWA.
    4. `Live Match Screen` with all 19 public subsections: Large Score Panels, Serving Indicator, Per-Team Undo Buttons, Automatic Scoring Rules, Deuce and Advantage, Golden Point Logic, Standard Tiebreak at 6-6, Deciding-Set Super Tiebreak, Side-Switch Prompts, Match Timer/Clock, Finish Match Action, Automatic Route to Match End, Rotation Blocker in Portrait Mode, Compact-Height Fullscreen-Like Behavior, Wake Lock Support, Keyboard/Remote/Media Button Scoring, Double-Press Revert Logic for Media Buttons, Speech During Live Scoring, and Minimal/Standard/Verbose Behavior.
    5. `Match End Screen` with 7 public subsections: Winner Card, Set Summary, Match Statistics, Spoken Result Announcement, Share Action, New Match Button, and Continue Button.
    6. `Match History` with 10 public subsections: Automatic Local Storage, 100-Match Limit, History Table Information, Winner Highlighting, Finished-Early Indicator, Share from History, Delete from History, Play Again, Back to Home, and Empty State.
    7. `Recovery, Safety, and Reliability Features` with 6 public subsections: Automatic Current-Match Persistence, Resume Saved Match Prompt, Corrupt Match Recovery, Schema-Mismatch Reset Notice, Friendly Error Redirection, and Route Loading Feedback.
    8. `Help System Inside the App` with 3 public subsections: Help Button in the Top Bar, First-Visit Help Spotlight, and Current Built-In Help Content.
    9. `Languages and Accessibility`.
    10. `PWA, Offline Use, Web, and Native Apps` with the public subsections for Web Version, PWA, How to Install the PWA, Offline Use, Native Mobile Apps, Android License / Store-Origin Protection, and Ads Difference Between Versions.
    11. `Small But Important Details to Explain Clearly`.
  - Explicit exclusions required by the confirmed scope:
    - Exclude `5.8 Internal Note: Debug Share Preview` from the public page.
    - Exclude `10.8 Internal Note: Developer PWA Debug Tools` from the public page.
    - Exclude any other internal/debug-only copy discovered during implementation, even if documented in the PRD for completeness.
  - Cross-cutting impact:
    - A new long-form route and component set will be introduced.
    - `TopBar`/help-trigger behavior will gain a setup-specific branch.
    - Locale files will grow substantially.
    - Browser tests and at least one route-entry smoke test will need updates.
    - Accessibility and responsive QA will matter more than usual because the page is both public-facing and content-heavy.

## Chosen Approach

- Proposed solution:
  - Route and entry architecture:
    - Add a dedicated `/help` route in `src/routes/help.tsx` and keep it flat: no nested routes, no modal-inside-page behavior, and no content-management layer.
    - Extend the existing TopBar help control with one explicit mode prop, such as `helpEntryMode?: 'dialog' | 'page'`, defaulting to `'dialog'`.
    - `SetupScreen` passes `'page'` so the existing help icon navigates to `/help`; `ActiveMatchScreen`, `MatchEndScreen`, and `HistoryScreen` keep the current modal path by relying on the default.
    - Keep the trigger itself as the same styled button so `AppHelpSpotlight` can continue using a button ref without a broader refactor.
  - Component architecture:
    - Create `src/components/HelpLandingPage/HelpLandingPage.tsx` as the route-level page component.
    - Create `src/components/HelpLandingPage/HelpLandingPage.module.css` for the mobile-first article layout, sticky/inline section nav, content cards, and gray screenshot placeholders.
    - Create `src/components/HelpLandingPage/help-page-content.ts` to hold only section order, anchor ids, placeholder ids, and translation-key references; do **not** move prose out of the locale files.
    - Create `src/components/HelpLandingPage/HelpSection.tsx` to render repeated section/subsection card structure.
    - Create `src/components/HelpLandingPage/HelpScreenshotPlaceholder.tsx` to render the reusable gray placeholder block with descriptive text, capture instructions, and caption.
    - Reuse `Layout`, `TopBar`, `LocaleSelector`, `StoreButtons`, and existing token-driven UI patterns rather than creating a bespoke shell.
  - Page structure inside `/help`:
    - Header: `TopBar` with app branding, localized subtitle, `LocaleSelector` in the actions slot, and `showHelpTrigger={false}` because the page itself is the help destination.
    - On-page section navigation: anchor links to each main section so users can jump directly to setup, live match, history, recovery, or platforms.
    - Main article: stacked sections rendered in PRD order, each with subsections as readable cards/rows and screenshots represented by styled placeholder blocks.
    - Footer/closing CTA: a short return-to-setup action rather than a second help surface.
  - Content-rendering rules derived from the PRD and confirmed requirements:
    - Render all public-facing sections and subsections listed above.
    - Apply the PRD editorial guidance as implementation rules, not as a visible public section: benefits first, plain language, concrete examples, and no technical/debug framing.
    - Use the PRD screenshot list to place placeholders where visuals are important to comprehension, even when the final screenshots are not available yet.
    - Keep internal/debug-only content out, but keep public-facing technical/product details in concise language, including Android store-origin/license behavior if it is truly user-facing.
  - i18n keys needed (all added now in `en.ts`, `es.ts`, and `pt.ts`, and consumed through `t()`):
    - Top-level page metadata and shell:
      - `help.page.meta.{title,description}`
      - `help.page.hero.{eyebrow,title,body}`
      - `help.page.toc.{title,whatIs,mainFlow,setup,liveMatch,matchEnd,history,recovery,helpSystem,accessibility,platforms,smallDetails}`
      - `help.page.common.{backToHome,startMatch,publicOnlyNote,placeholderLabel,captureHintLabel,captionLabel,storeAvailabilityLabel}`
    - `What is Padel Buddy?`:
      - `help.page.whatIs.{title,body}`
    - `The Main Flow of the App`:
      - `help.page.mainFlow.{title,body,setup.title,setup.body,liveMatch.title,liveMatch.body,matchEndHistory.title,matchEndHistory.body,recovery.title,recovery.body}`
    - `Setting Up a Match`:
      - `help.page.setup.{title,body}`
      - `help.page.setup.teamNames.{title,body}`
      - `help.page.setup.matchFormat.{title,body}`
      - `help.page.setup.goldenPoint.{title,body}`
      - `help.page.setup.superTiebreak.{title,body}`
      - `help.page.setup.firstServer.{title,body}`
      - `help.page.setup.servingIndicator.{title,body}`
      - `help.page.setup.sideSwitch.{title,body}`
      - `help.page.setup.countdown.{title,body}`
      - `help.page.setup.audio.{title,body}`
      - `help.page.setup.voiceSelection.{title,body}`
      - `help.page.setup.remoteController.{title,body}`
      - `help.page.setup.languageSelector.{title,body}`
      - `help.page.setup.historyShortcut.{title,body}`
      - `help.page.setup.storeButtons.{title,body}`
    - `Live Match Screen`:
      - `help.page.liveMatch.{title,body}`
      - `help.page.liveMatch.largeScorePanels.{title,body}`
      - `help.page.liveMatch.servingIndicator.{title,body}`
      - `help.page.liveMatch.undo.{title,body}`
      - `help.page.liveMatch.automaticScoring.{title,body}`
      - `help.page.liveMatch.deuceAdvantage.{title,body}`
      - `help.page.liveMatch.goldenPoint.{title,body}`
      - `help.page.liveMatch.standardTiebreak.{title,body}`
      - `help.page.liveMatch.superTiebreak.{title,body}`
      - `help.page.liveMatch.sideSwitch.{title,body}`
      - `help.page.liveMatch.timer.{title,body}`
      - `help.page.liveMatch.finishAction.{title,body}`
      - `help.page.liveMatch.autoFinishRoute.{title,body}`
      - `help.page.liveMatch.rotateBlocker.{title,body}`
      - `help.page.liveMatch.compactHeight.{title,body}`
      - `help.page.liveMatch.wakeLock.{title,body}`
      - `help.page.liveMatch.keyboardRemote.{title,body}`
      - `help.page.liveMatch.mediaDoublePress.{title,body}`
      - `help.page.liveMatch.speech.{title,body}`
      - `help.page.liveMatch.speechVerbosity.{title,body}`
    - `Match End Screen`:
      - `help.page.matchEnd.{title,body}`
      - `help.page.matchEnd.winnerCard.{title,body}`
      - `help.page.matchEnd.setSummary.{title,body}`
      - `help.page.matchEnd.statistics.{title,body}`
      - `help.page.matchEnd.spokenResult.{title,body}`
      - `help.page.matchEnd.share.{title,body}`
      - `help.page.matchEnd.newMatch.{title,body}`
      - `help.page.matchEnd.continue.{title,body}`
    - `Match History`:
      - `help.page.history.{title,body}`
      - `help.page.history.autoStorage.{title,body}`
      - `help.page.history.limit.{title,body}`
      - `help.page.history.tableInfo.{title,body}`
      - `help.page.history.winnerHighlight.{title,body}`
      - `help.page.history.finishedEarly.{title,body}`
      - `help.page.history.share.{title,body}`
      - `help.page.history.delete.{title,body}`
      - `help.page.history.playAgain.{title,body}`
      - `help.page.history.backHome.{title,body}`
      - `help.page.history.emptyState.{title,body}`
    - `Recovery, Safety, and Reliability Features`:
      - `help.page.recovery.{title,body}`
      - `help.page.recovery.autoPersistence.{title,body}`
      - `help.page.recovery.resumePrompt.{title,body}`
      - `help.page.recovery.corruptRecovery.{title,body}`
      - `help.page.recovery.schemaReset.{title,body}`
      - `help.page.recovery.friendlyErrors.{title,body}`
      - `help.page.recovery.loadingFeedback.{title,body}`
    - `Help System Inside the App`:
      - `help.page.helpSystem.{title,body}`
      - `help.page.helpSystem.topBarHelp.{title,body}`
      - `help.page.helpSystem.spotlight.{title,body}`
      - `help.page.helpSystem.builtInDialog.{title,body}`
    - `Languages and Accessibility`:
      - `help.page.accessibility.{title,body}`
    - `PWA, Offline Use, Web, and Native Apps`:
      - `help.page.platforms.{title,body}`
      - `help.page.platforms.web.{title,body}`
      - `help.page.platforms.pwa.{title,body}`
      - `help.page.platforms.install.{title,body}`
      - `help.page.platforms.offline.{title,body}`
      - `help.page.platforms.nativeApps.{title,body}`
      - `help.page.platforms.androidProtection.{title,body}`
      - `help.page.platforms.adsDifference.{title,body}`
    - `Small But Important Details to Explain Clearly`:
      - `help.page.smallDetails.{title,body}`
      - `help.page.smallDetails.servingCard.{title,body}`
      - `help.page.smallDetails.sideSwitchTimeout.{title,body}`
      - `help.page.smallDetails.landscapeOnly.{title,body}`
      - `help.page.smallDetails.resumeMatch.{title,body}`
      - `help.page.smallDetails.finishEarly.{title,body}`
      - `help.page.smallDetails.continueAfterFinish.{title,body}`
      - `help.page.smallDetails.deviceVoices.{title,body}`
      - `help.page.smallDetails.advancedSpeech.{title,body}`
      - `help.page.smallDetails.undoRestoresState.{title,body}`
      - `help.page.smallDetails.historyLimit.{title,body}`
      - `help.page.smallDetails.shareLater.{title,body}`
      - `help.page.smallDetails.offlineUse.{title,body}`
      - `help.page.smallDetails.rememberedPreferences.{title,body}`
      - `help.page.smallDetails.spotlightDiscovery.{title,body}`
    - Screenshot placeholder content (4 keys per placeholder so gray boxes are fully localizable):
      - `help.page.media.hero.{title,description,captureHint,caption}`
      - `help.page.media.mainFlow.{title,description,captureHint,caption}`
      - `help.page.media.setupOverview.{title,description,captureHint,caption}`
      - `help.page.media.remoteConfig.{title,description,captureHint,caption}`
      - `help.page.media.voiceSelection.{title,description,captureHint,caption}`
      - `help.page.media.liveMatch.{title,description,captureHint,caption}`
      - `help.page.media.sideSwitch.{title,description,captureHint,caption}`
      - `help.page.media.rotateBlocker.{title,description,captureHint,caption}`
      - `help.page.media.matchEnd.{title,description,captureHint,caption}`
      - `help.page.media.shareImage.{title,description,captureHint,caption}`
      - `help.page.media.historyList.{title,description,captureHint,caption}`
      - `help.page.media.historyEmpty.{title,description,captureHint,caption}`
      - `help.page.media.resumeDialog.{title,description,captureHint,caption}`
      - `help.page.media.corruptRecovery.{title,description,captureHint,caption}`
      - `help.page.media.helpSpotlight.{title,description,captureHint,caption}`
      - `help.page.media.platformComparison.{title,description,captureHint,caption}`
    - Only if screen-reader wording needs stricter accuracy between modal mode and page mode, add `help.triggerLabelPage` while keeping the existing `help.triggerLabel` for modal behavior.
  - Components to be modified/created:
    - Create:
      - `src/routes/help.tsx`
      - `src/components/HelpLandingPage/HelpLandingPage.tsx`
      - `src/components/HelpLandingPage/HelpLandingPage.module.css`
      - `src/components/HelpLandingPage/help-page-content.ts`
      - `src/components/HelpLandingPage/HelpSection.tsx`
      - `src/components/HelpLandingPage/HelpScreenshotPlaceholder.tsx`
      - `test/components/HelpLandingPage/HelpLandingPage.browser.test.tsx`
      - `e2e/help-page.spec.ts` (or the equivalent existing Playwright smoke file if the repo already has a preferred app-flow spec for help navigation)
    - Modify:
      - `src/components/ui/TopBar/TopBar.tsx`
      - `src/components/ui/TopBar/AppHelpDialog.tsx`
      - `src/components/SetupScreen/SetupScreen.tsx`
      - `src/lib/i18n/locales/en.ts`
      - `src/lib/i18n/locales/es.ts`
      - `src/lib/i18n/locales/pt.ts`
      - `test/components/ui/TopBar/AppHelpDialog.browser.test.tsx`
      - `test/components/ui/TopBar/TopBar.browser.test.tsx`
      - `test/components/SetupScreen/SetupScreen.browser.test.tsx`
    - Reuse unchanged unless implementation discovers a narrow need:
      - `src/components/ui/TopBar/AppHelpSpotlight.tsx`
      - `src/components/Layout/Layout.tsx`
      - `src/components/ui/LocaleSelector/LocaleSelector.tsx`
      - `src/components/StoreButtons/StoreButtons.tsx`
      - `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`
      - `src/components/MatchEndScreen/MatchEndScreen.tsx`
      - `src/components/HistoryScreen/HistoryScreen.tsx`
      - `src/components/ShareScreen/ShareScreen.tsx`
    - Generated output:
      - `src/routeTree.gen.ts` should be updated by the existing route generation flow and must not be hand-edited.
    - Plan file:
      - `/Users/trystan2k/Documents/Thiago/Repos/padelbuddy-web/docs/plan/Plan PBW-100 Implement institutional-help landing page from approved PRD.md`
  - Acceptance criteria checklist from PBW-100 and the confirmed interview notes:
    - [ ] A dedicated public `/help` page exists and is reachable from the setup screen help entry.
    - [ ] The shared TopBar help trigger navigates to the full-page `/help` experience.
    - [ ] The old modal help dialog has been removed in favor of the public help page.
    - [ ] The page covers the full public PRD scope, including setup, live match, match end, history, recovery, help system, accessibility, platforms, and the “small but important details” section.
    - [ ] All screenshot/media slots use styled gray placeholder blocks with descriptive text and captions instead of real screenshots.
    - [ ] All new copy is localized now in `en.ts`, `es.ts`, and `pt.ts`, and rendered through `t()`.
    - [ ] Internal/debug-only content is excluded from the public-facing page.
    - [ ] The page remains mobile-first, token-driven, semantic, keyboard-accessible, and screen-reader-friendly.
- Justification for simplicity:
  - Recommended option: a single `/help` route with the shared TopBar help trigger navigating to it.
  - Rejected approach 1: expand the existing `AppHelpDialog` into the full institutional page. This would create a very long modal, worsen mobile readability, complicate placeholder rendering, and was superseded by the chosen public-page approach.
  - Rejected approach 2: build a markdown/CMS-driven content system. There is no existing content pipeline in the repository, and adding one would increase i18n, tooling, and rendering complexity for a single page.
  - Rejected approach 3: implement separate ad hoc help triggers per screen. That would duplicate trigger/spotlight behavior and increase regression risk in the shared `TopBar` pattern.
  - The chosen path removes the modal help dialog, introduces exactly one new route, uses the same token/CSS Module/component conventions already present in the app, and puts all prose where the codebase already stores user-facing copy.

## Implementation Steps

1. Lock the content and routing contract before coding the UI. Create the definitive section map from `docs/prd/institutional-page.md`, mark the public-only exclusions (`debug share preview`, `developer PWA debug tools`), decide the anchor ids, and confirm the shared TopBar help trigger will navigate to the new public page. This step should also lock the 16 placeholder ids listed above so the route, component, and locale work all target the same shape from the start.
2. Add the i18n skeleton first in `src/lib/i18n/locales/en.ts`, `es.ts`, and `pt.ts`. Introduce the full `help.page.*` namespace and the placeholder key groups in all three locale files at the same time so implementation can use `t()` everywhere with no fallback strings. Keep the locale structure flat enough to stay readable (`title`/`body` pairs per subsection) and avoid introducing `returnObjects` patterns that do not exist elsewhere in the codebase.
3. Create the new route and page shell. Add `src/routes/help.tsx` for `/help` and render a new `HelpLandingPage` component. In `HelpLandingPage.tsx`, reuse `Layout` and `TopBar`, put `LocaleSelector` in the header actions, disable the help trigger on the page itself, add the hero/CTA block, and add the anchor-based section navigation. If route-specific head metadata is implemented, source the title/description from `help.page.meta.*` instead of hardcoding strings.
4. Build the reusable long-form content components and wire the full public PRD coverage. Add `help-page-content.ts` for section order + anchor ids + translation-key references, then implement `HelpSection` and `HelpScreenshotPlaceholder`. Use these to render every public section/subsection in PRD order, place the 16 gray placeholder blocks where visuals matter, and reuse `StoreButtons` only where public CTA/store promotion belongs. Keep all copy public-facing and benefits-first; do not surface internal tooling text. If JSX stays manageable, keep helpers small and resist extracting more components than necessary.
5. Implement the page styling and accessibility layer in `HelpLandingPage.module.css`. Use semantic tokens (`semantic.color.*`, `semantic.typography.*`) and established CSS Module patterns for cards, spacing, borders, headings, focus states, and responsive stacks. The placeholders should clearly read as temporary gray assets with title, description, capture hint, and caption. Ensure the page has a semantic heading hierarchy, a named section nav, keyboard-focusable anchor links, and figure/figcaption semantics for the placeholder media blocks.
6. Wire the help entry to the public page. Update `TopBar.tsx` so the shared help trigger navigates to `/help`, retain the first-visit spotlight behavior around that trigger, and update `SetupScreen.tsx` to keep the shared trigger enabled on first visit. Remove the old `AppHelpDialog.tsx` flow entirely so the app has a single public help experience. Mitigation/rollback note: keep the new route isolated and preserve the spotlight/entry-state logic so regressions can be diagnosed without reintroducing the modal dialog.
7. Add focused regression coverage and run full QA. Create `test/components/HelpLandingPage/HelpLandingPage.browser.test.tsx` to assert the page renders the expected major sections, anchor nav, localized placeholder blocks, and store CTA behavior. Update the TopBar, Spotlight, SetupScreen, and E2E coverage to validate first-visit behavior and the new `/help` navigation flow. Finish by regenerating routes if needed, running targeted tests, and then running `pnpm complete-check`.

## Validation

- Success criteria:
  - [ ] `/help` exists as a dedicated TanStack Start route and renders a localized help/institutional page.
  - [ ] The setup screen help icon navigates to `/help`, while live match, match end, and history continue opening the existing help dialog.
  - [ ] The page includes all public PRD sections and subsections listed in this plan, including the “Small But Important Details” section.
  - [ ] The page excludes the internal/debug-only items called out in the PRD.
  - [ ] Every planned screenshot/media slot is represented by a styled gray placeholder block with translated title, description, capture hint, and caption.
  - [ ] All new copy is present in `en.ts`, `es.ts`, and `pt.ts`, and every rendered string is sourced through `t()`.
  - [ ] The page follows the project’s mobile-first, CSS Module, design-token, and accessibility conventions.
  - [ ] Existing first-visit spotlight behavior still works on setup and does not require a second click to reach help.
  - [ ] Existing help modal tests remain green for non-setup surfaces.
  - [ ] `pnpm complete-check` passes.
- Checkpoints:
  - Pre-implementation assumptions check:
    - Confirm the only screen switching to full-page help is `SetupScreen`.
    - Confirm `/help` is the approved canonical path and no `/about` alias is required.
    - Confirm the public page must exclude `match.end.debug.*` and `DebugPwa`-related content even though they exist in the codebase/PRD notes.
  - During-implementation correctness checks:
    - After Step 2, verify all `help.page.*` keys exist in `en.ts`, `es.ts`, and `pt.ts` with matching structure and no missing-key fallbacks.
    - After Step 3, verify direct navigation to `/help` renders the shell, section nav, locale selector, and hero CTA without console/key errors.
    - After Step 4, compare the rendered sections and placeholder ids against the PRD checklist to ensure no public subsection was omitted.
    - After Step 6, verify `SetupScreen` uses page mode while `history`, `match/$id`, and `match/finish/$id` still use dialog mode.
    - After Step 7, verify the spotlight still marks itself seen correctly and the store badges continue using the existing placeholder hrefs.
  - Post-implementation regression checks:
    - Run targeted browser tests for `HelpLandingPage`, `AppHelpDialog`, `TopBar`, and `SetupScreen`.
    - Run the new or updated Playwright smoke flow covering setup page-entry vs non-setup modal-entry behavior.
    - Run `pnpm complete-check`.
    - Manually verify the page in English, Spanish, and Portuguese at a narrow mobile width and a desktop width.
  - Rollback/mitigation notes:
    - Highest-risk seam: the TopBar/AppHelpDialog entry-mode split. If regressions appear, revert setup to the default dialog mode first and keep `/help` isolated until the branch is corrected.
    - Secondary risk: locale-file sprawl. Mitigate by landing the exact same key structure in all three locale files before wiring the JSX so missing translations surface immediately.
    - Secondary risk: content omission due to PRD size. Mitigate by checking the page against the section list in this plan and the PRD feature inventory before calling the work complete.
