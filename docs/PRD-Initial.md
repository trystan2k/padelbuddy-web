# PRD: Padel Buddy Web App (Bluetooth & Touch)

**Version:** 1.8 (Final)

**Date:** March 2026

**Status:** Approved for Development

---

## 1. Overview

### 1.1 Product Summary

A web-based padel scoreboard application designed to be displayed on any device with a modern web browser during live matches. The score can be updated in real time via a paired Bluetooth HID remote (JinYue 3-button presenter) **or directly via touch/click controls**. The app provides clear visual updates, spoken voice announcements, and an "Endless Mode" for continued play.

### 1.2 Problem Statement

Tracking padel scores during a match is disruptive. While traditional apps require players to walk to a device and navigate a complex UI, this app solves the friction by allowing remote-control scoring from the court, while still offering an intuitive touch interface for users without hardware. Additionally, players often have court time left after a match ends and need a way to keep tracking score without setting up a new game.

### 1.3 Goals

* Display the current score of an ongoing padel match in a clear, at-a-glance format.
* Allow score updates via a handheld Bluetooth remote with zero screen interaction.
* Provide a standalone touch/click interface usable on any device.
* Announce scores aloud automatically using text-to-speech.
* Support the full padel scoring system (tiebreaks, Golden Point).
* Allow users to seamlessly continue playing indefinitely after the official match concludes.
* Build upon a highly scalable, lightweight, and strictly-typed web architecture hosted on the edge.

---

## 2. Users & Context

### 2.1 Target Users

* Recreational and semi-competitive padel players.
* Club coaches, referees, or spectators tracking a match.

### 2.2 Usage Context

* **Remote Mode:** Displayed on a tablet, phone, or laptop mounted courtside. Operator holds the Bluetooth remote and scores from a distance (up to 5 meters).
* **Touch Mode:** Device is placed on a bench or net-post mount. A player walks up and quickly taps the screen between points.
* Used outdoors or in well-lit indoor courts (high contrast required).

---

## 3. Scope

### 3.1 In Scope

* Full padel scoring logic (points → games → sets → match).
* Real-time score display with a fully responsive layout.
* Dual Input Methods: Bluetooth HID remote AND on-screen touch/click targets.
* Voice announcements of the score via Web Speech API.
* Deep Undo functionality via remote or on-screen button.
* Golden Point (Punto de Oro) vs. Standard Advantage toggle.
* Automatic tiebreak serve tracking.
* Match reset and `localStorage` state persistence.
* Post-Match Endless Mode ("Continue playing").

### 3.2 Out of Scope

* User accounts or authentication.
* Match history databases.
* Multi-device sync or spectator broadcast.

---

## 4. Padel Scoring Rules

The app implements standard padel scoring logic:

* **Points progression:** 0 → 15 → 30 → 40 → Game.
* **Deuce (40-40) Logic:** Based on user setup selection:
* *Advantage:* 2 consecutive points required (Advantage → Game).
* *Golden Point:* The next single point wins the game.


* **Games:** First to 6 games wins the set (requires a 2-game lead).
* **Tiebreak:** Triggered at 6-6. First to 7 points (requires a 2-point lead).
* **Serve Tracking:** Alternates every game, or mathematically shifts during tiebreaks.
* **Sets & Endless Mode:** Matches are officially Best of 1 or 3 sets. When the limit is reached, the match ends. If users select "Continue playing", the set limit is removed, and sets continue to accumulate indefinitely following the exact same rules.

---

## 5. Input Methods (Remote & Touch)

The application state responds identically whether an action is triggered by the remote or a screen interaction.

### 5.1 Bluetooth Remote Mapping (JinYue Presenter)

| Button | Key Sent Aliases | Action |
| --- | --- | --- |
| **`<` (Left)** | `ArrowLeft` / `PageUp` | +1 point → Team 1 |
| **`>` (Right)** | `ArrowRight` / `PageDown` | +1 point → Team 2 |
| **`↩` (Bottom)** | `Backspace` / `Escape` / `Media` | Undo last action |

*Inputs must be debounced at 300ms.*

### 5.2 Touch/Click Interface Mapping

| On-Screen Element | Action |
| --- | --- |
| **Tap/Click Team 1's Score Area** | +1 point → Team 1 |
| **Tap/Click Team 2's Score Area** | +1 point → Team 2 |
| **Tap/Click "Undo" Button** | Undo last action |

---

## 6. Functional Requirements

### 6.1 Match Setup

* Configure: Team Names, Number of Sets, Serving Team, Scoring Mode.
* **Audio Initialization:** Clicking/Tapping "Start Match" triggers a silent `speechSynthesis` utterance to unlock the browser's autoplay audio context.

### 6.2 Score Display & Feedback

* **Touch Targets:** Active score digits must be large and wrapped in interactive handlers (`<button>`).
* **Serving Indicator:** A clear visual element (e.g., a tennis ball icon).
* **Visual Feedback:** Score numbers briefly pulse or flash on update to confirm input.
* **Voice Announcements:** Speaks the score after a brief (~200ms) visual update delay.

### 6.3 Match Control & State Management

* **Deep Undo:** Restores the exact previous match state, returning the serve indicator to its previous position.
* **Persistence:** Match state saved synchronously to `localStorage`. Survives tab closures.
* **Match Over / Continue Playing:** Displays a winner screen with an option to remove the set limit and keep playing.

---

## 7. Non-Functional Requirements

### 7.1 Platform & Layout

* **Target:** Any device with a modern web browser.
* **Responsive Design:** Scales cleanly from smartphones to large laptops. Prioritizes landscape mode.
* **Prevention of Accidental Zoom:** Disable double-tap-to-zoom (`touch-action: manipulation;`).

### 7.2 Performance & Reliability

* **Offline Capable:** PWA / Service Workers for fully offline capability.
* **Screen Wake Lock:** Implement `navigator.wakeLock.request('screen')` to prevent the device from sleeping.

---

## 8. Tech Stack

| Layer | Choice | Rationale |
| --- | --- | --- |
| **Framework** | TanStack Start | Modern, type-safe full-stack React framework optimized for the web. |
| **Language** | TypeScript | Strict typing for complex state machines (scoring logic). |
| **UI Components** | Base UI | Unstyled, fully accessible headless React components for rapid, custom-designed UI elements. |
| **Styling** | CSS Modules | Locally scoped CSS, preventing class name collisions and providing a clean separation of concerns. |
| **State Management** | React `useReducer` | Handles the complex synchronous padel state logic and deep Undo history stack natively. |
| **Tooling & Linting** | Biome | Ultra-fast combined linter and formatter, replacing Prettier/ESLint. |
| **Testing** | Vitest & Playwright | Vitest for isolated scoring engine logic; Playwright for E2E browser testing. |
| **Git Workflow** | Husky, Lint-staged, Commitlint | Enforces clean, conventional commits and ensures code is formatted/linted before committing. |
| **CI/CD & Hosting** | Cloudflare Pages & GitHub Actions | GitHub Actions handles testing and release; Cloudflare Pages serves the static SPA instantly from the global edge. |