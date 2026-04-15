# PRD: Institutional / Help / Landing Page

## Overview

This document defines the content and structure for the Institutional / Help / Landing page of Padel Buddy Web. The objective is to explain the app in simple language for players of all levels, while also documenting every user-facing feature currently present in the product.

This page should work as:

- a **landing page** for new users,
- a **help center** for users who want to understand every rule and option,
- an **institutional page** that explains the value of the app, the available platforms, and how the project differs across Web, PWA, and native apps.

The final implementation should be friendly, practical, non-technical, and complete enough to cover essentially the full current feature set visible in the product, code workflow, localized copy, and E2E scenarios.

### Content Objectives

- **Primary audience:** padel players of any level, including users who are not technical.
- **Primary goal:** explain what the app does, how to use it, and why specific features matter during a real match.
- **Tone:** clear, friendly, practical, and confident.
- **Writing style:** short paragraphs, simple vocabulary, low jargon, concrete examples.
- **Important note:** internal or debug-only capabilities may be documented in this PRD for completeness, but they should not be treated as public-facing page content unless explicitly approved.

---

## Proposed Public Page Content

### 1. What is Padel Buddy?

**Goal:** Explain the app in one quick, easy-to-understand section.

- **Padel Buddy is a score tracker made specifically for padel.**
  It helps you track points, games, sets, and match progress in real time.
- **It is designed for real use on court.**
  The interface is large, visual, and fast to use on a phone or tablet while you play.
- **It helps you focus on the match, not on the math.**
  The app handles scoring rules, serve tracking, side-switch reminders, tiebreak logic, match summaries, and history automatically.
- **It also supports remote control usage.**
  You can keep the phone on the bench and control scoring using compatible Bluetooth clickers, keyboard-style remotes, or media buttons, depending on your device and setup.

_Placeholder: [Image: Hero image showing a phone on a bench beside the court with Padel Buddy open during a live match. Optional second object: a small Bluetooth presenter remote beside it. How to obtain: capture a real device running the app on the active match screen in landscape mode on court. Caption: “Keep the score without leaving the game.”]_

---

### 2. The Main Flow of the App

**Goal:** Explain the complete user journey from start to finish.

Padel Buddy is organized around three main screens:

1. **Setup Screen** – where you prepare the match.
2. **Live Match Screen** – where you track points during the game.
3. **Match End Screen and History Screen** – where you review, share, continue, or replay matches.

There is also built-in recovery logic so the app can restore a saved match if the browser or app closes unexpectedly.

_Placeholder: [Image: Simple three-step flow illustration: Setup → Live Match → Match End / History. How to obtain: design illustration or combined screenshots from the three screens. Caption: “From setup to summary in a simple flow.”]_

---

### 3. Setting Up a Match

**Goal:** Explain every option available before the match starts.

#### 3.1 Team Names

- You can enter a custom name for each team.
- If you do not change them, the app starts with default names similar to **Team A** and **Team B**.
- The last used team names can be remembered locally on the device, making repeated use faster.
- The **Play Again** feature from history can also pre-fill these names automatically.

#### 3.2 Match Format

- You can choose between:
  - **Best of 1**
  - **Best of 3**
  - **Best of 5**
- This determines how many sets can be played and how many sets are needed to win the match.

#### 3.3 Golden Point or Advantage

- **Advantage mode** follows the traditional scoring logic.
  At 40-40, a team must win two points in a row to close the game.
- **Golden Point mode** removes advantage.
  At 40-40, the very next point decides the game.

This is one of the most important setup options because it changes how close games are decided.

#### 3.4 Super Tiebreak

- The app supports **Super Tiebreak** as a deciding-set option.
- A super tiebreak is played to **10 points**, and a team still needs to win by **2 points**.
- In the current setup flow, this option is shown for **Best of 3** and **Best of 5** matches.
- If enabled, it replaces the normal deciding set with a super tiebreak.

#### 3.5 First Server

- You can choose which team serves first.
- This is especially useful when you want the app to correctly show serve rotation from the first point.
- If the **Serving Indicator** feature is disabled, the first server selector is visually disabled too, because serve highlighting is not being used.

#### 3.6 Serving Indicator

- When enabled, the app visually highlights the team that is serving.
- This changes the appearance of the serving team card so it is easy to identify from a distance.
- It is one of the less obvious but most practical visual aids in the app.

#### 3.7 Side-Switch Prompts

- When enabled, the app reminds players when it is time to switch sides.
- These prompts appear automatically based on match state.

#### 3.8 Countdown Timer

- You can enable a countdown timer if your court booking or training session has a time limit.
- Available durations are currently:
  - **1:00 h**
  - **1:30 h**
  - **2:00 h**
- When the countdown is disabled, the top timer behaves like a live time-of-day clock.
- When enabled, it shows **remaining match time**.

#### 3.9 Audio Announcements

- You can enable spoken announcements so the app reads out score updates.
- This is useful when players do not want to keep looking at the screen.
- The app uses the voices available on the device itself.

#### 3.10 Voice Selection

- When audio announcements are enabled, a voice setup option becomes available.
- You can preview voices before saving your choice.
- Voices are grouped by language/locale when available.
- The selected voice is saved locally for future matches.

#### 3.11 Remote Controller Setup

- The setup screen includes a dedicated **Remote Controller** configuration flow.
- Users can configure keyboard-like buttons for:
  - Score Team 1
  - Revert Team 1
  - Score Team 2
  - Revert Team 2
- The UI also shows the fixed media-button mappings used by supported devices.
- There are controls to:
  - save settings,
  - cancel,
  - clear bindings,
  - reset to defaults.

#### 3.12 Language Selector

- The main setup screen includes a language selector.
- The app supports **English, Spanish, and Portuguese**.
- Team name defaults and other translated labels update according to the selected language.

#### 3.13 History Shortcut

- From the setup screen, users can open **Match History** directly.
- This makes the setup screen the main hub of the app.

#### 3.14 Store Buttons on Web/PWA

- On non-native versions, the setup screen also shows store badges/buttons pointing users toward the mobile app versions.

_Placeholder: [Image: Full screenshot of the setup screen with labels calling out Team Names, Match Format, Golden Point, Serving Indicator, Side-switch Prompts, Countdown Timer, Super Tiebreak, Voice Setup, Remote Setup, History button, and Start Match button. How to obtain: capture the setup screen on web with audio enabled so the voice setup shortcut is visible. Caption: “Everything you need before the first point.”]_

---

### 4. Live Match Screen: What Happens During the Match

**Goal:** Explain every visible and subtle feature while scoring is in progress.

#### 4.1 Large Score Panels

- Each team has a large tappable score panel.
- Tapping a team panel adds one point to that team.
- The layout is optimized for fast use in landscape mode.

#### 4.2 Serving Indicator

- When enabled, the serving team is highlighted.
- This is not only useful visually; it also affects how certain spoken score messages are phrased.

#### 4.3 Per-Team Undo Buttons

- Each team has its own **Revert point** button.
- These buttons only become active after that team has at least one scored point in the action history.
- Undo works beyond simple point rollback:
  - it can rewind game boundaries,
  - it can restore a 1-0 game score back to 0-0 and return the point score to 40,
  - it restores serve and scoring state consistently.

#### 4.4 Automatic Scoring Rules

- The app automatically applies the selected scoring rules.
- It handles:
  - normal point progression,
  - deuce,
  - advantage,
  - golden point,
  - standard tiebreak,
  - deciding-set super tiebreak.

#### 4.5 Deuce and Advantage

- In **Advantage** mode, a team must gain a two-point edge after 40-40 to win the game.
- The app correctly shows and clears **Advantage** when points swing back and forth.

#### 4.6 Golden Point Logic

- In **Golden Point** mode, there is no advantage.
- When both teams reach 40-40, the very next point wins the game immediately.

#### 4.7 Standard Tiebreak at 6-6

- When a set reaches **6-6**, the app enters a standard tiebreak.
- The tiebreak goes to **7 points**, win by **2**.
- If the set ends through that tiebreak, the final set score is shown as **7-6**.

#### 4.8 Deciding-Set Super Tiebreak

- If enabled, the deciding set becomes a **super tiebreak to 10**, win by 2.
- On the final summary and in history, that deciding set is represented using tiebreak points instead of normal game count.

#### 4.9 Side-Switch Prompts

- The app can show a modal prompt telling players to switch sides.
- This can happen:
  - after **odd total games** in a set,
  - at **tiebreak intervals**.
- The prompt has a **Switched** confirmation button.
- It also **auto-hides after 10 seconds**, so players are not forced to return to the phone immediately.

#### 4.10 Match Timer / Clock

- The top bar always shows a time display.
- If countdown is **disabled**, it shows the current clock time.
- If countdown is **enabled**, it shows the remaining time in **HH:MM:SS** format.

#### 4.11 Finish Match Action

- The live match screen includes a **Finish Game** action.
- This allows the user to end a match manually, even if official match-winning conditions were not reached.
- This is useful in real-life situations such as:
  - time running out,
  - injury,
  - players stopping early,
  - friendly matches being ended before the official finish.

#### 4.12 Automatic Route to Match End

- If the official winning condition is reached, the app automatically navigates to the match-finished screen.

#### 4.13 Rotation Blocker in Portrait Mode

- On phones in portrait mode, the live match screen shows a **Rotate your device** blocker.
- This is intentional: the scoring screen is designed to work best in landscape.

#### 4.14 Compact-Height Fullscreen-Like Behavior

- On very short landscape screens, the app reduces distractions.
- After **5 seconds of inactivity**, the footer controls auto-hide.
- An **Exit fullscreen** button appears so the user can bring controls back.
- Score controls themselves are ignored by this timer so normal scoring remains smooth.

#### 4.15 Wake Lock Support

- The app requests a screen wake lock when possible so the screen is less likely to turn off during a match.
- This is especially useful in on-court scenarios.

#### 4.16 Keyboard / Remote / Media Button Scoring

- The live match screen supports multiple control methods:
  - direct taps on the screen,
  - keyboard mappings,
  - Bluetooth remotes that act like keyboard input,
  - media track buttons on supported devices/platforms.

#### 4.17 Double-Press Revert Logic for Media Buttons

- For supported media-button remotes:
  - **Previous Track single press** scores Team 1
  - **Previous Track double press** reverts Team 1
  - **Next Track single press** scores Team 2
  - **Next Track double press** reverts Team 2
- This buffering happens inside a short time window so accidental double-taps can be interpreted correctly.

#### 4.18 Speech During Live Scoring

- If audio announcements are enabled, the app announces scoring events automatically.
- Depending on context and verbosity, it can announce:
  - regular score calls,
  - deuce,
  - golden point,
  - advantage,
  - game point,
  - break point,
  - set point,
  - match point,
  - game won,
  - set won,
  - match won,
  - correction after undo.

#### 4.19 Minimal / Standard / Verbose Behavior

- The product includes support for **Minimal**, **Standard**, and **Verbose** speech verbosity levels.
- This affects how much detail spoken announcements contain.
- Even if not all verbosity controls are currently exposed prominently in the setup UI, the feature exists in the app’s speech preferences and behavior.

_Placeholder: [Image: Live match screen in landscape with Team 1 on 40, Team 2 on 30, Team 1 serving, timer visible, set overlay visible, undo buttons visible, finish button visible. How to obtain: start a best-of-3 match, enable serving indicator, score into a mid-game state, and take screenshot in landscape. Caption: “Big controls, clear scoring, and match context at a glance.”]_

_Placeholder: [Image: Side-switch modal open on top of the live match screen. How to obtain: enable side-switch prompts, win the first game of a set, and capture the modal before it auto-hides. Caption: “The app reminds players when it is time to switch sides.”]_

_Placeholder: [Image: Portrait-mode rotate blocker on a phone viewport. How to obtain: open a live match on a portrait phone-sized screen. Caption: “The live match screen is optimized for landscape play.”]_

---

### 5. Match End Screen

**Goal:** Explain what users see when the match ends and the different ways a match can finish.

#### 5.1 Winner Card

- When the match has a winner, the app highlights the winning team.
- If the match was manually finished without a clear winner, the app can show a **finished early / no winner (tie)** state.

#### 5.2 Set Summary

- The match end screen shows a set-by-set summary.
- Standard sets are shown with normal game totals.
- Super tiebreak deciding sets are shown with their final super tiebreak points.

#### 5.3 Match Statistics

- The screen shows:
  - **match length**,
  - **total games played**.

#### 5.4 Spoken Result Announcement

- If audio announcements are enabled, the app announces the result once on the end screen.
- It can announce either a victory or a tied/unfinished result.

#### 5.5 Share Action

- The match end screen includes a share button in the top bar.
- The app generates a share image containing:
  - winner,
  - match format,
  - set-by-set score,
  - match duration,
  - date.
- If the browser/device supports native file sharing, the app uses it.
- If not, it falls back to downloading the image.

#### 5.6 New Match Button

- Users can clear the current finished match and immediately return to setup.

#### 5.7 Continue Button

- Users can continue playing even after the match has already been completed.
- This is especially useful for casual play where players want to keep scoring after the official result.
- The app preserves the elapsed time when doing this and resumes on the active match route.

#### 5.8 Internal Note: Debug Share Preview

- In development/debug contexts, there is an internal share preview helper for the generated share screen.
- This is included here for completeness, but it should not appear on the public-facing page unless explicitly approved.

_Placeholder: [Image: Match end screen showing winner card, summary card, duration, total games, share button, New Match button, and Continue button. How to obtain: complete a match normally and capture the finish screen. Caption: “Review the result, share it, or keep playing.”]_

_Placeholder: [Image: Generated share image with winner, set scores, date, and duration. How to obtain: complete a match and use the share feature; if native sharing is unavailable, use the downloaded image. Caption: “A ready-to-share match result image.”]_

---

### 6. Match History

**Goal:** Explain what is stored and what can be done with past matches.

#### 6.1 Automatic Local Storage of Finished Matches

- Completed matches are automatically stored on the device.
- Storage is local to the device/browser.

#### 6.2 100-Match Limit

- The app stores the **last 100 finished matches**.
- If more matches are saved, the oldest ones are removed automatically.

#### 6.3 History Table Information

- Each history entry shows:
  - team names,
  - date,
  - sets score,
  - games score,
  - actions.

#### 6.4 Winner Highlighting

- Winning teams are visually emphasized in the history list.

#### 6.5 Finished-Early Indicator

- If a stored match ended early or did not produce a normal winner, the sets score is marked with an asterisk.

#### 6.6 Share from History

- Users can generate a share result from a past match at any time.
- This is useful if they forgot to share it immediately after the match.

#### 6.7 Delete from History

- Users can delete a match from history.
- The app asks for confirmation before deletion.

#### 6.8 Play Again

- Users can start a rematch from a history entry.
- The app returns to setup and automatically pre-fills the two team names from that historical match.

#### 6.9 Back to Home

- The history screen includes a back action to return to setup/home.

#### 6.10 Empty State

- If there are no finished matches yet, the app shows a friendly empty state instead of an empty table.

_Placeholder: [Image: History screen with multiple records showing winners, dates, set scores, games, share icon, delete icon, and Play Again button. How to obtain: seed or play several matches, then open history. Caption: “Your recent matches stay easy to review, share, and replay.”]_

_Placeholder: [Image: History empty state. How to obtain: clear history records and open /history. Caption: “No finished matches yet.”]_

---

### 7. Recovery, Safety, and Reliability Features

**Goal:** Explain the invisible features that protect the user experience.

#### 7.1 Automatic Current-Match Persistence

- During a live match, the current state is saved automatically.
- If the browser tab closes, the app restarts, or the session is interrupted, the match can usually be restored.

#### 7.2 Resume Saved Match Prompt

- If an in-progress match exists, the app does not jump straight back in silently.
- Instead, it asks the user whether they want to:
  - **Resume match**, or
  - **Discard match**.

#### 7.3 Corrupt Match Recovery

- If saved match data becomes unreadable, the app can detect that and show a recovery flow.
- The user can reset the saved match and continue safely.

#### 7.4 Schema-Mismatch Reset Notice

- If a saved match belongs to an incompatible older schema, the app can automatically reset it.
- When that happens, the user is shown a one-time notice explaining that the old saved match was cleared.

#### 7.5 Friendly Error Redirection

- If a user tries to open an invalid, missing, or corrupt match route, the app redirects or shows recovery-oriented messages instead of a raw crash.

#### 7.6 Route Loading Feedback

- The app includes route-level loading feedback/spinners so transitions feel smooth while screens load.

_Placeholder: [Image: Resume saved match dialog with Resume and Discard buttons. How to obtain: seed or interrupt an in-progress match, reopen the app, and capture the dialog. Caption: “You can safely continue where you left off.”]_

_Placeholder: [Image: Saved match recovery / reset screen for corrupt data. How to obtain: seed invalid current-match data and load the app. Caption: “If stored data becomes invalid, the app guides you back safely.”]_

---

### 8. Help System Inside the App

**Goal:** Explain that the app already contains a built-in help experience.

#### 8.1 Help Button in the Top Bar

- The top bar includes a help trigger.
- Users can open an in-app help dialog from there.

#### 8.2 First-Visit Help Spotlight

- On first visit, the app can highlight the help button with a spotlight/tutorial-style popover.
- This spotlight is stored locally so it does not keep appearing every time.

#### 8.3 Current Built-In Help Content

- The existing help dialog already explains the main app flow and promotes mobile apps / PWA installation.
- The new landing/institutional page should expand and formalize this help content.

_Placeholder: [Image: Help spotlight highlighting the help icon in the top bar. How to obtain: open the app in a fresh browser/profile where the spotlight has not yet been marked as seen. Caption: “New users are guided toward the help area.”]_

---

### 9. Languages and Accessibility

**Goal:** Explain the app’s inclusive design.

- The app supports **English**, **Spanish**, and **Portuguese**.
- Labels, prompts, and help copy are localized.
- The app is built with accessibility in mind and uses semantic structure, dialog accessibility, ARIA labels, live regions, and readable interaction patterns.
- Important accessibility-oriented behaviors include:
  - screen-reader-friendly labels for scoring actions,
  - spoken live updates for scores,
  - accessible dialogs for help, recovery, side-switch prompts, and rotate blocker,
  - keyboard-friendly navigation in setup controls such as countdown duration selection.

---

### 10. PWA, Offline Use, Web, and Native Apps

**Goal:** Explain how users can access the app and what changes between versions.

#### 10.1 Web Version

- The app works directly in the browser.
- No installation is required.
- The web version may include advertisements.

#### 10.2 PWA (Progressive Web App)

- Padel Buddy can be installed as a PWA.
- Once installed, it behaves more like an app and supports offline use.
- The manifest is configured so the app can launch in standalone mode.
- This is ideal for court use where connectivity may be unstable.

#### 10.3 How to Install the PWA

- **On iPhone/iPad (Safari):** open the Share menu and tap **Add to Home Screen**.
- **On Android (Chrome or compatible browser):** open the browser menu and choose **Install App** or **Add to Home Screen**.

#### 10.4 Offline Use

- The PWA can work offline during matches.
- This is one of the most valuable features for players on court.

#### 10.5 Native Mobile Apps

- Padel Buddy is also available as a native app experience through mobile stores.
- The app promotes **Google Play** and **App Store** versions.
- The mobile apps do **not** contain advertisements.
- Native apps may receive additional platform-specific features in the future.

#### 10.6 Android License / Store-Origin Protection

- On Android native builds, there is also product logic to verify allowed installation/license state.
- In practice, the app may require installation from Google Play in certain native distribution scenarios.
- This is mainly a platform/distribution detail, but it is part of the current product behavior.

#### 10.7 Ads Difference Between Versions

- **Web / PWA:** may contain advertisements.
- **Native store apps:** currently positioned as ad-free.

#### 10.8 Internal Note: Developer PWA Debug Tools

- In development environments, the app includes a PWA debug panel to inspect service worker readiness, version, cache, update behavior, and cache clearing.
- This is included here for completeness, but it should stay out of public-facing copy unless explicitly approved.

_Placeholder: [Image: Comparison visual with Browser, Installed PWA, and Native App columns. Include “Works offline”, “Install from browser”, “Available in stores”, and “Ads / No ads” differences. How to obtain: design composite asset based on documented behavior. Caption: “Use Padel Buddy the way that fits you best.”]_

---

### 11. Small But Important Details to Explain Clearly

**Goal:** Capture the subtle features that users may miss.

- The serving team can be recognized by the **background color change** in the team score card.
- The side-switch reminder **does not stay forever**; it auto-hides after 10 seconds.
- The live match screen is meant for **landscape use** on phones.
- The app can **resume an interrupted match** instead of making the user start over.
- The match can be **finished manually** before official completion.
- A finished match can also be **continued** for extra play.
- Audio voices depend on the **device**, not on the app itself.
- Spoken announcements can describe advanced states like **deuce**, **golden point**, **advantage**, **break point**, **set point**, and **match point**.
- Undo is not just visual; it restores the real underlying match state correctly.
- Match history is limited to the **most recent 100 finished matches**.
- Sharing can happen **right after the match** or **later from history**.
- The app can work **offline** when installed as a PWA.
- The setup screen remembers several preferences locally, such as team names and rule settings.
- The first-visit spotlight helps new users discover the built-in help action.

---

## Editorial Guidance for the Final Page

Use these rules when transforming this PRD into the final page:

- Lead with **benefits first**, then explain the underlying feature.
- Prefer **plain-language explanations** over technical terminology.
- When a feature is easy to miss, explain it with both **text and a screenshot**.
- Prefer wording like **"what happens"** and **"why it helps"** over implementation detail.
- Keep **internal/dev-only details** out of the public page unless they are intentionally part of support documentation.
- Where possible, explain rules with **real match examples**, especially for golden point, tiebreaks, super tiebreaks, undo, and match recovery.

---

## Screenshot / Media Placeholder List

The final page should include image placeholders with enough detail for future capture work. Suggested assets:

1. **Hero / on-court usage shot**
2. **Setup screen full overview**
3. **Remote configuration modal**
4. **Voice selection modal with grouped voices**
5. **Live match screen with serving indicator enabled**
6. **Side-switch prompt modal**
7. **Portrait rotate-device blocker**
8. **Match end screen**
9. **Generated share image**
10. **History screen with records**
11. **History empty state**
12. **Resume saved match dialog**
13. **Corrupt saved match recovery screen**
14. **Help spotlight / help dialog**
15. **Web vs PWA vs Native comparison graphic**

For each capture, prefer realistic team names and realistic match states rather than placeholder-only empty screens.

---

## Feature Inventory Checklist

Use this section as a coverage checklist before implementing the final page. The goal is that the future institutional/help page should explain every meaningful end-user feature below.

### Core Product Purpose

- [ ] Explain that Padel Buddy is a padel-specific live score tracker
- [ ] Explain that it is designed for courtside use on phone/tablet
- [ ] Explain that it reduces scorekeeping friction so players can focus on the match

### Setup Screen Features

- [ ] Team 1 and Team 2 name entry
- [ ] Default team names
- [ ] Remembered team names across sessions
- [ ] Match format: Best of 1
- [ ] Match format: Best of 3
- [ ] Match format: Best of 5
- [ ] Golden Point toggle
- [ ] Advantage mode behavior
- [ ] First server selection
- [ ] Serving Indicator toggle
- [ ] Explanation that first-server selection is tied to serving-indicator usage
- [ ] Side-switch prompts toggle
- [ ] Countdown timer toggle
- [ ] Countdown timer durations: 1:00 h / 1:30 h / 2:00 h
- [ ] Super Tiebreak toggle for Best of 3 / Best of 5
- [ ] Audio announcements toggle
- [ ] Voice setup / preview flow
- [ ] Remote configuration access from setup
- [ ] History shortcut button
- [ ] Language selector
- [ ] Store buttons shown on web/non-native builds

### Remote / Input Features

- [ ] Bluetooth HID / presenter remote support
- [ ] Keyboard mapping support
- [ ] Default keyboard bindings
- [ ] Custom binding capture flow
- [ ] Clear bindings action
- [ ] Reset defaults action
- [ ] Save/cancel remote configuration flow
- [ ] Media button support
- [ ] Previous Track single press = Team 1 score
- [ ] Previous Track double press = Team 1 revert
- [ ] Next Track single press = Team 2 score
- [ ] Next Track double press = Team 2 revert

### Live Match Features

- [ ] Large tappable score panels
- [ ] Per-team undo buttons
- [ ] Finish Game action
- [ ] Top timer display
- [ ] Live time-of-day mode when countdown is off
- [ ] Countdown remaining-time mode when countdown is on
- [ ] Sets overlay/card
- [ ] Automatic navigation to finish screen when match is completed
- [ ] Serving Indicator visual behavior
- [ ] Side-switch prompt modal
- [ ] Side-switch auto-hide after 10 seconds
- [ ] Rotate-device blocker in portrait phone mode
- [ ] Compact-height control auto-hide after inactivity
- [ ] Exit fullscreen / restore controls action
- [ ] Wake lock behavior to help keep the screen awake

### Scoring Rules and Edge Cases

- [ ] Normal point progression
- [ ] Deuce behavior
- [ ] Advantage behavior
- [ ] Golden Point behavior at 40-40
- [ ] Standard tiebreak at 6-6
- [ ] Standard tiebreak target of 7, win by 2
- [ ] Deciding-set super tiebreak target of 10, win by 2
- [ ] Set score shown as 7-6 after normal tiebreak
- [ ] Super tiebreak result shown using tiebreak points on summaries/history
- [ ] Undo restoring state across game boundaries

### Audio / Speech Features

- [ ] Audio announcements during live play
- [ ] Device-provided voices only
- [ ] Voice preview before accepting selection
- [ ] Stored selected voice
- [ ] Support for Minimal verbosity
- [ ] Support for Standard verbosity
- [ ] Support for Verbose verbosity
- [ ] Spoken deuce
- [ ] Spoken golden point
- [ ] Spoken advantage
- [ ] Spoken game point
- [ ] Spoken break point
- [ ] Spoken set point
- [ ] Spoken match point
- [ ] Spoken correction after undo
- [ ] Spoken final result on match end

### Match End Features

- [ ] Winner card
- [ ] Finished-early / no-winner state
- [ ] Set-by-set summary
- [ ] Match duration display
- [ ] Total games display
- [ ] Share action from match end
- [ ] Native share when supported
- [ ] Download fallback when native share is unavailable
- [ ] New Match action
- [ ] Continue action after official completion

### Match History Features

- [ ] Automatic saving of completed matches
- [ ] Local-only storage explanation
- [ ] Last 100 matches limit
- [ ] History table with teams/date/sets/games/actions
- [ ] Winner highlighting in history
- [ ] Finished-early asterisk marker
- [ ] Share from history
- [ ] Delete from history
- [ ] Delete confirmation behavior
- [ ] Play Again with pre-filled team names
- [ ] Back to home/setup from history
- [ ] Empty state when no matches exist

### Recovery / Resilience Features

- [ ] Automatic current-match persistence
- [ ] Resume saved match dialog
- [ ] Discard saved match action
- [ ] Corrupt saved match recovery flow
- [ ] Schema mismatch / auto-reset notice
- [ ] Friendly invalid/missing match recovery behavior
- [ ] Route loading / pending feedback

### Help / Guidance Features

- [ ] Help trigger in top bar
- [ ] Built-in help dialog
- [ ] First-visit spotlight for help button
- [ ] Spotlight stored as seen so it does not keep repeating

### Language / Accessibility Features

- [ ] English support
- [ ] Spanish support
- [ ] Portuguese support
- [ ] Screen-reader-friendly labels
- [ ] Accessible dialogs and modal behavior
- [ ] Keyboard-friendly controls where relevant

### Web / PWA / Native Distribution Features

- [ ] Browser/web usage explanation
- [ ] PWA explanation
- [ ] PWA install instructions for iOS
- [ ] PWA install instructions for Android
- [ ] Offline support explanation
- [ ] Ads in web/PWA explanation
- [ ] App Store / Google Play availability explanation
- [ ] No-ads positioning for native apps
- [ ] Possible native-only future features explanation
- [ ] Android Google Play / license gate note

### Internal / Non-Primary Features to Decide Whether to Mention Publicly

- [ ] Developer-only PWA debug panel
- [ ] Internal debug share preview

---

## Screenshot Coverage Review and Content Gaps

This section identifies what is already covered well in the PRD, what still needs visual support, and what may need product decisions before the final page is implemented.

### Well Covered in Text, But Still Needs Screenshots

- [ ] Setup screen full overview
- [ ] Live match screen with serving indicator enabled
- [ ] Side-switch prompt modal
- [ ] Match end screen
- [ ] History screen populated with records
- [ ] Resume saved match dialog
- [ ] Help spotlight/help dialog
- [ ] Web vs PWA vs Native comparison visual

### Important Features That Need Dedicated Visuals Because They Are Easy to Miss

- [ ] Remote configuration modal
- [ ] Voice selection modal
- [ ] Portrait rotate-device blocker
- [ ] History empty state
- [ ] Corrupt-data recovery screen
- [ ] Share image result artifact
- [ ] Countdown timer visible on live match screen
- [ ] Continue-after-finish behavior (may need either screenshot or explanatory note)

### Content Gaps / Decisions Still Worth Making Before Implementation

- [ ] Decide whether the institutional page should mention **debug-only/internal tools** or keep them out of public-facing copy
- [ ] Decide how deeply to explain **verbosity levels**, since they exist in the product but may not yet be clearly exposed in the setup UI
- [ ] Decide whether to include a short explanation about **Android license / Google Play verification** on a public page or keep that for support/help only
- [ ] Decide whether the landing/help page should mention **advertisements** in a dedicated FAQ-style section for clarity
- [ ] Decide whether to explain **privacy / local storage** explicitly (for example: match history is stored locally on the device/browser)
- [ ] Decide whether screenshots should use realistic player/team names or neutral examples like Team A / Team B
- [ ] Decide whether to include actual store links/placeholders on the future page or only descriptive copy

### Recommended Additional Assets to Prepare Before Implementation

- [ ] A polished hero image for the top of the page
- [ ] One clean annotated setup screenshot
- [ ] One clean annotated live-match screenshot
- [ ] One share-result image exported from the app
- [ ] One history screenshot with at least 3 records
- [ ] One comparison graphic for Browser vs PWA vs Native app

### Recommended Final QA Pass Before Building the Page

- [ ] Re-read all current user-facing i18n strings and confirm nothing visible was missed
- [ ] Re-check E2E happy paths and edge cases after any new feature merges
- [ ] Confirm whether any hidden/internal features should remain excluded from public copy
- [ ] Confirm screenshots match the latest design tokens and UI styling

---

## Technical Implementation Notes

- The future page implementation should strictly follow the design tokens from `docs/design/padelbuddyweb.pen`.
- The content should be structured so it can later be localized into the app’s three supported languages.
- The content should be easy to split into sections/cards/anchors because users may want to jump directly to topics like scoring, history, PWA install, or remote setup.
- Images should be responsive and optimized.
- The implementation should prioritize readability on mobile first, since many users will read this page on their phones.
- The final public page should prioritize **end-user value and clarity**; debug/internal items documented in this PRD should remain optional and support-only unless explicitly approved for publication.
