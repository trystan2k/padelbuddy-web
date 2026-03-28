# Product Requirements Document: Chair Umpire Audio Announcements

## 1. Overview

The goal of this feature is to expand the existing speech synthesis system to act as a "Chair Umpire" during an active padel match. Instead of generic score announcements, the app will use standard padel/tennis terminology to enhance immersion. Additionally, players will be given the ability to toggle audio announcements on or off directly from the Match Setup screen.

## 2. Problem Statement

- Currently, users must look at the screen to know the exact score, which disrupts the flow of the game.
- While basic speech synthesis exists, it lacks the professional feel of a real match (e.g., announcing "Deuce", "Golden Point", or "Correction" when a point is undone).
- There is no accessible way to disable the audio announcements before the match starts if players are in an environment where audio is unwanted.

## 3. Scope

**In Scope:**

- Updating the Match Setup domain to support an `audioAnnouncementsEnabled` flag.
- Updating the Setup Screen UI to display a toggle for this new flag.
- Enhancing the speech `message-generator.ts` with advanced umpire terminology.
- Updating the Active Match screen to respect the user's toggle preference.

**Out of Scope:**

- Custom voice selections or multi-language voice packs beyond what the browser's native SpeechSynthesis API provides.
- Live sound effects (e.g., clapping, ball hits).

## 4. Functional Requirements

### 4.1. Setup Screen & Match Domain

- **New Toggle:** Add an "Audio Announcements" toggle to the `MatchSetup` model (default: `true`).
- **UI Placement:** Place this new toggle _first_ in the Rules Card on the Setup Screen, immediately before the "Golden Point" option.
- **Scroll Behavior:** Update the Rules Card in the Setup Screen to use internal scrolling. This prevents the overall layout from overflowing and maintains fixed screen dimensions on smaller devices.

### 4.2. Umpire Speech Logic

- **Standard Scores:** Announce scores using proper padel terminology (e.g., "Fifteen - Love", "Thirty - All").
- **Deuce:** At 40-40 in Advantage mode, announce "Deuce" instead of "Forty - Forty".
- **Golden Point:** At 40-40 in Golden Point mode, announce "Golden Point" instead of "Forty - Forty".
- **Undo / Correction:** When a point is reverted (using the undo feature), the announcement must be prefixed with "Correction." (e.g., "Correction. Thirty - Fifteen").
- **Game / Break Points:** When a team is one point away from winning the game:
  - Append "Game point [Team Name]" if the serving team is winning the game.
  - Append "Break point" if the receiving team is winning the game.

### 4.3. Active Match Integration

- The `ActiveMatchScreen` must verify that `audioAnnouncementsEnabled` is `true` before triggering the speech service on score changes.
- If disabled, the match proceeds silently.

## 5. Non-Functional Requirements

- **Performance:** Speech generation must be near-instantaneous upon a score event.
- **Resilience:** The speech service should gracefully handle rapid button presses (e.g., canceling ongoing speech to announce the newest score).

## 6. Milestones & Slices

This feature will be implemented in a single vertical slice:

1. Update `MatchSetup` and validation logic.
2. Add the UI toggle and CSS scrolling fixes.
3. Enhance `message-generator.ts` and i18n locales.
4. Hook up the condition in `ActiveMatchScreen`.
