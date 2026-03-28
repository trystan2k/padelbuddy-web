## Overview

### Context

During a padel match, players or referees often cannot easily interact with a phone/tablet screen due to sweat, distance, or convenience. Supporting inexpensive Bluetooth remote controllers (which pair at the OS level and act as Bluetooth keyboards/media buttons) allows users to seamlessly add or revert scores without touching the device. This greatly enhances the on-court user experience.

### Task Description

Implement a customizable global keyboard event listener on the active game screen to support Bluetooth remote controllers.

The feature must include:

1. **Key Mapping UI**: A configuration modal/drawer where users can assign physical button presses to four specific actions: Add Team A, Revert Team A, Add Team B, Revert Team B.
2. **Action Engine**: A listener that triggers the score updates based on the mapped keys.
3. **Software Double-Click Detection**: To support simple 2-button controllers, the app must detect double-clicks on the "Add" buttons. If a user double-clicks the button mapped to "Add Team A" within a ~400ms window, it should execute "Revert Team A" instead.
4. **Local Persistence**: Save the configured key mappings in local storage so the user doesn't have to remap their controller every time they open the app.

## Planning

### Depends On

- None (Assumes the active game screen and scoring engine are already implemented)

### Risk

**Level**: Medium

**Explanation**:
Handling global keyboard events on mobile web browsers can be tricky, especially with media keys (like Volume Up/Down). Some OS-level events cannot be perfectly overridden (e.g., volume might still change on the phone). Additionally, handling the double-click logic requires careful timing so the UI doesn't feel laggy or cause score "flashing" (adding a point and immediately removing two).

## Requirements

### Acceptance Criteria

- [ ] A "Remote Configuration" UI is accessible from the active game screen (or match settings).
- [ ] The user can focus an input/action and press a physical button on their remote to bind it to: Add Team A, Revert Team A, Add Team B, Revert Team B.
- [ ] The key mappings are persisted across app reloads via LocalStorage or similar persistent store.
- [ ] On the active game screen, pressing a mapped key triggers the correct scoring action.
- [ ] If the user double-clicks (two presses within ~400ms) a key mapped to "Add", it triggers the "Revert" action for that team instead.
  - _UX Note_: The implementation should either slightly delay the "Add" action by ~300ms to wait for a potential second click, OR optimistically add the point and if a second click is detected, quickly undo it and apply the revert. (Delay is usually safer for score integrity).
- [ ] Default browser behaviors (like page scrolling for Spacebar/Arrows) are prevented (`e.preventDefault()`) when the key is mapped and the game screen is active.

## Quality Assurance

### Test Plan

**Automated Tests**:

- Unit tests for the double-click detection hook/utility (verifying timing and correct action dispatch).
- Unit tests for the mapping configuration logic (saving/loading from storage).
- E2E/Integration tests simulating keyboard events on the active game screen to ensure points are added/reverted.

- **Manual Testing**:

1. Pair a standard Bluetooth keyboard (or media remote) to the testing device.
2. Navigate to the game screen and open the remote configuration.
3. Map "Arrow Left" to Team A Add, "Arrow Right" to Team B Add.
4. Go back to the game. Press Left Arrow -> Verify Team A score increases.
5. Double-click Left Arrow -> Verify Team A score decreases (reverts).
6. Map unique keys to the Revert actions and verify they work on single clicks (simulating a 4-button controller).
7. Refresh the page and ensure the mapped keys are still active.

**Edge Cases**:

- Rapid, spammy button presses (e.g., clicking 5 times fast).
- Pressing a button that is mapped to an action, but the action is currently invalid (e.g., trying to revert a score when it's already at 0-0).
- Device goes to sleep and wakes up (re-pairing Bluetooth usually sends a flurry of connection events, ensure no phantom points are added).

### Definition of Done

- [ ] All subtasks delivered
- [ ] QA Control Gate passed
- [ ] User review approved
