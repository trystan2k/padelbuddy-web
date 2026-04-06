# Execution Plan: PBW-39 - Migrate UI Components to base-ui

## Task Analysis

- **Main objective:** Migrate 5 UI components from custom implementations to base-ui primitives for built-in accessibility
- **Identified dependencies:**
  - Consumer: `src/components/SetupScreen/SetupScreen.tsx` (Divider, PrimaryButton, TextInput, SelectableChip)
  - Consumer: `src/components/ActiveMatchScreen/TopBar/TopBar.tsx` (LocaleChip)
  - Tests: All component tests in `test/components/ui/`
- **System impact:** Low - component API remains compatible, only internal implementation changes

## Chosen Approach

- **Proposed solution:** Sequential migration of all 5 components in a single PR, preserving backward-compatible APIs while adopting base-ui primitives internally
- **Justification for simplicity:**
  - All components are simple with minimal state
  - Existing Toggle component already demonstrates the pattern
  - API changes are minor (e.g., `onClick` → `onPressedChange`) and well-documented
  - Single PR reduces integration overhead and maintains consistency
- **Components to be modified:**
  1. `Divider` - Replace `<div role="separator">` with `Separator.Root`
  2. `PrimaryButton` - Replace native `<button>` with `Button.Root`
  3. `TextInput` - Replace native `<input>` with `Input` (base-ui Input is a styled native input, evaluate necessity)
  4. `SelectableChip` - Replace `<button aria-pressed>` with `Toggle.Root`
  5. `LocaleChip` - Replace native `<button>` with `Toggle.Root`

---

## Implementation Steps

### Step 1: Migrate Divider Component

**Complexity:** Low
**Risk:** Minimal - single component, no callbacks

#### 1.1 Update Divider.tsx

**File:** `src/components/ui/Divider/Divider.tsx`

```tsx
import { Separator } from '@base-ui/react/separator';
import { cn } from '@/lib/utils/cn';
import styles from './Divider.module.css';

export interface DividerProps {
  className?: string;
}

export function Divider({ className }: DividerProps) {
  return <Separator.Root orientation="horizontal" className={cn(styles.divider, className)} />;
}
```

#### 1.2 Update Divider.module.css

**File:** `src/components/ui/Divider/Divider.module.css`

No changes needed - base-ui Separator.Root accepts className directly.

#### 1.3 Update Divider Tests

**File:** `test/components/ui/Divider/Divider.browser.test.tsx`

- Tests should continue to pass (role="separator" is provided by base-ui)
- Add test for data attributes if needed: `data-orientation="horizontal"`

---

### Step 2: Migrate PrimaryButton Component

**Complexity:** Low
**Risk:** Low - single callback prop

#### 2.1 Update PrimaryButton.tsx

**File:** `src/components/ui/PrimaryButton/PrimaryButton.tsx`

```tsx
import type { ReactNode } from 'react';
import { Button } from '@base-ui/react/button';
import { cn } from '@/lib/utils/cn';
import styles from './PrimaryButton.module.css';

export interface PrimaryButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className
}: PrimaryButtonProps) {
  return (
    <Button.Root
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(styles.button, className)}
    >
      {children}
    </Button.Root>
  );
}
```

**Note:** base-ui Button.Root renders a native `<button>` by default, so the oxlint-disable comment for `button-has-type` is no longer needed.

#### 2.2 Update PrimaryButton.module.css

**File:** `src/components/ui/PrimaryButton/PrimaryButton.module.css`

Add data attribute selectors for disabled state:

```css
.button:disabled,
.button[data-disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}
```

**Rationale:** base-ui may use `data-disabled` attribute instead of `:disabled` pseudo-class.

#### 2.3 Update PrimaryButton Tests

**File:** `test/components/ui/PrimaryButton/PrimaryButton.browser.test.tsx`

- All existing tests should pass
- Add test for `data-disabled` attribute if base-ui uses it

---

### Step 3: Migrate TextInput Component

**Complexity:** Low
**Risk:** Low - controlled input pattern

#### 3.1 Evaluate base-ui Input Necessity

**Decision:** base-ui `Input` is essentially a styled wrapper. Since our TextInput has custom styling via CSS Modules and specific accent handling, we should evaluate if base-ui provides value.

**Recommendation:** After analysis, base-ui Input (from `@base-ui/react/input`) provides:

- Consistent accessibility patterns
- Better integration with base-ui form components

**File:** `src/components/ui/TextInput/TextInput.tsx`

```tsx
import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { Input } from '@base-ui/react/input';
import { cn } from '@/lib/utils/cn';
import type { Accent } from '../types';
import styles from './TextInput.module.css';

export type TextInputAccent = Accent;

export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  accent?: TextInputAccent;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  disabled,
  accent,
  className,
  id,
  'aria-label': ariaLabel
}: TextInputProps) {
  const accentClass =
    accent === 'primary'
      ? styles.accentPrimary
      : accent === 'secondary'
        ? styles.accentSecondary
        : undefined;

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <Input
      type="text"
      id={id}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      className={cn(styles.input, accentClass, className)}
      aria-label={ariaLabel}
    />
  );
}
```

#### 3.2 Update TextInput.module.css

**File:** `src/components/ui/TextInput/TextInput.module.css`

Add data attribute selectors:

```css
.input:disabled,
.input[data-disabled] {
  cursor: not-allowed;
  opacity: 0.6;
}
```

#### 3.3 Update TextInput Tests

**File:** `test/components/ui/TextInput/TextInput.browser.test.tsx`

- All existing tests should pass
- Verify `role="textbox"` is maintained

---

### Step 4: Migrate SelectableChip Component

**Complexity:** Medium
**Risk:** Medium - has accent and selected state management

#### 4.1 Update SelectableChip.tsx

**File:** `src/components/ui/SelectableChip/SelectableChip.tsx`

```tsx
import type { ReactNode } from 'react';
import { Toggle } from '@base-ui/react/toggle';
import { cn } from '@/lib/utils/cn';
import type { Accent } from '../types';
import styles from './SelectableChip.module.css';

export type SelectableChipAccent = Accent;

export interface SelectableChipProps {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
  accent?: SelectableChipAccent;
  disabled?: boolean;
  className?: string;
  showDot?: boolean;
}

export function SelectableChip({
  children,
  selected,
  onClick,
  accent,
  disabled = false,
  className,
  showDot = false
}: SelectableChipProps) {
  const accentClass =
    accent === 'primary'
      ? styles.accentPrimary
      : accent === 'secondary'
        ? styles.accentSecondary
        : undefined;

  return (
    <Toggle.Root
      pressed={selected}
      onPressedChange={onClick}
      disabled={disabled}
      className={cn(styles.chip, accentClass, className)}
    >
      <span className={styles.content}>
        {showDot && accent && <span className={styles.dot} aria-hidden="true" />}
        {children}
      </span>
    </Toggle.Root>
  );
}
```

**API Change:** `onClick` is now called via `onPressedChange`. This is semantically cleaner as it explicitly indicates a toggle state change.

#### 4.2 Update SelectableChip.module.css

**File:** `src/components/ui/SelectableChip/SelectableChip.module.css`

Replace `.selected` class with `data-pressed` attribute selector:

```css
/* Before */
.selected {
  border-color: var(--semantic-color-border-accent-primary);
  background-color: var(--semantic-color-background-accent-primary-subtle);
}

/* After - add data attribute selector */
.chip[data-pressed] {
  border-color: var(--semantic-color-border-accent-primary);
  background-color: var(--semantic-color-background-accent-primary-subtle);
}

/* Update accent selectors */
.accentPrimary[data-pressed] {
  border-color: var(--semantic-color-border-accent-primary);
  background-color: var(--semantic-color-background-accent-primary-subtle);
}

.accentSecondary[data-pressed] {
  border-color: var(--semantic-color-border-accent-secondary);
  background-color: var(--semantic-color-background-accent-secondary-subtle);
}
```

Also add data-disabled selector:

```css
.chip:disabled,
.chip[data-disabled] {
  cursor: not-allowed;
  opacity: 0.6;
}
```

#### 4.3 Update SelectableChip Tests

**File:** `test/components/ui/SelectableChip/SelectableChip.browser.test.tsx`

- Update test to check for `aria-pressed` (base-ui Toggle provides this)
- Add test for `data-pressed` attribute
- Add test for `data-disabled` attribute

---

### Step 5: Migrate LocaleChip Component

**Complexity:** Medium
**Risk:** Medium - dual mode (toggle vs dropdown trigger)

#### 5.1 Analyze LocaleChip Dual Mode

LocaleChip has two usage patterns:

1. **Toggle mode:** Simple locale selection (`aria-pressed`)
2. **Dropdown trigger mode:** Opens locale menu (`aria-expanded`, `aria-controls`)

**Decision:** Use `Toggle.Root` with conditional rendering for dropdown attributes.

#### 5.2 Update LocaleChip.tsx

**File:** `src/components/ui/LocaleChip/LocaleChip.tsx`

```tsx
import { Toggle } from '@base-ui/react/toggle';
import { cn } from '@/lib/utils/cn';
import styles from './LocaleChip.module.css';

export interface LocaleChipProps {
  /** Flag emoji to display */
  flag: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  /** For dropdown triggers: indicates whether the dropdown is expanded */
  'aria-expanded'?: boolean;
  /** For dropdown triggers: references the controlled element */
  'aria-controls'?: string;
}

export function LocaleChip({
  flag,
  label,
  onClick,
  active = false,
  className,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls
}: LocaleChipProps) {
  // When used as dropdown trigger, we need custom aria handling
  const isDropdownTrigger = ariaExpanded !== undefined;

  if (isDropdownTrigger) {
    // Dropdown trigger mode - render as regular button with custom aria
    return (
      <Toggle.Root
        pressed={active}
        onPressedChange={onClick}
        className={cn(styles.chip, active && styles.active, className)}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        // Suppress aria-pressed when aria-expanded is present
        aria-pressed={undefined}
      >
        <span aria-hidden="true">{flag}</span>
        <span className={styles.text}>{label}</span>
      </Toggle.Root>
    );
  }

  // Toggle mode - standard toggle behavior
  return (
    <Toggle.Root
      pressed={active}
      onPressedChange={onClick}
      className={cn(styles.chip, active && styles.active, className)}
    >
      <span aria-hidden="true">{flag}</span>
      <span className={styles.text}>{label}</span>
    </Toggle.Root>
  );
}
```

#### 5.3 Update LocaleChip.module.css

**File:** `src/components/ui/LocaleChip/LocaleChip.module.css`

Replace `.active` class with `data-pressed` attribute selector:

```css
/* Before */
.active {
  border-color: var(--semantic-color-border-accent-primary);
  background-color: var(--semantic-color-background-accent-primary-subtle);
}

/* After - add data attribute selector (keep .active for compatibility during transition) */
.active,
.chip[data-pressed] {
  border-color: var(--semantic-color-border-accent-primary);
  background-color: var(--semantic-color-background-accent-primary-subtle);
}
```

Also add data-disabled selector:

```css
.chip:disabled,
.chip[data-disabled] {
  cursor: not-allowed;
  opacity: 0.6;
}
```

#### 5.4 Update LocaleChip Tests

**File:** `test/components/ui/LocaleChip/LocaleChip.browser.test.tsx`

- Update tests for `data-pressed` attribute
- Add test for `data-disabled` attribute
- Verify dropdown trigger mode still works correctly

---

### Step 6: Update Consumer Components (If Needed)

#### 6.1 SetupScreen.tsx

**File:** `src/components/SetupScreen/SetupScreen.tsx`

**Changes:** No changes needed. The component API remains compatible:

- `Divider` - Same props
- `PrimaryButton` - Same props (`onClick` works with Button.Root)
- `TextInput` - Same props
- `SelectableChip` - Same props (`onClick` is passed to `onPressedChange`)

#### 6.2 TopBar.tsx

**File:** `src/components/ActiveMatchScreen/TopBar/TopBar.tsx`

**Changes:** No changes needed. LocaleChip API remains compatible.

---

### Step 7: Run Full Test Suite

```bash
# Run component tests
pnpm test test/components/ui/

# Run full test suite
pnpm test

# Run linting and formatting
pnpm lint
pnpm format

# Run complete check
pnpm complete-check
```

---

### Step 8: Manual Verification

- [ ] Visual regression check: Compare before/after screenshots
- [ ] Keyboard navigation: Tab through all components
- [ ] Screen reader testing: Verify ARIA announcements
- [ ] Mobile touch: Verify tap targets and interactions

---

## Validation

### Success Criteria

- [ ] Divider uses `Separator.Root` with `role="separator"`
- [ ] PrimaryButton uses `Button.Root` with proper button role
- [ ] TextInput uses base-ui `Input` with `role="textbox"`
- [ ] SelectableChip uses `Toggle.Root` with `aria-pressed`
- [ ] LocaleChip uses `Toggle.Root` with dual mode support
- [ ] All component tests pass
- [ ] `pnpm complete-check` passes with no regressions
- [ ] Visual appearance unchanged

### Checkpoints

| Step | Checkpoint              | Verification                                          |
| ---- | ----------------------- | ----------------------------------------------------- |
| 1    | Divider migrated        | `pnpm test test/components/ui/Divider/` passes        |
| 2    | PrimaryButton migrated  | `pnpm test test/components/ui/PrimaryButton/` passes  |
| 3    | TextInput migrated      | `pnpm test test/components/ui/TextInput/` passes      |
| 4    | SelectableChip migrated | `pnpm test test/components/ui/SelectableChip/` passes |
| 5    | LocaleChip migrated     | `pnpm test test/components/ui/LocaleChip/` passes     |
| 6    | Consumers work          | `pnpm test test/components/SetupScreen/` passes       |
| 7    | Full suite passes       | `pnpm test` passes                                    |
| 8    | Quality gates pass      | `pnpm complete-check` passes                          |

### Rollback Plan

If issues arise:

1. Each component is independent - can rollback individual components
2. Git revert the specific commit
3. CSS changes are additive (data attribute selectors added, not replaced)

---

## Files to Modify

### Component Files

| File                                                  | Action | Description                      |
| ----------------------------------------------------- | ------ | -------------------------------- |
| `src/components/ui/Divider/Divider.tsx`               | Modify | Replace div with Separator.Root  |
| `src/components/ui/PrimaryButton/PrimaryButton.tsx`   | Modify | Replace button with Button.Root  |
| `src/components/ui/TextInput/TextInput.tsx`           | Modify | Replace input with base-ui Input |
| `src/components/ui/SelectableChip/SelectableChip.tsx` | Modify | Replace button with Toggle.Root  |
| `src/components/ui/LocaleChip/LocaleChip.tsx`         | Modify | Replace button with Toggle.Root  |

### CSS Files

| File                                                         | Action    | Description                         |
| ------------------------------------------------------------ | --------- | ----------------------------------- |
| `src/components/ui/Divider/Divider.module.css`               | No change | Styles apply to Separator.Root      |
| `src/components/ui/PrimaryButton/PrimaryButton.module.css`   | Modify    | Add data-disabled selector          |
| `src/components/ui/TextInput/TextInput.module.css`           | Modify    | Add data-disabled selector          |
| `src/components/ui/SelectableChip/SelectableChip.module.css` | Modify    | Replace .selected with data-pressed |
| `src/components/ui/LocaleChip/LocaleChip.module.css`         | Modify    | Add data-pressed selector           |

### Test Files

| File                                                                | Action | Description                          |
| ------------------------------------------------------------------- | ------ | ------------------------------------ |
| `test/components/ui/Divider/Divider.browser.test.tsx`               | Modify | Add data-orientation test            |
| `test/components/ui/PrimaryButton/PrimaryButton.browser.test.tsx`   | Modify | Add data-disabled test               |
| `test/components/ui/TextInput/TextInput.browser.test.tsx`           | Modify | Add data-disabled test               |
| `test/components/ui/SelectableChip/SelectableChip.browser.test.tsx` | Modify | Add data-pressed/data-disabled tests |
| `test/components/ui/LocaleChip/LocaleChip.browser.test.tsx`         | Modify | Add data-pressed test                |

---

## Edge Cases and Potential Issues

### 1. base-ui Input Component Availability

**Issue:** base-ui may not have a standalone Input component in v1.2.0.
**Mitigation:** If Input is unavailable, keep native `<input>` and document as intentional.

### 2. Toggle.Root aria-pressed Override

**Issue:** Toggle.Root sets `aria-pressed` automatically, but LocaleChip needs to suppress it when used as dropdown trigger.
**Mitigation:** Pass `aria-pressed={undefined}` to suppress in dropdown trigger mode.

### 3. CSS Specificity

**Issue:** Data attribute selectors may have different specificity than class selectors.
**Mitigation:** Use both selectors during transition (`.selected, [data-pressed]`).

### 4. onClick vs onPressedChange

**Issue:** Consumer components pass `onClick`, but Toggle.Root expects `onPressedChange`.
**Mitigation:** Map `onClick` to `onPressedChange` internally (callback signature is compatible).

---

## Estimated Effort

| Component      | Complexity | Estimated Time |
| -------------- | ---------- | -------------- |
| Divider        | Low        | 15 min         |
| PrimaryButton  | Low        | 15 min         |
| TextInput      | Low        | 15 min         |
| SelectableChip | Medium     | 30 min         |
| LocaleChip     | Medium     | 30 min         |
| Tests          | Medium     | 30 min         |
| Verification   | Low        | 15 min         |
| **Total**      |            | **2.5 hours**  |

---

## References

- [base-ui Separator](https://base-ui.com/react/components/separator)
- [base-ui Button](https://base-ui.com/react/components/button)
- [base-ui Input](https://base-ui.com/react/components/input)
- [base-ui Toggle](https://base-ui.com/react/components/toggle)
- [Existing Toggle Implementation](src/components/ui/Toggle/Toggle.tsx)
