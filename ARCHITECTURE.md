# ARCHITECTURE.md

## 1. High-Level Architecture

Padel Buddy Web is currently a client-only **TanStack Start** application built on **Vite** and **React 19**. The app uses TanStack Start file-based routes for the shell, **Base UI** for accessible primitives, and TypeScript domain modules under `src/core` for shared match-related types and constants.

Automated testing is centered on **Vitest** with two explicit projects:

- `unit` for the current Node-based smoke-test baseline.
- `browser` as a disabled scaffold for future real-browser component tests backed by Playwright.

## 2. Directory Structure

### 2.1 File Naming Conventions

- React component files use `PascalCase` (for example, `AppShell.tsx`).
- Component test files mirror the component name in `PascalCase` and keep the test suffix (for example, `AppShell.test.tsx`).
- General TypeScript modules that are not React components use `kebab-case` (for example, `render-component.tsx`, `match-state.ts`).
- Component-scoped CSS Modules use the same `PascalCase` basename as the component they style (for example, `AppShell.module.css`).
- Global or shared stylesheet files use `kebab-case` unless they intentionally match a colocated component.

```text
├── .github/
│   └── workflows/                 # CI workflow definitions
├── .husky/                        # Git hooks
├── docs/                          # Planning and project documentation
├── src/
│   ├── components/
│   │   ├── AppShell.tsx           # Foundation shell shown on the home route
│   │   └── AppShell.module.css    # Scoped styles for the foundation shell
│   ├── core/
│   │   └── match/
│   │       ├── index.ts           # Match domain re-export surface
│   │       └── types.ts           # Match constants and TypeScript interfaces
│   ├── routes/
│   │   ├── __root.tsx             # Document shell and global stylesheet link
│   │   └── index.tsx              # Home route using the foundation shell
│   ├── routeTree.gen.ts           # Generated TanStack route tree
│   ├── router.tsx                 # Router factory and registration
│   └── styles.css                 # Global app styles
├── test/
│   ├── components/
│   │   └── AppShell.test.tsx      # Foundation smoke test
│   ├── core/
│   │   └── match/                 # Reserved for future domain tests
│   ├── setup/
│   │   ├── browser.ts             # Future browser-mode setup entrypoint
│   │   └── shared.ts              # Shared Vitest cleanup/reset hooks
│   └── utils/                     # Reserved for future shared test helpers
├── biome.json                     # Linting and formatting
├── package.json                   # Scripts and dependencies
├── vite.config.ts                 # App build/runtime config
└── vitest.config.ts               # Vitest projects and coverage config
```

## 3. Application Structure

### 3.1 App Shell and Routing

- `src/routes/__root.tsx` defines the HTML document shell, metadata, and global stylesheet loading.
- `src/routes/index.tsx` is the current entry route and renders `AppShell`.
- `src/router.tsx` creates the TanStack Router instance and registers the generated route tree.

### 3.2 UI Foundation

- `src/components/AppShell.tsx` is the current route-visible UI example.
- The component uses **Base UI** dialog primitives and a colocated CSS Module to exercise the project's styling and accessibility patterns.

### 3.3 Match Domain

- `src/core/match/types.ts` holds domain constants, discriminated unions, and shared interfaces for match setup, lifecycle actions, scoring state, and preferences.
- `src/core/match/index.ts` is the public re-export entry for that domain module.

## 4. Testing Architecture

### 4.1 Vitest Configuration

`vitest.config.ts` merges the main `vite.config.ts` so tests inherit the same plugin stack and path alias behavior as the app.

- The `unit` project runs in the Node environment and targets `test/**/*.test.ts` and `test/**/*.test.tsx` while excluding browser-mode files.
- The `browser` project targets `test/**/*.browser.test.ts` and `test/**/*.browser.test.tsx`, but stays disabled until the browser provider dependencies are intentionally added.
- Coverage uses Vitest's V8 provider with text and HTML reporters.

### 4.2 Browser-Mode Tests

- `test/setup/shared.ts` restores mocks and unstubs globals and env vars after each test.
- `test/setup/browser.ts` currently extends the shared setup and serves as the reserved entrypoint for future browser-mode configuration.
- Browser-mode tests are intentionally not active in the bootstrap baseline yet, which keeps `pnpm test` reliable without requiring Playwright provider setup during this sub-issue.

### 4.3 Current Test Coverage Scope

The suite currently covers the UI bootstrap path with a single smoke test:

- `test/components/AppShell.test.tsx` renders the foundation shell to static markup and verifies the core bootstrap content is present.

## 5. Developer Workflow

The local developer workflow is:

1. Install dependencies with `pnpm install`.
2. Start the app with `pnpm dev`.
3. Run the automated smoke-test baseline with `pnpm test`, use `pnpm test:watch` during local iteration, or target the unit project directly with `pnpm vitest run --project unit`.
4. Run explicit coverage with `pnpm vitest run --project unit --coverage` when needed.
5. Use `pnpm run complete-check` for the repo's broader local verification command.
6. Enable browser-mode tests later, after adding the required provider dependencies, before running the `browser` project.

This document reflects the repository's current structure and should evolve as more match logic, routes, and automated suites are added.
