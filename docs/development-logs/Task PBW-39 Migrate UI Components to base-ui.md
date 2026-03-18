---
title: Task PBW-39 Migrate UI Components to base-ui
type: note
permalink: development-logs/task-pbw-39-migrate-ui-components-to-base-ui
---

# Development Log: PBW-39

## Metadata

- Task ID: PBW-39
- Date (UTC): 2026-03-17T19:18:58Z
- Project: padelbuddy-web
- Branch: feature/PBW-39-migrate-ui-components-to-base-ui
- Commit: n/a

## Objective

- Migrate core UI components to base-ui to standardize primitives and leverage accessible, styled components.

## Implementation Summary

- Migrated 5 components to base-ui v1.2.0: Divider -> Separator, PrimaryButton -> Button, TextInput -> Input (onValueChange), SelectableChip -> Toggle, LocaleChip -> Button/Toggle dual-mode.
- Kept public APIs backward-compatible; no consumer changes required.

## Files Changed

- src/components/ui/Divider/Divider.tsx
- src/components/ui/PrimaryButton/PrimaryButton.tsx
- src/components/ui/TextInput/TextInput.tsx
- src/components/ui/SelectableChip/SelectableChip.tsx
- src/components/ui/LocaleChip/LocaleChip.tsx
- src/components/ActiveMatchScreen/TopBar/TopBar.tsx
- src/components/ui/PrimaryButton/PrimaryButton.module.css
- src/components/ui/TextInput/TextInput.module.css
- src/components/ui/SelectableChip/SelectableChip.module.css
- src/components/ui/LocaleChip/LocaleChip.module.css
- test/components/ui/Divider/Divider.browser.test.tsx
- test/components/ui/PrimaryButton/PrimaryButton.browser.test.tsx
- test/components/ui/TextInput/TextInput.browser.test.tsx
- test/components/ui/SelectableChip/SelectableChip.browser.test.tsx
- test/components/ui/LocaleChip/LocaleChip.browser.test.tsx

## Key Decisions

- API Compatibility: Maintain backwards-compatible APIs so consumers require no changes.
- CSS Strategy: Use hybrid approach leveraging base-ui data attributes ([data-pressed], [data-disabled], [data-orientation]) for styling.
- LocaleChip Architecture: Dual-mode based on presence of aria-expanded — dropdown triggers use Button (no aria-pressed), toggles use Toggle (aria-pressed semantics).
- base-ui Version: Adopted v1.2.0 stable API (Button, Toggle, Separator, Input).
- Accessibility: Added aria-haspopup support for dropdown triggers where applicable.

## Validation Performed

- TypeScript check: pass - no TS errors in project build (per QA results)
- Lint: pass - 0 warnings, 0 errors
- Unit Tests: pass - 616 tests passed (including +9 new tests)
- E2E: pass - 16 tests passed
- Build: pass - production build succeeded

## Lessons Learned

- Avoid relying on undocumented hacks like aria-pressed={undefined}; use semantic component choices instead.
- base-ui v1.2.0 uses simplified API names (Button, Toggle) vs earlier beta names.
- base-ui exposes useful data attributes that remove need for manual class toggling.
- Prefer onValueChange for controlled Input usage over wrapping onChange.

## Risks and Follow-ups

- Monitor for base-ui breaking changes in future versions; pin dependency and review on upgrade.
- Add a short migration note in the changelog documenting data-attribute CSS selectors for future contributors.
