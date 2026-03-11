# ARCHITECTURE.md

## 1. High-Level Architecture

Padel Buddy Web is currently a client-only **TanStack Start** application built on **Vite** and **React 19**. The app uses TanStack Start file-based routes for the shell, **Base UI** for accessible primitives, and TypeScript domain modules under `src/core` for shared match-related types and constants.

Automated testing is centered on **Vitest** with two explicit projects:

- `unit` for the current Node-based smoke-test baseline.
- `browser` for real-browser component smoke tests backed by Playwright.

## 2. Directory Structure

### 2.1 File Naming Conventions

- React component files use `PascalCase` (for example, `AppShell.tsx`).
- Component test files mirror the component name in `PascalCase` and keep the test suffix (for example, `AppShell.browser.test.tsx`).
- General TypeScript modules that are not React components use `kebab-case` (for example, `render-component.tsx`, `match-state.ts`).
- Component-scoped CSS Modules use the same `PascalCase` basename as the component they style (for example, `AppShell.module.css`).
- Global or shared stylesheet files use `kebab-case` unless they intentionally match a colocated component.

```text
├── .github/
│   └── workflows/                 # CI workflow definitions
├── .husky/                        # Git hooks
│   └── pre-commit                 # Runs staged-file quality checks through lint-staged
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
│   │   ├── AppShell/
│   │   │   └── AppShell.browser.test.tsx     # Browser smoke test for the foundation shell
│   │   └── NotFoundPage/
│   │       └── NotFoundPage.browser.test.tsx # Browser smoke test for the not-found screen
│   ├── core/
│   │   └── match/
│   │       └── match.test.ts      # Match-domain smoke coverage
│   ├── setup/
│   │   ├── browser.ts             # Browser-mode setup entrypoint
│   │   └── shared.ts              # Shared Vitest cleanup/reset hooks
│   ├── routes/                    # Route-level smoke tests for the bootstrap shell
│   └── router.test.tsx            # Router factory smoke test
├── .lintstagedrc.json            # Staged-file local quality tasks
├── .oxlintrc.json                 # Linting
├── .oxfmtrc.json                  # Formatting
├── .stylelintrc.json              # CSS Module linting rules
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
- The `browser` project targets `test/**/*.browser.test.ts` and `test/**/*.browser.test.tsx` and runs in headless Chromium through Playwright.
- Coverage uses Vitest's V8 provider with text and HTML reporters.
- Coverage keeps the PBW-9 `80%` quality gate in place across maintained `src/**/*.ts` and `src/**/*.tsx` files.

### 4.2 Browser-Mode Tests

- `test/setup/shared.ts` restores mocks, unstubs globals and env vars, and clears the document body between tests.
- `test/setup/browser.ts` extends the shared setup for browser-mode suites.
- Browser component smoke tests render directly with `vitest-browser-react`, so the old shared browser mounting helper is no longer part of the test utilities.
- Unit/server-side markup assertions stay lightweight and non-browser-only.

### 4.3 Current Test Coverage Scope

The suite currently covers the bootstrap shell with lightweight smoke coverage across the app shell, not-found route, router setup, and match-domain exports.

## 5. Developer Workflow

The local developer workflow is:

1. Install dependencies with `pnpm install`.
2. Start the app with `pnpm dev`.
3. Run the explicit `unit`, `browser`, and `coverage` Vitest scripts as needed; `pnpm test` runs the combined suite and `pnpm test:watch` stays focused on local iteration.
4. Run `pnpm lint` for `oxlint --deny-warnings` plus CSS Module Stylelint checks, or `pnpm lint:fix` to apply the Oxlint and CSS Module Stylelint fixes.
5. Use `pnpm format` to apply Oxfmt or `pnpm format:check` for a non-mutating formatting check.
6. Use `pnpm run complete-check` for the repo's non-mutating local verification flow.
7. If the browser suite reports missing Playwright binaries, run `pnpm exec playwright install chromium` once and retry.

Pre-commit hooks are installed through Husky, and `lint-staged` reads `.lintstagedrc.json` to keep staged-file checks limited to Oxlint, CSS Module Stylelint, and a final Oxfmt pass.

This document reflects the repository's current structure and should evolve as more match logic, routes, and automated suites are added.
