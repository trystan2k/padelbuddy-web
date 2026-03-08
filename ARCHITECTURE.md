# ARCHITECTURE.md

## 1. High-Level Architecture

Padel Buddy Web is currently a client-only **TanStack Start** application built on **Vite** and **React 19**. The app uses TanStack Start file-based routes for the shell, **Base UI** for accessible primitives, and TypeScript domain modules under `src/core` for shared match-related types and constants.

Automated testing is centered on **Vitest** with two explicit projects:

- `unit` for Node-based module tests.
- `browser` for real browser component tests backed by Playwright.

## 2. Directory Structure

### 2.1 File Naming Conventions

- React component files use `PascalCase` (for example, `BaseUiPreview.tsx`, `NotFound.tsx`).
- Component test files mirror the component name in `PascalCase` and keep the test suffix (for example, `BaseUiPreview.browser.test.tsx`).
- General TypeScript modules that are not React components use `kebab-case` (for example, `render-component.tsx`, `match-state.ts`).
- Component-scoped CSS Modules use the same `PascalCase` basename as the component they style (for example, `BaseUiPreview.module.css`).
- Global or shared stylesheet files use `kebab-case` unless they intentionally match a colocated component.

```text
├── .github/
│   └── workflows/                 # CI workflow definitions
├── .husky/                        # Git hooks
├── docs/                          # Planning and project documentation
├── src/
│   ├── components/
│   │   ├── BaseUiPreview.tsx      # Base UI foundation preview component
│   │   ├── BaseUiPreview.module.css
│   │   └── NotFound.tsx
│   ├── core/
│   │   └── match/
│   │       ├── index.ts           # Match domain re-export surface
│   │       └── types.ts           # Match constants and TypeScript interfaces
│   ├── routes/
│   │   ├── __root.tsx             # Document shell and global stylesheet link
│   │   └── index.tsx              # Home route using the preview component
│   ├── routeTree.gen.ts           # Generated TanStack route tree
│   ├── router.tsx                 # Router factory and registration
│   └── styles.css                 # Global app styles
├── test/
│   ├── components/
│   │   └── BaseUiPreview.browser.test.tsx
│   ├── core/
│   │   └── match/
│   │       └── index.test.ts
│   ├── setup/
│   │   ├── browser.ts             # Browser-mode setup imports
│   │   └── shared.ts              # Shared Vitest cleanup/reset hooks
│   └── utils/
│       └── render-component.tsx   # Shared browser render helper
├── biome.json                     # Linting and formatting
├── package.json                   # Scripts and dependencies
├── vite.config.ts                 # App build/runtime config
└── vitest.config.ts               # Vitest projects and coverage config
```

## 3. Application Structure

### 3.1 App Shell and Routing

- `src/routes/__root.tsx` defines the HTML document shell, metadata, stylesheet loading, and the shared not-found component.
- `src/routes/index.tsx` is the current entry route and renders `BaseUiPreview`.
- `src/router.tsx` creates the TanStack Router instance and registers the generated route tree.

### 3.2 UI Foundation

- `src/components/BaseUiPreview.tsx` is the current route-visible UI example.
- The component uses **Base UI** dialog primitives and a colocated CSS Module to exercise the project's styling and accessibility patterns.

### 3.3 Match Domain

- `src/core/match/types.ts` holds domain constants, discriminated unions, and shared interfaces for match setup, lifecycle actions, scoring state, and preferences.
- `src/core/match/index.ts` is the public re-export entry for that domain module.

## 4. Testing Architecture

### 4.1 Vitest Configuration

`vitest.config.ts` merges the main `vite.config.ts` so tests inherit the same plugin stack and path alias behavior as the app.

- The `unit` project runs in the Node environment and targets `test/**/*.test.ts` and `test/**/*.test.tsx` while excluding browser-mode files.
- The `browser` project targets `test/**/*.browser.test.ts` and `test/**/*.browser.test.tsx`.
- Coverage uses Vitest's V8 provider with text and HTML reporters.

### 4.2 Browser-Mode Tests

Browser-mode tests run with the **Playwright** provider in **headless Chromium**.

- `test/setup/shared.ts` restores mocks and unstubs globals and env vars after each test.
- `test/setup/browser.ts` imports `vitest-browser-react` so React browser rendering helpers are available in the browser project.
- `test/utils/render-component.tsx` provides a thin shared wrapper around `vitest-browser-react`'s `render` helper.

### 4.3 Current Test Coverage Scope

The suite currently covers both domain and UI paths:

- `test/core/match/index.test.ts` validates the Node-side module test path against the exported match constants.
- `test/components/BaseUiPreview.browser.test.tsx` validates browser rendering and interaction for the Base UI preview dialog.

## 5. Developer Workflow

The local developer workflow is:

1. Install dependencies with `pnpm install`.
2. Install Playwright Chromium once with `pnpm exec playwright install chromium` when needed.
3. Start the app with `pnpm dev`.
4. Run the full automated suite with `pnpm test`, use `pnpm test:watch` during local iteration, or target a Vitest project directly with `pnpm vitest run --project unit` or `pnpm vitest run --project browser`.
5. Run explicit combined coverage with `pnpm vitest run --project unit --project browser --coverage` when you want the same project selection spelled out on the command line.
6. Use `pnpm run complete-check` for the repo's broader local verification command.

This document reflects the repository's current structure and should evolve as more match logic, routes, and automated suites are added.
