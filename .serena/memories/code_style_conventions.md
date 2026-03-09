# Code Style and Conventions

## File Naming
- **React components**: `PascalCase.tsx` (e.g., `BaseUiPreview.tsx`, `NotFound.tsx`)
- **Component tests**: Mirror component name with test suffix (e.g., `BaseUiPreview.browser.test.tsx`)
- **Non-component modules**: `kebab-case.ts` (e.g., `render-component.tsx`, `match-state.ts`)
- **CSS Modules**: Match component basename (e.g., `BaseUiPreview.module.css`)
- **Global/shared stylesheets**: `kebab-case.css`

## Code Naming
- **Files**: snake_case/kebab-case
- **Code symbols**: camelCase
- **Components**: PascalCase

## Indentation
- 2 spaces

## Comments
- DO NOT add comments unless explicitly asked

## Git Conventions
- **Branch naming**: `feature/PBW-[id]-[title]` (id is Linear issue number)
- **Commit format**: `[type]: [description]`
  - Types: feat, fix, docs, style, refactor, test, chore

## Project Management
- **Issue tracking**: Linear (team: PadelBuddy Web)
- **Linear Project**: https://linear.app/padelbuddyweb/project/padelbuddyweb-058096212a6f
- **Issue IDs**: Use Linear identifier (e.g., `PBW-123`)
- **Dependencies**: Use `Depends On` with issue links

## CSS Units
- Prefer `rpx` (responsive pixel)
- Use `px` only for fixed sizing

## Accessibility
- Minimum touch targets: 48px
- Respect `prefers-reduced-motion`
- Semantic markup with focus visibility
