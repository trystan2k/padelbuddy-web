# Implementation Plan: PBW-13 Input, Wake Lock, and Device Integration

## Task Analysis

- **Main objective**: Implement unified input handling for touch, keyboard, and generic HID-style presenter events, including debounce, alias mapping, and wake lock integration.
- **Identified dependencies**:
  - PBW-8: App Foundation and Project Bootstrap (COMPLETED ✅)
  - PBW-11: Scoring Engine and Match Domain (COMPLETED ✅)
- **System impact**: New `src/lib/input/` module, tests in `test/input/`, potential integration with `CurrentMatchStartupGate` and match UI components

---

## Understanding Summary

- **What is being built**: A unified input handling system that normalizes touch, keyboard, and HID presenter events for scoring actions, with debounce and wake lock integration.
- **Why it exists**: Live courtside use requires fast, reliable scoring from multiple input sources (touch, keyboard aliases, presenter remotes) with consistent behavior and screen wake lock.
- **Who it is for**: Padel players and match operators using the app courtside on mobile devices or tablets.
- **Key constraints**:
  - 300ms fixed debounce for scoring inputs
  - No browser Bluetooth API dependency for input normalization
  - Wake lock must degrade gracefully with non-blocking warning when unavailable
  - Must not change match-rule outcomes compared to direct domain calls
- **Explicit non-goals**:
  - Full Bluetooth LE integration (HID-style events handled through keyboard events)
  - Complex gesture recognition beyond simple tap/press

---

## Assumptions

1. Keyboard events will come from physical keyboards, on-screen keyboards, and HID presenter remotes that send standard key events
2. Touch scoring will be handled through button/tap UI components in existing or future match UI
3. Wake Lock API support detection is sufficient for graceful fallback
4. The session layer (`CurrentMatchSession`) already handles async mutations correctly and input should integrate with it
5. The app is client-only (no server-side changes needed)

---

## Chosen Approach

### Proposed Solution

Create a modular input handling system with three main components:

1. **`src/lib/input/keyboard-aliases.ts`**: Static keyboard alias mapping configuration
2. **`src/lib/input/debounce.ts`**: Fixed 300ms debounce utility with proper typing
3. **`src/lib/input/wake-lock.tsx`**: React hook for wake lock management with graceful fallback
4. **`src/lib/input/use-input-handler.tsx`**: React hook that combines keyboard, touch, and wake lock for match input
5. **`src/lib/input/index.ts`**: Public re-export surface
6. **`test/input/`**: Unit and integration tests

### Justification for Simplicity

- **Minimal new files**: Only 5 new source files plus tests
- **No overengineering**: Uses standard React hooks patterns already established in the codebase
- **Composability**: Each concern (aliases, debounce, wake lock) is isolated and testable
- **Existing patterns**: Follows the same architecture as `src/lib/current-match/` with separate modules
- **Graceful degradation**: Wake lock failure is non-blocking with warning only

### Components to be Modified/Created

| File                                    | Action | Purpose                                           |
| --------------------------------------- | ------ | ------------------------------------------------- |
| `src/lib/input/keyboard-aliases.ts`     | CREATE | Keyboard key → team/action mapping                |
| `src/lib/input/debounce.ts`             | CREATE | Debounce utility function                         |
| `src/lib/input/wake-lock.tsx`           | CREATE | Wake lock React hook                              |
| `src/lib/input/use-input-handler.tsx`   | CREATE | Main input handling hook                          |
| `src/lib/input/index.ts`                | CREATE | Public exports                                    |
| `test/input/keyboard-aliases.test.ts`   | CREATE | Key mapping tests                                 |
| `test/input/debounce.test.ts`           | CREATE | Debounce behavior tests                           |
| `test/input/wake-lock.test.tsx`         | CREATE | Wake lock component tests                         |
| `test/input/use-input-handler.test.tsx` | CREATE | Input handler tests                               |
| `test/input/regression.test.ts`         | CREATE | Regression tests comparing input vs direct domain |

---

## Implementation Steps

### Step 1: Create Keyboard Alias Mapping (`keyboard-aliases.ts`)

**Purpose**: Define mapping from keyboard keys to team scoring actions

**Implementation**:

- Create `src/lib/input/keyboard-aliases.ts`
- Define `KeyboardAction` type: `'score-team-1' | 'score-team-2' | 'undo' | 'unknown'`
- Define `KeyboardAliasMap` interface mapping key names to actions
- Provide default aliases:
  - Team 1: `ArrowLeft`, `a`, `1`, `Home`, `PageUp`
  - Team 2: `ArrowRight`, `d`, `2`, `End`, `PageDown`
  - Undo: `ArrowUp`, `Backspace`, `u`, `Delete`, `Escape`, `r`
- Export a `getActionFromKey(key: string): KeyboardAction` function

**Validation**:

- Unit tests verify all documented aliases map correctly
- Test that unknown keys return `'unknown'`

### Step 2: Create Debounce Utility (`debounce.ts`)

**Purpose**: Enforce fixed 300ms debounce for scoring inputs

**Implementation**:

- Create `src/lib/input/debounce.ts`
- Create `createDebounce(options?: { delay?: number })` factory returning:
  - `isReady(): boolean` - Check if debounce allows input
  - `trigger(): void` - Reset the debounce timer
  - `reset(): void` - Clear timer without triggering
- Default delay: 300ms (as per acceptance criteria)
- Use `setTimeout` with proper cleanup

**Validation**:

- Unit tests verify 300ms delay behavior
- Test rapid calls are properly debounced
- Test that repeated triggers extend the debounce period correctly

### Step 3: Create Wake Lock Hook (`wake-lock.tsx`)

**Purpose**: Request and maintain wake lock during active match use with graceful fallback

**Implementation**:

- Create `src/lib/input/wake-lock.tsx` with `"use client"` directive
- Define `UseWakeLockOptions` interface:
  - `enabled: boolean` - Whether to attempt wake lock
  - `onError?: (error: Error) => void` - Optional error callback (non-blocking)
- Define `UseWakeLockReturn` interface:
  - `isSupported: boolean` - Whether Wake Lock API is available
  - `isActive: boolean` - Whether wake lock is currently held
  - `error: Error | null` - Error if wake lock was denied
- Use `navigator.wakeLock` API with feature detection
- Implement `requestWakeLock()` and `releaseWakeLock()`
- Re-request on visibility change (tab switch, minimize)
- Log non-blocking warning when unavailable

**Validation**:

- Browser component tests for supported/unsupported scenarios
- Test graceful error handling when wake lock is denied
- Test re-acquisition on visibility change

### Step 4: Create Input Handler Hook (`use-input-handler.tsx`)

**Purpose**: Combine keyboard events, touch/click handling, and wake lock into unified input handling

**Implementation**:

- Create `src/lib/input/use-input-handler.tsx` with `"use client"` directive
- Define `UseInputHandlerOptions` interface:
  - `session: CurrentMatchSession` - The match session to operate on
  - `enabled?: boolean` - Whether input handling is active
  - `useWakeLock?: boolean` - Whether to request wake lock
- Define `UseInputHandlerCallbacks` interface:
  - `onScore?: (teamId: MatchTeamId) => void`
  - `onUndo?: () => void`
  - `onError?: (error: Error) => void`
- Use keyboard event listener on `window` for keyboard input
- Provide touch/click handlers for component integration
- Integrate debounce (300ms) for score inputs
- Integrate wake lock hook when `useWakeLock` is true
- Return:
  - `scorePoint(teamId: MatchTeamId): Promise<void>` - Score for a team
  - `undo(): Promise<void>` - Undo last action
  - `handlers`: Object with `onKeyDown`, `onTeam1Score`, `onTeam2Score`, `onUndo` for component use
  - `wakeLockState`: From wake lock hook

**Validation**:

- Unit tests for keyboard event handling
- Test debounce prevents rapid duplicate scores
- Test touch/click handlers work correctly
- Integration tests with session mock

### Step 5: Create Public Export Surface (`index.ts`)

**Purpose**: Provide clean public API for input module

**Implementation**:

- Create `src/lib/input/index.ts`
- Re-export all public types and functions from submodules
- Add JSDoc comments for public API documentation

### Step 6: Add Unit Tests

**Purpose**: Verify correct behavior and prevent regressions

**Test Files**:

1. `test/input/keyboard-aliases.test.ts` - Key mapping tests
2. `test/input/debounce.test.ts` - Debounce behavior tests
3. `test/input/wake-lock.test.tsx` - Wake lock component tests
4. `test/input/use-input-handler.test.tsx` - Input handler tests
5. `test/input/regression.test.ts` - Regression tests comparing normalized input sequences to direct score-action sequences

**Test Coverage Requirements**:

- All keyboard aliases documented and tested
- 300ms debounce behavior verified
- Wake lock support detection and graceful fallback
- Regression: Input sequence → session → domain produces same result as direct domain call

### Step 7: Integration (Future Match UI)

**Note**: Actual UI component integration is out of scope for PBW-13, but the input handler is designed to be composable with future match screens. The hook can be used in any component that has access to the `CurrentMatchSession`.

---

## Validation

### Success Criteria

1. **Keyboard aliases work identically to touch**: Team scoring, undo, and related actions behave identically across touch and documented keyboard or presenter aliases.
2. **Fixed 300ms debounce**: A fixed 300 ms debounce is enforced for scoring inputs - verified through tests.
3. **No Bluetooth API dependency**: Input normalization uses standard keyboard events only - verified through code review.
4. **Wake lock with graceful fallback**: Wake lock is requested on active match entry and degrades gracefully with a non-blocking warning when unavailable - verified through tests and manual testing.
5. **No match-rule changes**: Input handling does not change match-rule outcomes compared with direct domain calls - verified through regression tests.

### Checkpoints

| Step | Checkpoint               | Verification Method                     |
| ---- | ------------------------ | --------------------------------------- |
| 1    | Keyboard aliases created | Unit tests pass for all mappings        |
| 2    | Debounce implemented     | Unit tests verify 300ms delay           |
| 3    | Wake lock hook created   | Browser tests for supported/unsupported |
| 4    | Input handler complete   | Unit + integration tests pass           |
| 5    | Public exports ready     | All types/functions exported            |
| 6    | All tests passing        | `pnpm test` passes for input tests      |
| 7    | Coverage threshold       | Maintain 80% coverage for new code      |
| 8    | Regression tests pass    | Input sequence equals direct domain     |

### Manual Testing Checklist

1. Verify scoring and undo with keyboard aliases (Arrow keys, number keys, letter keys)
2. Verify touch scoring remains responsive and does not double-fire (debounce working)
3. Validate graceful behavior on a browser or device that does not support wake lock
4. Test rapid alternating inputs from different sources (keyboard + touch)
5. Test held keys or repeated presenter signals (debounce should prevent)
6. Test browser focus changes during active match use (wake lock re-acquisition)

---

## Decision Log

| Decision                    | Alternatives          | Rationale                                                                              |
| --------------------------- | --------------------- | -------------------------------------------------------------------------------------- |
| Use keyboard events for HID | Browser Bluetooth API | Simpler, no pairing required, works with any HID device that sends standard key events |
| Fixed 300ms debounce        | Configurable debounce | Acceptance criteria specifies fixed value, simpler implementation                      |
| Wake lock as hook           | Context provider      | More composable, can be used in any component, follows React patterns                  |
| Separate debounce utility   | Inline debounce       | More testable, reusable, follows single-responsibility principle                       |

---

## Risk Mitigation

| Risk                                      | Mitigation                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| Wake lock API not supported               | Feature detection, non-blocking warning only                             |
| Rapid input from multiple sources         | Debounce applies to all scoring inputs uniformly                         |
| Keyboard events captured in wrong context | Use `window` listener with cleanup, consider focus management            |
| Held keys causing repeated events         | Debounce + keyup tracking prevents held-key spam                         |
| Test coverage gaps                        | Regression tests compare input → session → domain to direct domain calls |

---

## File Structure After Implementation

```
src/lib/
├── current-match/
│   ├── session.ts           # Existing
│   └── ...
└── input/
    ├── keyboard-aliases.ts  # NEW - Key mapping
    ├── debounce.ts         # NEW - Debounce utility
    ├── wake-lock.tsx       # NEW - Wake lock hook
    ├── use-input-handler.tsx # NEW - Main input hook
    └── index.ts            # NEW - Public exports

test/
├── input/
│   ├── keyboard-aliases.test.ts    # NEW
│   ├── debounce.test.ts           # NEW
│   ├── wake-lock.test.tsx         # NEW
│   ├── use-input-handler.test.tsx # NEW
│   └── regression.test.ts         # NEW
└── ...
```
