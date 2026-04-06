## Task Analysis

- **Main objective**: Deliver `PBW-16` as the Active Match Screen at route `/match/:id`, displaying live match state with team panels for scoring, sets display, match information cards, timer with persistence, revert functionality, and finish match action. The screen must strictly follow the Pencil design (node ID: `VSRKf`) and integrate with the existing scoring engine and persistence layer.

- **Identified dependencies**:
  - `PBW-11` (Scoring Engine) ✅ Complete - provides `MatchProjection`, `MatchState`, `MatchSetup`, `MatchTeamId`, `MatchScoreDisplay`, `projectMatch`, `scorePoint`, `undoLastScoringAction`, `createInitialMatchState`, `deriveMatchState`, `getActiveSet`, `getServingTeam`, `getSideSwitchState`
  - `PBW-12` (Persistence) ✅ Complete - provides `CurrentMatchSession`, `createCurrentMatchSession`, `getSnapshot()`, `scorePoint()`, `undoScoreAction()`, `continuePlaying()`, IndexedDB persistence via `saveCurrentMatch`, `loadCurrentMatch`
  - `PBW-14` (Localization) ✅ Complete - provides i18next with HttpBackend, locale files at `public/locales/{en,es,pt}.json`
  - `PBW-35` (Layout) ✅ Complete - provides `Layout` component with `header`, `children`, `footer` props and CSS Modules
  - `PBW-15` (Setup Screen) ✅ Complete - creates matches and navigates to `/match/:id`
  - Pencil design at `docs/design/padelbuddyweb.pen` (node ID: `VSRKf`) defines Game Screen layout
  - Design tokens at `design-tokens/` with team colors, typography, spacing

- **System impact**:
  - Extends `CurrentMatchRecord` to add `startedAt` timestamp for timer persistence (schema version bump)
  - Creates new `ActiveMatchScreen` component with subcomponents
  - Updates `src/routes/match.$id.tsx` from placeholder to full implementation
  - Adds new translation keys to all locale files
  - May require new design tokens for serve indicator, revert buttons

- **Critical gap identified**: Timer state (`startedAt`) is NOT currently persisted in `CurrentMatchRecord`. This requires a schema version change from 1 to 2.

## Chosen Approach

- **Proposed solution**: Build the Active Match Screen incrementally in layers:
  1. **Foundation Layer**: Extend persistence schema to include `startedAt`, create migration/upgrade path, implement timer hook with persistence
  2. **Component Layer**: Create reusable match UI components (TeamPanel, SetsCard, InfoCard, TimeChip, RevertButton, FinishButton) following Pencil design exactly
  3. **Screen Layer**: Compose components into ActiveMatchScreen with session integration
  4. **Integration Layer**: Wire up scoring actions, undo, timer updates, side-switch prompts, and finish navigation

- **Justification for simplicity**:
  - This layered approach separates concerns cleanly: persistence changes are isolated, UI components are reusable, screen composition is declarative
  - Rejected alternatives:
    1. **Single monolithic component** - would create unmaintainable 500+ line file with tight coupling
    2. **State management library (Zustand/Jotai)** - unnecessary complexity; `CurrentMatchSession` already provides reactive state via snapshot pattern
    3. **Building timer without persistence first** - would require rework and could cause user frustration if timer resets on refresh

- **Components to be modified/created**:
  - **Persistence Extension**: `src/lib/current-match/persistence.ts`, `src/lib/current-match/indexed-db.ts`
  - **New Hooks**: `src/components/ActiveMatchScreen/useMatchTimer.ts`, `src/components/ActiveMatchScreen/useMatchSession.ts`
  - **New UI Components**:
    - `src/components/ActiveMatchScreen/TeamPanel/` (team score display with scoring interaction)
    - `src/components/ActiveMatchScreen/SetsCard/` (sets grid display)
    - `src/components/ActiveMatchScreen/InfoCard/` (court details: golden point, super tiebreak, side-switch)
    - `src/components/ActiveMatchScreen/TimeChip/` (match timer display)
    - `src/components/ActiveMatchScreen/RevertButton/` (undo action button)
    - `src/components/ActiveMatchScreen/FinishButton/` (finish match action)
    - `src/components/ActiveMatchScreen/SideSwitchPrompt/` (modal for side change)
  - **Updated Files**: `src/routes/match.$id.tsx`, `public/locales/en.json`, `public/locales/pt.json`, `public/locales/es.json`

## Implementation Steps

### Step 1: Extend Persistence Schema for Timer

**Goal**: Add `startedAt` timestamp to `CurrentMatchRecord` with proper schema versioning and migration.

1.1. Update `src/lib/current-match/persistence.ts`:

```typescript
export const currentMatchSchemaVersion = 2 as const; // Bump from 1 to 2

export interface CurrentMatchRecord {
  schemaVersion: typeof currentMatchSchemaVersion;
  setup: MatchSetup;
  actions: MatchAction[];
  startedAt: number; // Unix timestamp in milliseconds
}
```

1.2. Update `createCurrentMatchRecord` to accept and store `startedAt`:

```typescript
export interface CurrentMatchSaveInput {
  setup: MatchSetup;
  actions: MatchAction[];
  startedAt?: number; // Optional, defaults to Date.now()
}

export function createCurrentMatchRecord(input: CurrentMatchSaveInput): CurrentMatchRecord {
  return {
    schemaVersion: currentMatchSchemaVersion,
    setup: parseMatchSetup(input.setup),
    actions: parseMatchActions(input.actions),
    startedAt: input.startedAt ?? Date.now()
  };
}
```

1.3. Update `decodeCurrentMatchRecord` to handle schema migration:

- Schema version 1 records should be treated as `reset-required` (user needs to restart match)
- Schema version 2 records include `startedAt` field

  1.4. Update `src/lib/current-match/session.ts`:

- Modify `CurrentMatchSessionInput` to include `startedAt`
- Modify `CurrentMatchSessionSnapshot` to include `startedAt`
- Update `commitSnapshot` to persist `startedAt`
- Add `getElapsedTime()` method that returns elapsed milliseconds

  1.5. Update `src/lib/current-match/index.ts` exports

  1.6. Add tests for schema migration:

- Test that v1 records return `reset-required` status
- Test that v2 records with `startedAt` decode correctly
- Test that new records include `startedAt`

**Checkpoint**: Schema version bumped; migration handles v1 gracefully; timer timestamp persists; all existing tests pass.

### Step 2: Create Timer Hook with Persistence

**Goal**: Implement a React hook that manages match timer with persistence across page refreshes.

2.1. Create `src/components/ActiveMatchScreen/useMatchTimer.ts`:

```typescript
interface UseMatchTimerOptions {
  startedAt: number | null;
  isMatchCompleted: boolean;
}

interface UseMatchTimerReturn {
  elapsedSeconds: number;
  formattedTime: string; // e.g., "41 min"
  isRunning: boolean;
}

export function useMatchTimer(options: UseMatchTimerOptions): UseMatchTimerReturn;
```

2.2. Implementation details:

- Use `useEffect` with `setInterval` for ticking
- Calculate elapsed time from `startedAt` to now
- Stop timer when `isMatchCompleted` is true
- Format time as "X min" for < 60 minutes, "Xh Ym" for >= 60 minutes
- Handle `startedAt: null` case (timer shows "0 min")

  2.3. Add unit tests:

- Test timer calculation with fixed `startedAt`
- Test formatted output for various durations
- Test timer stops when match completes

**Checkpoint**: Timer hook works correctly; persists across simulated refresh; formatting matches Pencil design.

### Step 3: Create Match Session Hook

**Goal**: Create a hook that wraps `CurrentMatchSession` with React state management.

3.1. Create `src/components/ActiveMatchScreen/useMatchSession.ts`:

```typescript
interface UseMatchSessionOptions {
  setup: MatchSetup;
  actions: MatchAction[];
  startedAt: number;
}

interface UseMatchSessionReturn {
  snapshot: CurrentMatchSessionSnapshot;
  scorePoint: (teamId: MatchTeamId) => Promise<void>;
  undoScoreAction: () => Promise<void>;
  finishMatch: () => Promise<void>;
  isLoading: boolean;
}

export function useMatchSession(options: UseMatchSessionOptions): UseMatchSessionReturn;
```

3.2. Implementation details:

- Store snapshot in React state with `useState`
- Create session on mount with provided initial data
- Wrap session methods with state updates
- Handle loading states during async operations
- Provide `finishMatch` that sets match as completed (for navigation)

  3.3. Add unit tests:

- Test initial snapshot creation
- Test score point updates state
- Test undo reverts state
- Test loading states during operations

**Checkpoint**: Session hook manages state correctly; all session operations update React state.

### Step 4: Create TeamPanel Component

**Goal**: Build the team score panel with large score display, team name, serve indicator, and click-to-score interaction.

4.1. Analyze Pencil design structure (node IDs: `ilG6v` for team1, `Lwif8` for team2):

- Container: 452px width, 362px height, corner radius 36px
- Team colors: `$team-one` (#2F7CF6) / `$team-one-soft` (#E6F0FF), `$team-two` (#E28A1A) / `$team-two-soft` (#FFF0DB)
- Team name: Inter 16px, weight 700, letter-spacing 1.8, team-colored
- Score: Outfit 264px, weight 900, letter-spacing -10, line-height 0.85
- Serve indicator bar: 220px width, 12px height, corner radius 999, `$accent-green` fill
- Serve indicator chip: corner radius 16, `$accent-green-soft` fill, padding 8x14
- Games label: Outfit 36px, weight 700, `$ink-mid` color

  4.2. Create `src/components/ActiveMatchScreen/TeamPanel/TeamPanel.tsx`:

```typescript
interface TeamPanelProps {
  teamId: MatchTeamId;
  teamName: string;
  score: string; // "40", "15", "Ad" for standard; "7" for tiebreak
  games: number;
  isServing: boolean;
  isGoldenPointActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}
```

4.3. Create `TeamPanel.module.css`:

- Use design tokens: `--base-color-brand-primary`, `--base-color-brand-secondary`, etc.
- Use scoreboard dimensions: `--app-scoreboard-team-panel-width`, `--app-scoreboard-team-panel-height`
- Implement hover/active states for click interaction
- Implement focus-visible for accessibility

  4.4. Accessibility requirements:

- Role: `button` with `aria-label` describing action
- Announce score changes via `aria-live="polite"`
- Focus visible outline
- Keyboard accessible (Enter/Space to score)

  4.5. Create barrel export `index.ts`

**Checkpoint**: TeamPanel matches Pencil design; click interaction works; accessibility attributes present.

### Step 5: Create SetsCard Component

**Goal**: Build the sets display card showing completed and in-progress set scores.

5.1. Analyze Pencil design structure (node ID: `pGBiU`):

- Container: 180px width, corner radius 20px, `$bg-panel` fill, `$line-soft` border
- Label: Inter 11px, weight 700, letter-spacing 1.2, `$ink-mid` color
- Set rows: Each row shows team1-games | team2-games
- Gap: 6px between rows

  5.2. Create `src/components/ActiveMatchScreen/SetsCard/SetsCard.tsx`:

```typescript
interface SetsCardProps {
  sets: MatchSetState[];
  currentSetIndex: number | null;
  setsWon: TeamScore<number>;
}
```

5.3. Implementation details:

- Display sets in order (Set 1, Set 2, Set 3 for best-of-3)
- Show games for each team per set
- Highlight current set visually
- Show tiebreak points if applicable (e.g., "7-6 (7-5)")

  5.4. Create `SetsCard.module.css` using design tokens

  5.5. Create barrel export

**Checkpoint**: SetsCard displays all sets correctly; current set highlighted; tiebreak scores shown.

### Step 6: Create InfoCard Component

**Goal**: Build the court details card showing match configuration options.

6.1. Analyze Pencil design structure (node ID: `5ynmX`):

- Container: 177px width, corner radius 20px, `$bg-panel` fill, `$line-soft` border
- Label: "Court details" Inter 11px, weight 800, letter-spacing 1.2
- Items: Inter 13px, weight 600, `$ink-mid` color
- Items shown: "Golden point on/off", "Super tiebreak on/off", "Side-switch prompts: on/off"

  6.2. Create `src/components/ActiveMatchScreen/InfoCard/InfoCard.tsx`:

```typescript
interface InfoCardProps {
  isGoldenPoint: boolean;
  isSuperTiebreak: boolean;
  sideSwitchPrompts: boolean;
}
```

6.3. Create `InfoCard.module.css` using design tokens

6.4. Create barrel export

**Checkpoint**: InfoCard displays match configuration correctly; localized status text.

### Step 7: Create TimeChip Component

**Goal**: Build the match timer display chip.

7.1. Analyze Pencil design structure (node ID: `cOPm9`):

- Container: corner radius 20px, `$bg-panel` fill, `$line-soft` border
- Padding: 10px 16px
- Text: Outfit 20px, weight 700, `$ink-strong` color
- Position: Centered horizontally between team panels

  7.2. Create `src/components/ActiveMatchScreen/TimeChip/TimeChip.tsx`:

```typescript
interface TimeChipProps {
  formattedTime: string; // e.g., "41 min"
}
```

7.3. Create `TimeChip.module.css` using design tokens

7.4. Create barrel export

**Checkpoint**: TimeChip displays formatted time; updates every minute; matches Pencil design.

### Step 8: Create RevertButton Component

**Goal**: Build the undo/revert point buttons for each team.

8.1. Analyze Pencil design structure (node IDs: `owlFX` for team1, `veV4T` for team2):

- Container: 220px width, corner radius 18px
- Team 1: `$feedback-critical-subtle` (#F9E4E4) fill, `$border-critical-subtle` (#D6B4B4) border
- Team 2: `$feedback-critical-subtle-alt` (#FBE6E0) fill, `$border-critical-subtle-alt` (#E3B8AA) border
- Text: Outfit 18px, weight 700, `$ink-mid` color
- Position: Below respective team panels

  8.2. Create `src/components/ActiveMatchScreen/RevertButton/RevertButton.tsx`:

```typescript
interface RevertButtonProps {
  teamId: MatchTeamId;
  onClick: () => void;
  disabled: boolean; // Disabled when no actions to undo
}
```

8.3. Create `RevertButton.module.css` using design tokens

8.4. Create barrel export

**Checkpoint**: RevertButton matches Pencil design; disabled state works; undo action triggers.

### Step 9: Create FinishButton Component

**Goal**: Build the finish match button that appears in the footer.

9.1. Analyze Pencil design structure (node ID: `kmXz8`):

- Container: fill container height, corner radius 28px, `$bg-app` fill, `$line-soft` border
- Text: Outfit 34px, weight 800, `$ink-strong` color
- Position: Full width in footer area

  9.2. Create `src/components/ActiveMatchScreen/FinishButton/FinishButton.tsx`:

```typescript
interface FinishButtonProps {
  onClick: () => void;
  disabled?: boolean; // Disabled until match has winner
}
```

9.3. Create `FinishButton.module.css` using design tokens

9.4. Create barrel export

**Checkpoint**: FinishButton matches Pencil design; triggers navigation on click.

### Step 10: Create SideSwitchPrompt Component

**Goal**: Build a modal/dialog that prompts players to switch sides.

10.1. Analyze requirements:

- Appears when `derived.sideSwitch.shouldPrompt` is true
- Shows reason: "odd-games" or "tiebreak-interval"
- Has "Switched" confirmation button
- Dismisses on click and doesn't reappear until next switch condition

  10.2. Create `src/components/ActiveMatchScreen/SideSwitchPrompt/SideSwitchPrompt.tsx`:

```typescript
interface SideSwitchPromptProps {
  isOpen: boolean;
  reason: 'odd-games' | 'tiebreak-interval' | null;
  onConfirm: () => void;
}
```

10.3. Use Base UI Dialog for accessibility:

- Focus trap
- Escape to dismiss
- Click outside to dismiss
- Screen reader announcement

  10.4. Create `SideSwitchPrompt.module.css` using design tokens

  10.5. Create barrel export

**Checkpoint**: SideSwitchPrompt appears at correct times; accessible modal; confirmation works.

### Step 11: Create ActiveMatchScreen Component

**Goal**: Compose all subcomponents into the complete Active Match Screen.

11.1. Create `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`:

```typescript
interface ActiveMatchScreenProps {
  matchId: string;
  initialSetup: MatchSetup;
  initialActions: MatchAction[];
  startedAt: number;
}
```

11.2. Component structure following Pencil design:

```
ActiveMatchScreen
├── Layout
│   ├── header
│   │   ├── matchMeta (app icon + "Padel Buddy" + "Live Match")
│   │   └── clockChip (locale display)
│   ├── children (scorePanel)
│   │   ├── team1Panel (TeamPanel)
│   │   ├── team2Panel (TeamPanel)
│   │   ├── setsCard (SetsCard)
│   │   ├── infoCard (InfoCard)
│   │   ├── revertBlue (RevertButton)
│   │   ├── revertOrange (RevertButton)
│   │   └── timeChip (TimeChip)
│   └── footer
│       └── finishBtn (FinishButton)
└── SideSwitchPrompt (conditionally rendered)
```

11.3. Wire up session hook:

- Pass initial data to `useMatchSession`
- Pass snapshot data to child components
- Handle score point on team panel click
- Handle undo on revert button click
- Handle finish on finish button click

  11.4. Wire up timer hook:

- Pass `startedAt` to `useMatchTimer`
- Pass formatted time to `TimeChip`

  11.5. Handle side switch prompt:

- Show when `snapshot.projection.derived.sideSwitch.shouldPrompt` is true
- Hide after confirmation

  11.6. Handle finish match:

- Navigate to end screen route (to be created in future issue)
- For now, navigate back to home `/`

  11.7. Create `ActiveMatchScreen.module.css`:

- Use Pencil layout coordinates for absolute positioning of overlays
- Responsive adjustments for mobile
- Background gradient matching Pencil design

**Checkpoint**: ActiveMatchScreen renders correctly; all interactions work; layout matches Pencil design.

### Step 12: Create TopBar Component

**Goal**: Extract the header content into a reusable component.

12.1. Analyze Pencil design structure (node ID: `eFLga`):

- Height: 64px
- Left side: matchMeta (app icon + title + "Live Match" subtitle)
- Right side: clockChip (locale display)

  12.2. Create `src/components/ActiveMatchScreen/TopBar/TopBar.tsx`:

```typescript
interface TopBarProps {
  currentLocale: SupportedLocale;
  onLocaleClick: () => void;
}
```

12.3. Reuse existing `LocaleChip` component for locale display

12.4. Create `TopBar.module.css` using design tokens

12.5. Create barrel export

**Checkpoint**: TopBar matches Pencil design; locale chip works.

### Step 13: Create Mock Match Data for Development

**Goal**: Create a mock match that can be used for development and testing without full persistence flow.

13.1. Create `src/components/ActiveMatchScreen/mock-match.ts`:

```typescript
export const mockMatchSetup: MatchSetup = {
  format: 'best-of-3',
  gameMode: 'golden-point',
  initialServer: 'team-1',
  decidingSetSuperTiebreak: true,
  sideSwitchPrompts: true,
  sides: [
    { id: 'team-1', playerNames: ['Alvaro', 'Enrique'] },
    { id: 'team-2', playerNames: ['Pablo', 'Thiago'] }
  ]
  // ... other fields
};

export const mockMatchActions: MatchAction[] = [
  { type: 'score-point', teamId: 'team-1' },
  { type: 'score-point', teamId: 'team-1' },
  { type: 'score-point', teamId: 'team-1' },
  { type: 'score-point', teamId: 'team-2' }
  // ... more actions to reach desired state
];

export const mockStartedAt = Date.now() - 41 * 60 * 1000; // 41 minutes ago
```

13.2. Create utility function to generate various match states:

- Fresh match (no points scored)
- Mid-game (30-15)
- Deuce state
- Advantage state
- Mid-set (4-3 games)
- Tiebreak state
- Match completed

**Checkpoint**: Mock data available for all development scenarios; easy to switch between states.

### Step 14: Update Route File

**Goal**: Update `src/routes/match.$id.tsx` to use ActiveMatchScreen with proper data loading.

14.1. Update route component:

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { ActiveMatchScreen } from '@/components/ActiveMatchScreen'
import { loadCurrentMatch } from '@/lib/current-match'

export const Route = createFileRoute('/match/$id')({
  component: MatchRoute,
  loader: async ({ params }) => {
    // For now, load from persistence
    // Match ID is stored for future use (sharing, history)
    const result = await loadCurrentMatch()
    return { matchId: params.id, matchData: result }
  }
})

function MatchRoute() {
  const { matchId, matchData } = Route.useLoaderData()

  // Handle different load results
  if (matchData.status === 'ok') {
    return (
      <ActiveMatchScreen
        matchId={matchId}
        initialSetup={matchData.record.setup}
        initialActions={matchData.record.actions}
        startedAt={matchData.record.startedAt}
      />
    )
  }

  // Handle reset-required and corrupt states
  // Navigate back to home or show error
}
```

14.2. Handle error states:

- `reset-required`: Navigate to home with toast notification
- `corrupt`: Show error message, navigate to home

  14.3. Add pending state with loading indicator

**Checkpoint**: Route loads match data; ActiveMatchScreen renders with real data; error states handled.

### Step 15: Create Translation Strings

**Goal**: Add all Active Match Screen strings to translation files.

15.1. Define translation key structure:

```json
{
  "match": {
    "header": {
      "appName": "Padel Buddy",
      "subtitle": "Live Match"
    },
    "score": {
      "games": "Games"
    },
    "info": {
      "title": "Court details",
      "goldenPointOn": "Golden point on",
      "goldenPointOff": "Golden point off",
      "superTiebreakOn": "Super tiebreak on",
      "superTiebreakOff": "Super tiebreak off",
      "sideSwitchOn": "Side-switch prompts: on",
      "sideSwitchOff": "Side-switch prompts: off"
    },
    "sets": {
      "label": "Sets"
    },
    "timer": {
      "minutes": "{{count}} min",
      "hours": "{{hours}}h {{minutes}}m"
    },
    "actions": {
      "revertPoint": "Revert point",
      "finishMatch": "Finish Game"
    },
    "sideSwitch": {
      "oddGames": "Switch sides (odd games)",
      "tiebreakInterval": "Switch sides (tiebreak)",
      "confirm": "Switched"
    },
    "announcements": {
      "pointScored": "{{team}} scores. {{score1}} - {{score2}}",
      "gameWon": "Game {{team}}",
      "setWon": "Set {{team}}",
      "matchWon": "Match {{team}}"
    }
  }
}
```

15.2. Add English strings to `public/locales/en.json`

15.3. Add Portuguese strings to `public/locales/pt.json`

15.4. Add Spanish strings to `public/locales/es.json`

15.5. Verify i18n loads new keys

**Checkpoint**: All three locale files contain complete match screen translations; no hardcoded strings.

### Step 16: Responsive Design Implementation

**Goal**: Ensure the screen works on mobile and desktop viewports.

16.1. Analyze Pencil design for responsive behavior:

- Desktop (1024px+): Side-by-side team panels, overlays positioned absolutely
- Mobile (< 768px): Stacked layout, panels full width, overlays below panels

  16.2. Update `ActiveMatchScreen.module.css` with media queries:

```css
.scorePanel {
  position: relative;
  min-height: var(--app-screen-body-height);
}

/* Desktop layout */
@media (min-width: 768px) {
  .team1Panel {
    position: absolute;
    left: 0;
    top: 56px;
  }

  .team2Panel {
    position: absolute;
    right: 0;
    top: 56px;
  }

  .setsCard {
    position: absolute;
    left: 390px;
    top: 15px;
  }

  /* ... other absolute positions from Pencil */
}

/* Mobile layout */
@media (max-width: 767px) {
  .scorePanel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .team1Panel,
  .team2Panel {
    width: 100%;
    height: auto;
  }

  /* ... other mobile adjustments */
}
```

16.3. Test on various viewport sizes:

- 375px (iPhone SE)
- 390px (iPhone 12/13)
- 768px (iPad portrait)
- 1024px (iPad landscape / small desktop)
- 1440px (desktop)

**Checkpoint**: Screen is usable on all viewport sizes; layout adapts gracefully.

### Step 17: Accessibility Implementation

**Goal**: Ensure WCAG AA compliance for the Active Match Screen.

17.1. Keyboard navigation:

- Tab through team panels, revert buttons, finish button
- Enter/Space to activate buttons
- Escape to dismiss side-switch prompt

  17.2. Screen reader support:

- All interactive elements have accessible labels
- Score changes announced via `aria-live="polite"`
- Serve indicator has `aria-label`
- Side-switch prompt announced when opened

  17.3. Color contrast:

- Verify all text meets 4.5:1 contrast ratio
- Verify large text (score) meets 3:1 contrast ratio
- Use accessibility checker tool

  17.4. Focus management:

- Focus visible on all interactive elements
- Focus trapped in side-switch modal
- Focus returns to trigger after modal close

  17.5. Add accessibility tests:

```typescript
test('keyboard navigation works', async () => {
  render(<ActiveMatchScreen {...props} />)

  await userEvent.tab()
  expect(screen.getByRole('button', { name: /team 1/i })).toHaveFocus()

  await userEvent.keyboard('{Enter}')
  // Verify score point was called
})
```

**Checkpoint**: All WCAG AA requirements met; keyboard and screen reader tested.

### Step 18: Integration Testing and QA

**Goal**: Verify complete flow works end-to-end with all acceptance criteria met.

18.1. Manual testing checklist:

- [ ] Match Screen displays at `/match/:id` route
- [ ] Team names are displayed correctly from setup
- [ ] Current score shows points, games, and sets
- [ ] Point scoring buttons work (click on team panel)
- [ ] Score updates immediately on click
- [ ] Undo functionality reverts last action
- [ ] Match timer displays elapsed time
- [ ] Timer persists across page refresh
- [ ] Golden point indicator shows when active
- [ ] Tiebreak display works correctly (numeric scores)
- [ ] Side-switch prompts appear at correct intervals
- [ ] Finish Match button navigates to end screen (or home)
- [ ] All UI follows Pencil design specifications
- [ ] All text is localized via i18n
- [ ] Responsive design works on mobile and desktop

  18.2. Run `pnpm complete-check`:

- All tests pass
- Linting passes
- Formatting passes

  18.3. Browser testing:

- Chrome, Firefox, Safari
- Mobile viewport (375px width)
- Desktop viewport (1024px+ width)

  18.4. Persistence testing:

- Start match, score points, refresh page
- Verify state and timer persist
- Verify undo works after refresh

**Checkpoint**: All acceptance criteria verified; `pnpm complete-check` passes.

## Validation

- **Success criteria**:
  1. Match Screen displays at `/match/:id` route with team panels, sets display, info card, timer, revert buttons, and finish button
  2. Clicking on team panel scores a point for that team and updates display immediately
  3. Revert button undoes the last scoring action and updates display
  4. Match timer displays elapsed time in "X min" format, persisting across page refreshes
  5. Golden point indicator shows correct state from match setup
  6. Tiebreak display shows numeric scores (0-15) instead of tennis scoring (0-15-30-40)
  7. Side-switch prompts appear when configured and at correct game/tiebreak intervals
  8. Finish Match button is enabled when match has winner, navigates appropriately
  9. All UI follows Pencil design strictly with design tokens
  10. All text is localized via i18n with no hardcoded strings
  11. Responsive design works on mobile and desktop viewports
  12. WCAG AA accessibility compliance achieved

- **Checkpoints**:
  - After Step 1: Schema version bumped, migration handles v1 records, timer persists
  - After Steps 2-3: Hooks work correctly in isolation
  - After Steps 4-10: All subcomponents match Pencil design and have tests
  - After Step 11: ActiveMatchScreen composed correctly with all interactions
  - After Step 13: Mock data available for development
  - After Step 14: Route loads and renders correctly
  - After Step 15: All translations complete
  - After Step 16: Responsive design works
  - After Step 17: Accessibility requirements met
  - After Step 18: All acceptance criteria verified, `pnpm complete-check` passes

- **Rollback notes**:
  - If schema migration causes issues, can temporarily accept v1 records with default `startedAt: Date.now()`
  - If timer persistence causes performance issues, can debounce saves to every 60 seconds
  - If side-switch prompt causes UX friction, can add dismiss-for-match option
  - If responsive layout is too complex, can create separate mobile component

## File Structure (Post-Implementation)

```
src/
├── components/
│   ├── ActiveMatchScreen/
│   │   ├── ActiveMatchScreen.tsx
│   │   ├── ActiveMatchScreen.module.css
│   │   ├── index.ts
│   │   ├── useMatchTimer.ts
│   │   ├── useMatchSession.ts
│   │   ├── mock-match.ts
│   │   ├── TeamPanel/
│   │   │   ├── TeamPanel.tsx
│   │   │   ├── TeamPanel.module.css
│   │   │   └── index.ts
│   │   ├── SetsCard/
│   │   │   ├── SetsCard.tsx
│   │   │   ├── SetsCard.module.css
│   │   │   └── index.ts
│   │   ├── InfoCard/
│   │   │   ├── InfoCard.tsx
│   │   │   ├── InfoCard.module.css
│   │   │   └── index.ts
│   │   ├── TimeChip/
│   │   │   ├── TimeChip.tsx
│   │   │   ├── TimeChip.module.css
│   │   │   └── index.ts
│   │   ├── RevertButton/
│   │   │   ├── RevertButton.tsx
│   │   │   ├── RevertButton.module.css
│   │   │   └── index.ts
│   │   ├── FinishButton/
│   │   │   ├── FinishButton.tsx
│   │   │   ├── FinishButton.module.css
│   │   │   └── index.ts
│   │   ├── SideSwitchPrompt/
│   │   │   ├── SideSwitchPrompt.tsx
│   │   │   ├── SideSwitchPrompt.module.css
│   │   │   └── index.ts
│   │   └── TopBar/
│   │       ├── TopBar.tsx
│   │       ├── TopBar.module.css
│   │       └── index.ts
│   ├── ui/  (existing)
│   ├── Layout/  (existing)
│   └── SetupScreen/  (existing)
├── lib/
│   ├── current-match/
│   │   ├── persistence.ts  (modified)
│   │   ├── session.ts  (modified)
│   │   └── index.ts  (modified)
│   └── i18n/  (existing)
├── routes/
│   ├── match.$id.tsx  (modified)
│   └── ... (existing)
└── core/match/  (existing)

public/
└── locales/
    ├── en.json  (modified)
    ├── pt.json  (modified)
    └── es.json  (modified)

test/
├── components/
│   └── ActiveMatchScreen/
│       ├── TeamPanel.test.tsx
│       ├── SetsCard.test.tsx
│       ├── InfoCard.test.tsx
│       ├── TimeChip.test.tsx
│       ├── RevertButton.test.tsx
│       ├── FinishButton.test.tsx
│       ├── SideSwitchPrompt.test.tsx
│       ├── useMatchTimer.test.ts
│       ├── useMatchSession.test.ts
│       └── ActiveMatchScreen.test.tsx
└── lib/
    └── current-match/
        └── persistence-timer.test.ts
```

## Dependencies and Risks

### Dependencies

- **PBW-11**: Scoring engine types and functions must be available ✅
- **PBW-12**: Persistence layer must support extension ✅
- **PBW-14**: i18n system must be functional ✅
- **PBW-35**: Layout component must exist ✅
- **PBW-15**: Setup screen must create matches and navigate ✅

### Risks and Mitigations

1. **Risk**: Schema migration breaks existing saved matches
   - **Mitigation**: Handle v1 records gracefully with `reset-required` status and clear user messaging

2. **Risk**: Timer persistence causes performance issues with frequent writes
   - **Mitigation**: Timer is only written when actions occur (score, undo), not on every tick

3. **Risk**: Pencil design doesn't translate well to mobile
   - **Mitigation**: Test early on mobile viewport; create mobile-specific layout if needed

4. **Risk**: Side-switch prompt interrupting gameplay feels annoying
   - **Mitigation**: Make prompt dismissible; consider "don't show again" option for future

5. **Risk**: Accessibility requirements conflict with design
   - **Mitigation**: Test with accessibility tools early; prioritize WCAG compliance over exact design match

6. **Risk**: Large score font (264px) causes layout issues
   - **Mitigation**: Use responsive font size; scale down on smaller viewports

## Estimated Effort

| Step      | Description                         | Estimated Hours |
| --------- | ----------------------------------- | --------------- |
| 1         | Extend persistence schema for timer | 3               |
| 2         | Create timer hook with persistence  | 2               |
| 3         | Create match session hook           | 2               |
| 4         | Create TeamPanel component          | 4               |
| 5         | Create SetsCard component           | 2               |
| 6         | Create InfoCard component           | 1               |
| 7         | Create TimeChip component           | 1               |
| 8         | Create RevertButton component       | 1               |
| 9         | Create FinishButton component       | 1               |
| 10        | Create SideSwitchPrompt component   | 2               |
| 11        | Create ActiveMatchScreen component  | 4               |
| 12        | Create TopBar component             | 1               |
| 13        | Create mock match data              | 1               |
| 14        | Update route file                   | 2               |
| 15        | Create translation strings          | 2               |
| 16        | Responsive design implementation    | 3               |
| 17        | Accessibility implementation        | 3               |
| 18        | Integration testing and QA          | 4               |
| **Total** |                                     | **40 hours**    |

## Next Steps After Completion

1. PBW-17 (or next issue) can implement the End Match Screen for post-match summary
2. Add E2E tests for complete match flow using Playwright
3. Consider adding voice announcement integration for score changes
4. Add match history/sharing features using match ID
5. Update ARCHITECTURE.md with ActiveMatchScreen component patterns
