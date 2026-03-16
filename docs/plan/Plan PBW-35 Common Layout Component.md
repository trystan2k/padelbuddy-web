## Task Analysis

- **Main objective**: Create a reusable Common Layout component that provides the structural shell for all application screens. The layout should define Header, Body/Main, and Footer/Action sections using named slots with children-as-body pattern. This component will be used to refactor the Setup Screen while maintaining exact visual appearance.

- **Identified dependencies**:
  - **PBW-15** (Setup Screen and Match Bootstrap UX): Done - merged PR #16. This provides the current SetupScreen implementation that will be refactored.
  - **Design tokens**: Available in `design-tokens/dist/variables.css` with semantic color/typography variables
  - **Pencil design**: `docs/design/padelbuddyweb.pen` defines the Setup Screen layout structure (node ID: `bi8Au`)
  - **Existing patterns**: CSS Modules with design tokens, `cn` utility for class names, TypeScript interfaces

- **System impact**:
  - Creates new `Layout` component in `src/components/Layout/`
  - Refactors `SetupScreen` to use the Layout component
  - Moves background gradient styles from SetupScreen to Layout
  - No changes to routing, state management, or business logic
  - No changes to visual appearance (requirement)

## Chosen Approach

- **Proposed solution**: Create a minimal Layout component that extracts the shell structure (background gradient, container, header/body/footer sections) from the current SetupScreen implementation. The Layout component will accept `header` and `footer` as optional named slots, with `children` as the body content. This follows the agreed API pattern:

  ```tsx
  <Layout header={<Header />} footer={<Footer />}>
    {/* Body content as children */}
  </Layout>
  ```

- **Justification for simplicity**:
  - **Minimal extraction** - Only the structural shell is extracted, not the content components
  - **Single gradient variant** - Same background for all screens as specified
  - **Preserves existing patterns** - Uses CSS Modules, design tokens, and component patterns already established
  - **Low risk** - No changes to visual appearance, easy to verify
  - **YAGNI compliant** - No over-engineering for future needs that may not materialize

  **Rejected alternatives**:
  1. **Multiple layout variants** - User specified single gradient variant; adding variants would be premature
  2. **Compound components** (Layout.Header, Layout.Footer) - More complex API without benefit for current needs
  3. **CSS Grid-based layout** - Current flexbox approach works well; changing would increase risk
  4. **Render props pattern** - Named slots with children-as-body is simpler and matches user's preferred API

- **Components to be modified/created**:
  - **New**: `src/components/Layout/Layout.tsx` - Layout component with header/footer/body slots
  - **New**: `src/components/Layout/Layout.module.css` - Layout styles (background, container, sections)
  - **New**: `src/components/Layout/index.ts` - Barrel export
  - **Modified**: `src/components/SetupScreen/SetupScreen.tsx` - Refactor to use Layout component
  - **Modified**: `src/components/SetupScreen/SetupScreen.module.css` - Remove extracted styles

## Implementation Steps

### Step 1: Analyze Current SetupScreen Layout Structure

**Goal**: Document the exact structure and styles that will be extracted to the Layout component.

1.1. Review current SetupScreen structure from `src/components/SetupScreen/SetupScreen.tsx`:

```tsx
<main className={styles.page}>
  <div className={styles.container}>
    <header className={styles.header}>...</header>
    <div className={styles.main}>...</div>
    <footer className={styles.footer}>...</footer>
  </div>
</main>
```

1.2. Document CSS styles to extract from `SetupScreen.module.css`:

- `.page` - Full viewport height, flex column, background gradient, positioning context
- `.container` - Flex column, gap 28px, padding 28px/32px, max-width 1024px, centered
- `.header` - Flex row, space-between, align center
- `.main` - Flex grow, flex column, gap 24px
- `.footer` - Margin-top auto

  1.3. Document background gradient implementation:

```css
.page {
  background: linear-gradient(180deg, var(--base-color-surface-canvas) 0%, #e9f3df 100%);
}

.page::before {
  /* Radial gradient overlay */
  content: '';
  position: absolute;
  top: -5%;
  left: -10%;
  width: 50%;
  height: 40%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--base-color-brand-highlight) 100%, transparent) 0%,
    transparent 70%
  );
  opacity: 0.2;
  pointer-events: none;
}
```

1.4. Verify design tokens for gradient colors:

- `--base-color-surface-canvas` = `#f4f0e7` (start color)
- `--base-color-brand-highlight` = `#d8ea42` (radial overlay)
- End color `#e9f3df` is a derived tint (may need to add as token or keep as literal)

**Checkpoint**: Structure documented; CSS properties catalogued; design tokens identified.

### Step 2: Define Layout Component Interface

**Goal**: Create the TypeScript interface and component skeleton.

2.1. Create `src/components/Layout/Layout.tsx` with interface:

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import styles from './Layout.module.css'

export interface LayoutProps {
  /** Optional header content (navigation, metadata, etc.) */
  header?: ReactNode
  /** Optional footer content (primary actions, buttons, etc.) */
  footer?: ReactNode
  /** Main body content */
  children: ReactNode
  /** Additional CSS class for the layout container */
  className?: string
}

export function Layout({ header, footer, children, className }: LayoutProps) {
  return (
    <main className={cn(styles.layout, className)}>
      <div className={styles.container}>
        {header && <header className={styles.header}>{header}</header>}
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </main>
  )
}
```

2.2. Key design decisions:

- Use semantic HTML elements (`<main>`, `<header>`, `<footer>`)
- Conditionally render header/footer only when provided
- Body always renders (children is required)
- Support optional `className` for edge case extensions

**Checkpoint**: Interface defined; component skeleton created; TypeScript compiles without errors.

### Step 3: Create Design Token for Gradient End Color

**Goal**: Add a design token for the gradient end color to avoid hardcoded literals.

3.1. Add to `design-tokens/semantic/color.json`:

```json
{
  "surface": {
    "canvas": {
      "value": "{base.color.neutral.50}",
      "type": "color",
      "description": "Primary canvas background color"
    },
    "canvas-end": {
      "value": "#e9f3df",
      "type": "color",
      "description": "Canvas background gradient end color"
    }
  }
}
```

3.2. Rebuild design tokens: `pnpm build:tokens`

3.3. Verify the new token is generated in `design-tokens/dist/variables.css`:

- `--semantic-color-surface-canvas-end: #e9f3df;`

**Checkpoint**: Design token created; tokens rebuilt; new variable available.

### Step 4: Create Layout CSS Module

**Goal**: Extract and organize CSS styles from SetupScreen into Layout module.

3.1. Create `src/components/Layout/Layout.module.css`:

```css
/* Layout shell - full viewport with background gradient */
.layout {
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile */
  display: flex;
  flex-direction: column;
  background: linear-gradient(
    180deg,
    var(--semantic-color-surface-canvas) 0%,
    var(--semantic-color-surface-canvas-end) 100%
  );
  position: relative;
  overflow: hidden;
}

/* Radial gradient overlay - decorative accent */
.layout::before {
  content: '';
  position: absolute;
  top: -5%;
  left: -10%;
  width: 50%;
  height: 40%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--base-color-brand-highlight) 100%, transparent) 0%,
    transparent 70%
  );
  opacity: 0.2;
  pointer-events: none;
}

/* Container - centers content and applies consistent padding */
.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--base-space-28);
  padding: var(--base-space-28) var(--base-space-32);
  max-width: var(--app-screen-tablet-landscape-width);
  width: 100%;
  margin: 0 auto;
}

/* Header section - top navigation/metadata area */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Body section - main content area, grows to fill space */
.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--base-space-24);
}

/* Footer section - action area, pinned to bottom */
.footer {
  margin-top: auto;
}
```

4.2. Design token mapping:

- `var(--base-space-28)` for container gap and padding
- `var(--base-space-32)` for horizontal padding
- `var(--base-space-24)` for body gap
- `var(--app-screen-tablet-landscape-width)` for max-width (1024px)
- `var(--semantic-color-surface-canvas)` for gradient start
- `var(--semantic-color-surface-canvas-end)` for gradient end
- `var(--base-color-brand-highlight)` for radial overlay

  3.3. Gradient end color token:

- `#e9f3df` is a specific tint not currently in design tokens
- **Decision**: Create a design token for this color following existing patterns
- Add to `design-tokens/semantic/color.json` as a semantic surface token
- Token name: `surface-canvas-end` (following pattern of `surface-canvas`)
- This ensures all colors are tokenized and maintainable

**Checkpoint**: CSS module created; all design tokens used where available; styles match current implementation.

### Step 5: Create Barrel Export

**Goal**: Add Layout component to the component index for clean imports.

4.1. Create `src/components/Layout/index.ts`:

```ts
export { Layout, type LayoutProps } from './Layout'
```

4.2. Consider adding to main components index (optional):

- Currently `src/components/ui/index.ts` is for UI primitives
- Layout is a structural component, not a UI primitive
- **Decision**: Keep separate; import directly from `@/components/Layout`

**Checkpoint**: Barrel export created; component can be imported via `@/components/Layout`.

### Step 6: Refactor SetupScreen to Use Layout

**Goal**: Replace SetupScreen's internal layout structure with the Layout component.

5.1. Update `src/components/SetupScreen/SetupScreen.tsx`:

**Before:**

```tsx
return (
  <main className={styles.page}>
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.appName}>{t('setup.header.appName')}</h1>
        <div className={styles.localeWrapper}>...</div>
      </header>
      <div className={styles.main}>
        {/* Left column - Teams */}
        {/* Right column - Options */}
      </div>
      <footer className={styles.footer}>
        <PrimaryButton onClick={handleStartMatch} disabled={isStarting || hasErrors}>
          {t('setup.startButton')}
        </PrimaryButton>
      </footer>
    </div>
  </main>
)
```

**After:**

```tsx
import { Layout } from '@/components/Layout'

// ... inside component:

const headerContent = (
  <>
    <h1 className={styles.appName}>{t('setup.header.appName')}</h1>
    <div className={styles.localeWrapper}>
      <LocaleChip ... />
      {showLocaleMenu && <div className={styles.localeMenu}>...</div>}
    </div>
  </>
)

const footerContent = (
  <PrimaryButton onClick={handleStartMatch} disabled={isStarting || hasErrors}>
    {t('setup.startButton')}
  </PrimaryButton>
)

return (
  <Layout header={headerContent} footer={footerContent}>
    {/* Left column - Teams */}
    <div className={styles.leftColumn}>...</div>

    {/* Right column - Options */}
    <div className={styles.rightColumn}>...</div>
  </Layout>
)
```

5.2. Key refactoring points:

- Remove `<main>`, `.container`, `.header`, `.main`, `.footer` wrapper elements
- Extract header content into a variable for clarity
- Extract footer content into a variable for clarity
- Keep all SetupScreen-specific styles in SetupScreen.module.css
- Children become the body content directly

**Checkpoint**: SetupScreen uses Layout component; all functionality preserved; TypeScript compiles.

### Step 7: Update SetupScreen CSS Module

**Goal**: Remove extracted styles and keep only SetupScreen-specific styles.

6.1. Remove from `SetupScreen.module.css`:

```css
/* REMOVE THESE */
.page { ... }
.page::before { ... }
.container { ... }
.header { ... }
.main { ... }
.footer { ... }
```

6.2. Keep in `SetupScreen.module.css`:

```css
/* Keep these SetupScreen-specific styles */
.appName { ... }
.localeWrapper { ... }
.localeMenu { ... }
.leftColumn { ... }
.rightColumn { ... }
.teamCard { ... }
.errorText { ... }
.serverRow { ... }
.serverChipText { ... }
.serverChipTextSelected { ... }
.serverChipTextUnselected { ... }
.formatRow { ... }
.formatChipText { ... }
.formatChipTextSelected { ... }
.formatChipTextUnselected { ... }
.rulesCard { ... }

/* Keep responsive breakpoint */
@media (width >= 48rem) {
  .leftColumn,
  .rightColumn {
    flex: 1;
  }
}
```

6.3. Update responsive layout handling:

- The 2-column layout is handled by the media query on `.leftColumn` and `.rightColumn`
- The Layout component's `.body` provides the flex container
- Need to add responsive flex-direction to `.body` or handle in SetupScreen

**Wait!** Current SetupScreen has this responsive rule:

```css
@media (width >= 48rem) {
  .main {
    flex-direction: row;
    align-items: flex-start;
  }
}
```

This needs to be handled. Options:

1. Add a `bodyClassName` prop to Layout for custom body styles
2. Add responsive styles in SetupScreen that target Layout's body via `:global`
3. Create a wrapper div in SetupScreen for responsive layout

**Decision**: Use option 3 (wrapper div) - simplest and doesn't require Layout changes:

```tsx
<Layout header={headerContent} footer={footerContent}>
  <div className={styles.mainContent}>
    <div className={styles.leftColumn}>...</div>
    <div className={styles.rightColumn}>...</div>
  </div>
</Layout>
```

6.4. Update CSS with new wrapper:

```css
.mainContent {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--base-space-24);
}

@media (width >= 48rem) {
  .mainContent {
    flex-direction: row;
    align-items: flex-start;
  }

  .leftColumn,
  .rightColumn {
    flex: 1;
  }
}
```

**Checkpoint**: Extracted styles removed; SetupScreen-specific styles preserved; responsive layout works.

### Step 8: Visual Verification

**Goal**: Ensure the refactored SetupScreen looks identical to the original.

7.1. Start development server: `pnpm dev`

7.2. Visual comparison checklist:

- [ ] Background gradient renders correctly (linear + radial overlay)
- [ ] Container is centered with correct max-width (1024px)
- [ ] Header shows app name on left, locale chip on right
- [ ] Body content shows two columns on desktop (768px+)
- [ ] Body content shows single column on mobile (< 768px)
- [ ] Footer button is pinned to bottom
- [ ] All spacing matches original (28px container gap, 24px body gap, etc.)
- [ ] Typography and colors unchanged

  7.3. Responsive testing:

- [ ] 375px width (mobile) - single column layout
- [ ] 768px width (tablet) - two column layout starts
- [ ] 1024px width (desktop) - two column layout, max-width constrained
- [ ] 1440px width (large desktop) - max-width 1024px, centered

  7.4. Interaction testing:

- [ ] Locale chip toggles menu
- [ ] Locale menu items work
- [ ] Form inputs work
- [ ] Toggle switches work
- [ ] "Start Match" button navigates to match route

**Checkpoint**: Visual appearance matches original; responsive breakpoints work; interactions preserved.

### Step 9: Quality Verification

**Goal**: Run all quality checks to ensure no regressions.

8.1. Run linting: `pnpm lint`
8.2. Run type checking: `pnpm typecheck`
8.3. Run tests: `pnpm test`
8.4. Run complete check: `pnpm complete-check`

8.5. Verify no TypeScript errors:

```bash
# Should compile without errors
pnpm build
```

**Checkpoint**: All quality checks pass; no TypeScript errors; build succeeds.

### Step 10: Create Pull Request

**Goal**: Create PR with clear description of changes.

9.1. Create branch: `feature/pbw-35-common-layout-component`

9.2. Commit changes:

```bash
git add .
git commit -m "feat: add Common Layout component and refactor SetupScreen

- Create Layout component with header/footer/body slots
- Extract background gradient to Layout
- Refactor SetupScreen to use Layout component
- Maintain exact visual appearance
- Use design tokens for all styles"
```

9.3. Push and create PR with description:

- What changed: Added Layout component, refactored SetupScreen
- Why: Create reusable layout shell for all screens
- Visual verification: Screenshots showing before/after match
- Testing: Manual responsive testing completed

**Checkpoint**: PR created with clear description; ready for review.

## Validation

### Success Criteria

1. **Layout component created** at `src/components/Layout/` with correct interface:
   - `header?: ReactNode` - optional header slot
   - `footer?: ReactNode` - optional footer slot
   - `children: ReactNode` - required body content
   - `className?: string` - optional additional classes

2. **Layout applies correct background gradient** from Pencil design:
   - Linear gradient from `--semantic-color-surface-canvas` to `--semantic-color-surface-canvas-end`
   - Radial gradient overlay with `--base-color-brand-highlight` at 20% opacity

3. **Layout uses design tokens** for all colors, spacing, typography:
   - `--semantic-color-surface-canvas` for gradient start
   - `--semantic-color-surface-canvas-end` for gradient end
   - `--base-space-28` for container gap
   - `--base-space-32` for padding
   - `--base-space-24` for body gap
   - `--app-screen-tablet-landscape-width` for max-width

4. **Setup Screen refactored** to use Common Layout:
   - Header content passed as `header` prop
   - Footer content passed as `footer` prop
   - Main content passed as `children`
   - All functionality preserved

5. **Responsive design works** on mobile (375px) and desktop (1024px+):
   - Single column on mobile
   - Two columns on desktop (768px+)
   - Max-width 1024px, centered

6. **No hardcoded content** in layout - all sections receive content via props

7. **Visual appearance unchanged** from current implementation:
   - Side-by-side comparison shows no differences
   - All spacing, colors, typography match

### Checkpoints

| Step | Checkpoint             | Verification Method                            |
| ---- | ---------------------- | ---------------------------------------------- |
| 1    | Structure documented   | Review documented CSS properties               |
| 2    | Interface defined      | TypeScript compiles without errors             |
| 3    | Design token created   | Token generated in variables.css               |
| 4    | CSS module created     | All design tokens used correctly               |
| 5    | Barrel export created  | Import works via `@/components/Layout`         |
| 6    | SetupScreen refactored | TypeScript compiles, functionality preserved   |
| 7    | CSS updated            | Extracted styles removed, specific styles kept |
| 8    | Visual verification    | Manual browser testing at multiple viewports   |
| 9    | Quality verification   | `pnpm complete-check` passes                   |
| 10   | PR created             | PR description clear, screenshots attached     |

### Rollback Notes

If issues arise during implementation:

1. **Visual regression**:
   - Compare computed styles in DevTools between original and refactored
   - Check for missing CSS properties or incorrect values
   - Verify pseudo-element `::before` is rendering

2. **Responsive layout breaks**:
   - Check that `.mainContent` wrapper is present
   - Verify media query is targeting correct breakpoint
   - Ensure flex-direction changes on desktop

3. **Layout component too rigid**:
   - Can add `bodyClassName` prop if needed for custom body styles
   - Can add `headerClassName` / `footerClassName` props if needed
   - **Note**: Only add these if actually needed - prefer simplicity

4. **Complete rollback**:
   - Revert all changes to restore original SetupScreen
   - Document what didn't work for future reference

## File Structure (Post-Implementation)

```
design-tokens/
├── semantic/
│   └── color.json               # MODIFIED - Add surface-canvas-end token
└── dist/
    └── variables.css            # GENERATED - Will include new token

src/
├── components/
│   ├── Layout/
│   │   ├── Layout.tsx           # NEW - Layout component
│   │   ├── Layout.module.css    # NEW - Layout styles
│   │   └── index.ts             # NEW - Barrel export
│   ├── SetupScreen/
│   │   ├── SetupScreen.tsx      # MODIFIED - Uses Layout component
│   │   ├── SetupScreen.module.css # MODIFIED - Removed extracted styles
│   │   ├── useSetupForm.ts      # UNCHANGED
│   │   └── validateSetupForm.ts # UNCHANGED
│   ├── ui/                      # UNCHANGED
│   └── ...
└── ...
```

## Dependencies and Risks

### Dependencies

- **PBW-15** (Setup Screen) - Done, provides the implementation to refactor
- **Design tokens** - Already exist in `design-tokens/dist/variables.css`
- **Pencil design** - Reference for visual verification

### Risks and Mitigations

| Risk                                    | Likelihood | Impact | Mitigation                           |
| --------------------------------------- | ---------- | ------ | ------------------------------------ |
| Visual regression                       | Medium     | High   | Side-by-side comparison before/after |
| Responsive layout breaks                | Medium     | Medium | Test at multiple viewports           |
| Gradient colors don't match exactly     | Low        | Medium | Use exact values from current CSS    |
| Component API doesn't meet future needs | Low        | Low    | Keep API minimal, extend later       |

## Estimated Effort

| Step      | Description                          | Estimated Time |
| --------- | ------------------------------------ | -------------- |
| 1         | Analyze current structure            | 30 min         |
| 2         | Define Layout interface              | 15 min         |
| 3         | Create design token for gradient end | 10 min         |
| 4         | Create Layout CSS module             | 30 min         |
| 5         | Create barrel export                 | 5 min          |
| 6         | Refactor SetupScreen                 | 45 min         |
| 7         | Update SetupScreen CSS               | 30 min         |
| 8         | Visual verification                  | 30 min         |
| 9         | Quality verification                 | 15 min         |
| 10        | Create PR                            | 15 min         |
| **Total** |                                      | **~3.5 hours** |

## Next Steps After Completion

1. **PBW-36 (or next match screen issue)** can use Layout component for Match Screen
2. **PBW-37 (or end screen issue)** can use Layout component for Match End Screen
3. Consider adding unit tests for Layout component
4. Consider adding Storybook story for Layout component documentation
