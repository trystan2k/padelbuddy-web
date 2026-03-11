# Padel Buddy Web

TanStack Start client-only scaffold for a mobile-first padel score tracker.

## Requirements

- Node `24.14.0`
- pnpm

Node version source of truth is `package.json` `engines.node` and is compatible with `mise`.

## Local Development

```bash
pnpm install
pnpm dev
```

## Testing

Automated tests use Vitest and stay aligned with the app's Vite and TanStack Start configuration through `vitest.config.ts`.

- `vitest.config.ts` merges the main `vite.config.ts` and keeps separate `unit` and `browser` projects.
- Browser component smoke tests render with `vitest-browser-react` inside the browser project instead of a shared browser mounting helper.
- Shared setup still lives in `test/setup`, while unit/server-side markup assertions stay lightweight and non-browser-only.
- Coverage keeps the PBW-9 quality gate at global `80%` minimums.

Run tests locally with:

```bash
pnpm test:unit
pnpm test:browser
pnpm test:coverage
```

If Playwright browser binaries are missing, install Chromium once with:

```bash
pnpm exec playwright install chromium
```

`pnpm test` runs the combined local suite, while `pnpm test:watch` stays focused on day-to-day iteration.

## Local Quality Checks

- `pnpm lint` runs `oxlint --deny-warnings` plus Stylelint for `src/**/*.module.css`, and `pnpm lint:fix` applies Oxlint fixes plus Stylelint fixes for CSS Modules.
- `pnpm format` applies Oxfmt, and `pnpm format:check` verifies formatting without changing files.
- Husky installs a `pre-commit` hook through `pnpm install`, and `lint-staged` reads `.lintstagedrc.mjs` to run staged JS/TS lint fixes, staged CSS Module Stylelint fixes, then a final Oxfmt pass in sequence.

For the full local verification flow used in this repo:

```bash
pnpm run complete-check
```

`pnpm run complete-check` is the repo's non-mutating verification flow, so it validates the project without rewriting files before the test and build steps.

## Production Build

```bash
pnpm build
```
