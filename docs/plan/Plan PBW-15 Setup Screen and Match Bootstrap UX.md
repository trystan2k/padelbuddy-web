## Task Analysis

- Main objective: Deliver `PBW-15` as the setup screen that serves as the entry point for every match, collecting all v1 match options (team names, match format, initial server, game mode, deciding-set super tiebreak, side-switch prompts), supporting setup-time locale switching, creating a valid initial match state, and navigating to the active match flow at `/match/:id` without exposing in-match rule changes.
- Identified dependencies:
  - `PBW-11` (Scoring Engine) provides `createMatchSetup`, `validateMatchSetup`, `createInitialMatchState`, and domain types (`MatchFormat`, `MatchGameMode`, `MatchTeamId`, etc.)
  - `PBW-12` (Persistence) provides `CurrentMatchSession`, `createCurrentMatchSession`, and IndexedDB persistence
  - `PBW-14` (Localization) provides `initializeI18n`, `changeLocale`, `getCurrentLocale`, and locale storage with IndexedDB persistence
  - Design tokens exist in `design-tokens/` with semantic color/typography variables
  - Translation files exist at `public/locales/{en,pt,es}.json` needing setup screen keys
  - Pencil design at `docs/design/padelbuddyweb.pen` defines the Setup Screen layout and components
- System impact: This work creates new UI components in `src/components/`, updates `src/routes/index.tsx` to use SetupScreen instead of AppShell, adds a new route `src/routes/match.$id.tsx`, updates translation files, and may require new design tokens for team-specific colors if not already present.

## Chosen Approach

- Proposed solution: Build the Setup Screen by first extracting reusable UI components from the Pencil design (SectionLabel, TextInput, SelectableChip, Toggle, PrimaryButton, LocaleChip, Card, Divider), then compose the SetupScreen page using these components with form state management, validation feedback, and i18n integration. Replace the current `AppShell` with `SetupScreen` as the home route content. When "Start Match" is clicked, validate the form, create match state via domain engine, persist via CurrentMatchSession, and navigate to `/match/:id` using a URL-safe match ID.
- Justification for simplicity: This approach follows the existing component patterns (CSS Modules, Base UI primitives), reuses the established i18n system without new infrastructure, leverages existing domain validation without duplication, and keeps the setup screen as a pure presentation layer over domain types. Rejected alternatives: (1) Using a form library like React Hook Form - unnecessary complexity given the simple field count; (2) Creating a global setup state store - the form state is local to setup and doesn't need cross-component sharing; (3) Inline component definitions - violates the component reuse requirement and creates maintenance debt.
- Components to be modified/created:
  - **New UI Components**: `src/components/ui/SectionLabel/`, `src/components/ui/TextInput/`, `src/components/ui/SelectableChip/`, `src/components/ui/Toggle/`, `src/components/ui/PrimaryButton/`, `src/components/ui/LocaleChip/`, `src/components/ui/Card/`, `src/components/ui/Divider/`
  - **New Screen**: `src/components/SetupScreen/SetupScreen.tsx` (replaces AppShell in home route)
  - **New Route**: `src/routes/match.$id.tsx` (match screen route placeholder)
  - **Updated Files**: `src/routes/index.tsx`, `public/locales/en.json`, `public/locales/pt.json`, `public/locales/es.json`
  - **Utility**: `src/lib/match-id.ts` for generating URL-safe match IDs

## Implementation Steps

### Step 1: Analyze Pencil Design and Identify Common Components

**Goal**: Extract all reusable UI patterns from the Pencil Setup Screen design before any page implementation.

1.1. Review Pencil design at `docs/design/padelbuddyweb.pen` (node ID: `bi8Au`) for Setup Screen structure
1.2. Document component inventory with design specs:

- **SectionLabel**: Inter 14px, weight 700, letter-spacing 1.6, uppercase, team-colored or ink-strong
- **TextInput**: Outfit 36px, weight 800, letter-spacing -1, editable team name fields
- **SelectableChip**: Rounded container (22px radius), team-colored border when selected, line-soft border when unselected, fill changes based on selection state
- **Toggle**: Row with label text and toggle switch (Base UI Switch component)
- **PrimaryButton**: accent-green fill, Outfit 34px weight 800, corner-radius 28, padding 22x24
- **LocaleChip**: bg-panel fill, line-soft border, Inter 15px weight 700, shows flag + language name
- **Card**: bg-panel fill, line-soft border, rounded corners (24-26px), vertical layout with gap
- **Divider**: line-soft fill, 1px height, full width
  1.3. Check `src/components/` for existing components that match these patterns
  1.4. Create component specification document listing which components exist vs. need creation

**Checkpoint**: Component inventory complete with design specs documented; existing components identified; gap analysis complete.

### Step 2: Create Missing UI Components

**Goal**: Build all reusable UI components following Pencil design tokens and existing patterns.

2.1. Create `src/components/ui/` directory structure if not exists
2.2. Implement **SectionLabel** component:

- Props: `children`, `variant?: 'default' | 'team-one' | 'team-two'`
- Uses design tokens: `--semantic-typography-family-body`, `--semantic-typography-size-label-md`
- CSS: uppercase, letter-spacing from design tokens, color based on variant
  2.3. Implement **TextInput** component:
- Props: `value`, `onChange`, `placeholder?`, `maxLength?`, `disabled?`, `variant?: 'team-one' | 'team-two'`
- Uses Outfit font at 36px weight 800
- Border color changes based on team variant (team-one-soft/team-two-soft when focused)
  2.4. Implement **SelectableChip** component:
- Props: `children`, `selected: boolean`, `onClick`, `variant?: 'default' | 'team-one' | 'team-two'`
- Base UI Button under the hood for accessibility
- Visual states: selected (team-colored border + soft fill), unselected (line-soft border + bg-panel)
  2.5. Implement **Toggle** component:
- Props: `checked`, `onChange`, `label`, `disabled?`
- Uses Base UI Switch for accessibility
- Layout: horizontal row with label left, switch right
  2.6. Implement **PrimaryButton** component:
- Props: `children`, `onClick`, `disabled?`, `type?`
- Uses accent-green fill, white text, large padding
- Disabled state with reduced opacity
  2.7. Implement **LocaleChip** component:
- Props: `locale: SupportedLocale`, `onClick?`
- Shows flag emoji + language name based on locale
- Uses existing i18n for language name display
  2.8. Implement **Card** component:
- Props: `children`, `className?`, `variant?: 'default' | 'team-one' | 'team-two'`
- Uses bg-panel fill, line-soft border, 24px corner radius
  2.9. Implement **Divider** component:
- Simple horizontal line with line-soft color, 1px height
  2.10. Create barrel export at `src/components/ui/index.ts`

**Checkpoint**: All UI components created with tests passing; components match Pencil design visually; accessibility attributes present.

### Step 3: Create Translation Strings for Setup Screen

**Goal**: Add all setup screen strings to translation files without hardcoded text.

3.1. Define translation key structure for setup screen:

```json
{
  "setup": {
    "header": {
      "appName": "Padel Buddy",
      "localeSelector": {
        "en": "🇺🇸 English",
        "pt": "🇧🇷 Português",
        "es": "🇪🇸 Español"
      }
    },
    "teams": {
      "team1Label": "TEAM 1",
      "team2Label": "TEAM 2",
      "team1Default": "Team A",
      "team2Default": "Team B",
      "playerPlaceholder": "Team name"
    },
    "firstServer": {
      "label": "FIRST SERVER",
      "team1": "Team A",
      "team2": "Team B"
    },
    "format": {
      "label": "MATCH FORMAT",
      "bestOf1": "Best of 1",
      "bestOf3": "Best of 3",
      "bestOf5": "Best of 5"
    },
    "rules": {
      "goldenPoint": "Golden Point",
      "goldenPointHint": "No advantage - first point after deuce wins",
      "superTiebreak": "Super Tiebreak",
      "superTiebreakHint": "Deciding set to 10 points",
      "sideSwitch": "Side Switch Prompts",
      "sideSwitchHint": "Prompt teams to switch sides"
    },
    "startButton": "Start Match",
    "validation": {
      "teamNamesRequired": "Both team names are required",
      "selectFormat": "Please select a match format",
      "selectServer": "Please select the first server"
    }
  }
}
```

3.2. Add English strings to `public/locales/en.json`
3.3. Add Portuguese strings to `public/locales/pt.json`
3.4. Add Spanish strings to `public/locales/es.json`
3.5. Verify i18n loads new keys by checking `t('setup.header.appName')` in browser

**Checkpoint**: All three locale files contain complete setup screen translations; no hardcoded strings in components.

### Step 4: Create Setup Form State and Validation Logic

**Goal**: Implement form state management with validation that prevents invalid match start.

4.1. Define SetupFormData type in `src/components/SetupScreen/types.ts`:

```typescript
interface SetupFormData {
  team1Name: string
  team2Name: string
  format: MatchFormat
  gameMode: MatchGameMode
  initialServer: MatchTeamId
  decidingSetSuperTiebreak: boolean
  sideSwitchPrompts: boolean
}
```

4.2. Create default form values using domain defaults:

- `team1Name`: "Team A" (localized)
- `team2Name`: "Team B" (localized)
- `format`: `defaultMatchFormat` ('best-of-3')
- `gameMode`: `defaultGameMode` ('advantage')
- `initialServer`: `defaultInitialServer` ('team-1')
- `decidingSetSuperTiebreak`: false
- `sideSwitchPrompts`: true
  4.3. Create validation function `validateSetupForm`:
- Returns `{ isValid: boolean; errors: FieldErrors }`
- Validates: team names not empty, format selected, initial server selected
- Uses domain `validateMatchSetup` for final validation before match creation
  4.4. Create `useSetupForm` hook:
- Manages form state with `useState`
- Provides `formData`, `updateField`, `errors`, `validate` functions
- Handles field-level validation on blur
  4.5. Add validation error display UI:
- Show inline errors under fields
- Disable "Start Match" button when form is invalid
- Clear errors when field is corrected

**Checkpoint**: Form state management complete; validation prevents invalid submissions; clear error feedback.

### Step 5: Implement SetupScreen Component

**Goal**: Build the complete SetupScreen page composing UI components with form logic.

5.1. Create `src/components/SetupScreen/SetupScreen.tsx`:

- Import UI components from `src/components/ui/`
- Use `useSetupForm` hook for state management
- Use `useTranslation` for all text content
  5.2. Implement header section:
- App name (Outfit 34px, weight 800)
- LocaleChip for language switching
- `changeLocale()` on click with IndexedDB persistence
  5.3. Implement teams section (left column on desktop):
- SectionLabel for "TEAM 1"
- Card with TextInput for team 1 name
- SectionLabel for "TEAM 2"
- Card with TextInput for team 2 name
- SectionLabel for "FIRST SERVER"
- SelectableChip row for team selection
  5.4. Implement options section (right column on desktop):
- SectionLabel for "MATCH FORMAT"
- SelectableChip row for Best of 1/3/5
- Card with Toggle options:
  - Golden Point toggle
  - Super Tiebreak toggle (only shown for best-of-3/5)
  - Side Switch Prompts toggle
- Dividers between toggle rows
  5.5. Implement start button:
- PrimaryButton at bottom
- Disabled when form is invalid
- Shows loading state during match creation
  5.6. Create CSS Module `SetupScreen.module.css`:
- Follow Pencil design layout exactly
- Use design tokens for all colors, spacing, typography
- Responsive layout: 2-column on desktop, single column on mobile
- Background gradient matching Pencil design
  5.7. Handle "Start Match" action:
- Validate form with `validateSetupForm`
- If valid, create `MatchSetupInput` object
- Call `createMatchSetup` to get validated `MatchSetup`
- Call `createInitialMatchState` with setup
- Create `CurrentMatchSession` with setup and empty actions
- Navigate to `/match/:id` with generated match ID

**Checkpoint**: SetupScreen renders correctly; all form fields work; locale switching persists; "Start Match" creates match and navigates.

### Step 6: Create Match ID Generation and Navigation

**Goal**: Generate URL-safe match IDs and implement navigation to match route.

6.1. Create `src/lib/match-id.ts`:

- `generateMatchId()`: Creates URL-safe unique ID (e.g., nanoid or crypto.randomUUID)
- `validateMatchId(id: string)`: Validates ID format
- ID should be short enough for sharing (6-8 characters)
  6.2. Update `src/routes/index.tsx`:
- Replace `AppShell` with `SetupScreen`
- Keep `CurrentMatchStartupGate` wrapper
  6.3. Create `src/routes/match.$id.tsx`:
- TanStack Start file-based route with `$id` param
- For now, show placeholder "Match Screen" text
- Will be implemented in future PBW issues
  6.4. Test navigation flow:
- Setup → Start Match → Navigate to `/match/:id`
- Verify URL contains generated ID
- Verify browser back button returns to setup

**Checkpoint**: Navigation flow works; match ID is URL-safe; route exists for match screen.

### Step 7: Integration Testing and Quality Verification

**Goal**: Ensure complete flow works end-to-end with all acceptance criteria met.

7.1. Manual testing checklist:

- [ ] Setup screen displays correctly on mobile and desktop
- [ ] All text is localized (no hardcoded strings)
- [ ] Team name inputs work with defaults
- [ ] Format selection updates UI correctly
- [ ] Initial server selection works
- [ ] Toggle options show/hide correctly (Super Tiebreak for best-of-3/5)
- [ ] Locale switching persists to IndexedDB
- [ ] Locale persists across page refresh
- [ ] Form validation prevents invalid submissions
- [ ] "Start Match" creates valid match state
- [ ] Navigation to `/match/:id` works
- [ ] All Pencil design tokens used (no hardcoded colors)
      7.2. Run `pnpm complete-check`:
- All tests pass
- Linting passes
- Formatting passes
  7.3. Browser testing:
- Chrome, Firefox, Safari
- Mobile viewport (375px width)
- Desktop viewport (1024px+ width)
  7.4. Accessibility testing:
- Keyboard navigation works
- Focus visible on all interactive elements
- Screen reader announces form labels and errors
- Color contrast meets WCAG AA

**Checkpoint**: All acceptance criteria verified; `pnpm complete-check` passes; accessibility requirements met.

## Validation

- Success criteria:
  1. Setup screen includes all required fields: team names, match format, initial server, game mode (golden point), deciding-set super tiebreak, side-switch prompts, locale switch, and start action
  2. Invalid or incomplete setup states prevent match start with clear user feedback (inline errors, disabled button)
  3. Locale switching is available only on setup screen and persists to next session via IndexedDB
  4. Starting a match creates correct initial domain state via `createMatchSetup` + `createInitialMatchState`
  5. Starting a match navigates to `/match/:id` route
  6. Screen implementation follows Pencil design strictly, using design tokens for all visual elements
  7. All text is localized via i18n with no hardcoded strings
  8. Reusable UI components are extracted and can be used in future screens

- Checkpoints:
  - After Step 1: Component inventory documented with Pencil node IDs and design specs
  - After Step 2: All UI components created with CSS Modules, using design tokens, accessibility attributes
  - After Step 3: All three locale files contain setup screen translations
  - After Step 4: Form validation works, prevents invalid submissions, shows clear errors
  - After Step 5: SetupScreen matches Pencil design, all interactions work, locale persists
  - After Step 6: Navigation to `/match/:id` works with URL-safe IDs
  - After Step 7: `pnpm complete-check` passes, all acceptance criteria verified

- Rollback notes:
  - If component extraction becomes too complex, can inline components temporarily but must document as tech debt
  - If form validation logic conflicts with domain validation, prefer domain validation as source of truth
  - If navigation causes issues with CurrentMatchStartupGate, may need to adjust the gate's resume logic

## File Structure (Post-Implementation)

```
src/
├── components/
│   ├── ui/
│   │   ├── SectionLabel/
│   │   │   ├── SectionLabel.tsx
│   │   │   └── SectionLabel.module.css
│   │   ├── TextInput/
│   │   │   ├── TextInput.tsx
│   │   │   └── TextInput.module.css
│   │   ├── SelectableChip/
│   │   │   ├── SelectableChip.tsx
│   │   │   └── SelectableChip.module.css
│   │   ├── Toggle/
│   │   │   ├── Toggle.tsx
│   │   │   └── Toggle.module.css
│   │   ├── PrimaryButton/
│   │   │   ├── PrimaryButton.tsx
│   │   │   └── PrimaryButton.module.css
│   │   ├── LocaleChip/
│   │   │   ├── LocaleChip.tsx
│   │   │   └── LocaleChip.module.css
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   └── Card.module.css
│   │   ├── Divider/
│   │   │   ├── Divider.tsx
│   │   │   └── Divider.module.css
│   │   └── index.ts
│   ├── SetupScreen/
│   │   ├── SetupScreen.tsx
│   │   ├── SetupScreen.module.css
│   │   ├── types.ts
│   │   ├── useSetupForm.ts
│   │   └── validateSetupForm.ts
│   ├── CurrentMatchStartupGate/
│   │   └── ... (existing)
│   ├── AppShell/
│   │   └── ... (existing, can be removed after SetupScreen is complete)
│   └── NotFoundPage/
│       └── ... (existing)
├── lib/
│   ├── match-id.ts (new)
│   └── ... (existing)
├── routes/
│   ├── __root.tsx (existing)
│   ├── index.tsx (updated to use SetupScreen)
│   ├── match.$id.tsx (new)
│   └── RootDocument.module.css (existing)
└── ... (existing)

public/
└── locales/
    ├── en.json (updated)
    ├── pt.json (updated)
    └── es.json (updated)
```

## Dependencies and Risks

### Dependencies

- **PBW-11**: Domain types and validation must be complete
- **PBW-12**: Current match session persistence must work
- **PBW-14**: i18n system with IndexedDB persistence must work

### Risks and Mitigations

1. **Risk**: Component extraction takes longer than expected
   - **Mitigation**: Start with minimal viable components, add polish incrementally

2. **Risk**: Pencil design tokens don't match existing design-tokens structure
   - **Mitigation**: Map Pencil variables to semantic tokens; add new tokens if needed

3. **Risk**: Form state conflicts with domain validation
   - **Mitigation**: Use domain validation as source of truth; form validation is UX sugar

4. **Risk**: Locale switching breaks existing startup flow
   - **Mitigation**: Test locale change + page refresh thoroughly; ensure IndexedDB errors are handled

5. **Risk**: Navigation breaks CurrentMatchStartupGate resume logic
   - **Mitigation**: Test resume flow after navigation; ensure session persistence works

## Estimated Effort

| Step      | Description                                | Estimated Hours |
| --------- | ------------------------------------------ | --------------- |
| 1         | Analyze Pencil design, identify components | 2               |
| 2         | Create missing UI components               | 6               |
| 3         | Create translation strings                 | 2               |
| 4         | Create form state and validation           | 3               |
| 5         | Implement SetupScreen component            | 6               |
| 6         | Create match ID and navigation             | 2               |
| 7         | Integration testing and QA                 | 3               |
| **Total** |                                            | **24 hours**    |

## Next Steps After Completion

1. PBW-16 (or next match screen issue) can implement the `/match/:id` route content
2. Add unit tests for UI components if not done during implementation
3. Consider adding E2E tests for complete setup flow
4. Update ARCHITECTURE.md with component reuse patterns
