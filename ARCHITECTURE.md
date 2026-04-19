# ARCHITECTURE.md

## 1. High-Level Architecture

Padel Buddy Web is currently a client-only **TanStack Start** application built on **Vite** and **React 19**. The app uses TanStack Start file-based routes for the shell, **Base UI** for accessible primitives, and TypeScript domain modules under `src/core` for shared match-related types and constants.

The web build is also embedded inside **Capacitor** native wrappers for **iOS** and **Android**. Capacitor loads the production web bundle from `dist/client` into native shells located under `ios/` and `android/`. Native branding assets are committed in the platform projects, and Android uses a dedicated native launch activity to render the branded `icon + text` launch screen before opening the Capacitor `MainActivity`.

Delivery automation is handled by **GitHub Actions**, **Release Please**, and **Cloudflare Pages**. Pull requests and `main` pushes flow through explicit CI checks, the Release Please release PR is the only branch that receives a preview deployment, and production deploys are gated by published GitHub releases.

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
│   └── workflows/
│       ├── ci.yml                 # PR/main verification with docs-only routing
│       ├── release.yml            # Release Please automation
│       ├── preview-release-pr.yml # Release PR-only Cloudflare Pages preview deploy
│       └── deploy-production.yml  # Release-gated production deploy
├── .husky/                        # Git hooks
│   └── pre-commit                 # Runs staged-file quality checks through lint-staged
├── docs/                          # Planning and project documentation
├── android/                       # Capacitor Android wrapper project
│   └── app/
│       └── src/main/
│           ├── java/com/padelbuddy/web/
│           │   ├── LaunchActivity.java # Native Android launch screen handoff activity
│           │   └── MainActivity.java   # Capacitor WebView host activity
│           └── res/
│               ├── layout/activity_launch.xml # Native Android branded launch layout
│               ├── mipmap-*/             # Android launcher icon assets
│               ├── drawable*/            # Android splash assets
│               └── values*/              # Android theme, color, and splash configuration
├── ios/                           # Capacitor iOS wrapper project
│   └── App/App/
│       ├── Assets.xcassets/       # iOS app icon and splash assets
│       └── Base.lproj/LaunchScreen.storyboard # iOS native launch screen
├── scripts/
│   └── generate_capacitor_brand_assets.swift # Regenerates native splash/icon assets from web brand assets
├── src/
│   ├── components/
│   │   ├── AppShell.tsx           # Foundation shell shown on the home route
│   │   └── AppShell.module.css    # Scoped styles for the foundation shell
│   ├── core/
│   │   └── match/
│   │       ├── derived-state.ts    # Derived match metadata selectors
│   │       ├── engine.ts           # Pure scoring reducer and state transitions
│   │       ├── helpers.ts          # Shared match-domain score helpers
│   │       ├── index.ts            # Match domain re-export surface
│   │       ├── replay.ts           # Replay projection, undo, and continue helpers
│   │       ├── types.ts            # Match constants and TypeScript interfaces
│   │       └── validation.ts       # Match setup validation and normalization
│   ├── routes/
│   │   ├── __root.tsx             # Document shell and global stylesheet link
│   │   ├── index.tsx              # Home route using the foundation shell
│   │   ├── history.tsx           # Match history route
│   │   ├── help.tsx              # Help and about route
│   │   ├── match.$id.tsx        # Active match scoring route
│   │   └── match.finish.$id.tsx   # Match finish route
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
│   │       ├── match.test.ts              # Match-domain public export smoke coverage
│   │       ├── replay-determinism.test.ts # Replay, undo, and deterministic projection tests
│   │       ├── scoring-core.test.ts       # Normal scoring, set rollover, and completion rules
│   │       ├── serve-derived-state.test.ts # Serve rotation and derived-state coverage
│   │       ├── setup-validation.test.ts   # Match setup validation coverage
│   │       ├── test-helpers.ts            # Shared unit-test helpers for match suites
│   │       └── tiebreak-rules.test.ts     # Standard and super-tiebreak scenarios
│   ├── setup/
│   │   ├── browser.ts             # Browser-mode setup entrypoint
│   │   └── shared.ts              # Shared Vitest cleanup/reset hooks
│   ├── routes/                    # Route-level smoke tests for the bootstrap shell
│   └── router.test.tsx            # Router factory smoke test
├── .lintstagedrc.json            # Staged-file local quality tasks
├── .oxlintrc.json                 # Linting
├── .oxfmtrc.json                  # Formatting
├── .stylelintrc.json              # CSS Module linting rules
├── CHANGELOG.md                   # Release Please-managed changelog
├── capacitor.config.ts            # Capacitor app id/name and embedded web build directory
├── package.json                   # Scripts, dependencies, and Capacitor sync/open helpers
├── release-please-config.json     # Release Please package/release settings
├── release-please-manifest.json   # Release Please version state
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

- `src/core/match/validation.ts` normalizes and validates setup input into the canonical match configuration used by the domain; score actions remain typed domain inputs rather than a separate runtime-validation layer.
- `src/core/match/engine.ts` applies pure scoring actions to canonical match state, including normal games, tiebreaks, super tiebreaks, set rollover, and match boundaries.
- `src/core/match/derived-state.ts` derives serving, winner, side-switch, and score-display metadata strictly from setup plus canonical state.
- `src/core/match/replay.ts` projects full state from ordered score actions and exposes undo and continue-playing helpers.
- `src/core/match/index.ts` is the public re-export entry for that domain module.

### 3.4 Native Shells

- `capacitor.config.ts` points Capacitor at `dist/client`, so native projects always embed the production web bundle rather than a separate mobile-only build.
- `android/` contains the Capacitor Android project. `MainActivity` remains the Capacitor host activity, while `LaunchActivity` is the Android launcher entry point used to show a fully native branded launch screen before handing off into the WebView.
- `ios/` contains the Capacitor iOS project. iOS branding is handled through `Assets.xcassets` plus `LaunchScreen.storyboard`.
- `scripts/generate_capacitor_brand_assets.swift` regenerates the committed native splash and icon PNGs from `public/icon-512x512.png`.

### 3.5 Native Launch Behavior

- **iOS** uses the standard launch storyboard and splash asset catalog, so a composed branded splash image can be shown directly.
- **Android pre-12** can use a full splash drawable background through the launch theme.
- **Android 12+** system splash behavior is more constrained, so the project uses a dedicated native `LaunchActivity` with `activity_launch.xml` to render the exact branded `icon + text` composition consistently before opening `MainActivity`.

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

The suite currently covers the bootstrap shell plus scenario-driven match-domain coverage for setup validation, scoring transitions, tiebreak rules, serve rotation, replay determinism, undo, and continue-playing behavior.

## 5. Automation Architecture

- `.github/workflows/ci.yml` is the authoritative verification workflow. It classifies changes first, runs the reduced docs-only path only for `docs/**`, root markdown, and `.github/**/*.md`, and otherwise runs `pnpm typecheck` -> `pnpm lint` -> `pnpm format:check` -> `pnpm test` -> `pnpm build` in order.
- `.github/workflows/release.yml` runs Release Please on `main` so semantic versioning, changelog generation, and the release PR stay aligned with Conventional Commits.
- `.github/workflows/preview-release-pr.yml` rebuilds and deploys only the Release Please PR to a stable preview alias on Cloudflare Pages using `dist/client`.
- `.github/workflows/deploy-production.yml` rebuilds the published release tag and deploys the `dist/client` artifact to the production Pages branch.

## 6. Developer Workflow

The local developer workflow is:

1. Install dependencies with `pnpm install`.
2. Start the app with `pnpm dev`.
3. Run `pnpm test` for the combined Vitest unit + browser suite, or `pnpm test:watch` for local iteration.
4. Run `pnpm lint` for `oxlint --deny-warnings` plus CSS Module Stylelint checks, or `pnpm lint:fix` to apply the Oxlint and CSS Module Stylelint fixes.
5. Use `pnpm format` to apply Oxfmt or `pnpm format:check` for a non-mutating formatting check.
6. Use `pnpm run complete-check` for the repo's local verification flow; note that this command may modify files (it runs `lint:fix` and `format`) and is not used by CI.
7. If the browser suite reports missing Playwright binaries, run `pnpm exec playwright install chromium` once and retry.
8. Use `pnpm cap:sync`, `pnpm cap:sync:android`, or `pnpm cap:sync:ios` after rebuilding the web app when native wrappers need the latest `dist/client` bundle.
9. Use `pnpm cap:open:android` or `pnpm cap:open:ios` to open the native projects in Android Studio or Xcode.

Pre-commit hooks are installed through Husky, and `lint-staged` reads `.lintstagedrc.json` to keep staged-file checks limited to Oxlint, CSS Module Stylelint, and a final Oxfmt pass.

## 6. Design System

All app screens MUST be developed following the Pencil design file strictly. The design tokens and visual specifications are defined in the Pencil design file at `docs/design/padelbuddyweb.pen`.

### 6.1 Design Tokens

The project uses the design tokens defined in the design-tokens/ directory.

### 6.2 Design Implementation

When implementing UI screens:

1. Open the Pencil design file to reference the exact layout, spacing, and visual specifications
2. Use design tokens from the table above instead of hardcoded values
3. Match colors, typography, spacing, and component styling exactly as shown in the design
4. Verify implementation matches the design visually before considering the task complete

### 6.3 Accessing Design Variables in Code

Design tokens can be accessed via the `get_variables()` MCP tool or by referencing the design file directly. Always prioritize the Pencil design as the single source of truth for visual implementation.
