# Padel Buddy Web

TanStack Start client-only scaffold for a mobile-first padel score tracker.

## Requirements

- Node `24.14.0`
- pnpm `10.32.0`

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
- Coverage enforces the PBW-9 quality gate with per-file `80%` minimums (via `thresholds.perFile: true`).

Run tests locally with:

```bash
pnpm test
```

If Playwright browser binaries are missing, install Chromium once with:

```bash
pnpm exec playwright install chromium
```

`pnpm test` runs the combined local suite, while `pnpm test:watch` stays focused on day-to-day iteration.

## Local Quality Checks

- `pnpm lint` runs `oxlint --deny-warnings` plus Stylelint for `src/**/*.css`, and `pnpm lint:fix` applies Oxlint fixes plus Stylelint fixes for CSS Modules.
- `pnpm format` applies Oxfmt, and `pnpm format:check` verifies formatting without changing files.
- Husky installs a `pre-commit`, `pre-push` and `commit-msg` hooks through `pnpm install`, and `lint-staged` reads `.lintstagedrc.json` to run staged JS/TS lint fixes, staged CSS Module Stylelint fixes, then a final Oxfmt pass in sequence.

For the full local verification flow used in this repo:

```bash
pnpm run complete-check
```

`pnpm run complete-check` runs the repo's full verification flow, including linting, formatting, tests, and build; it may rewrite files when applying fixes before the test and build steps.

`pnpm run complete-check` is intentionally local-only. GitHub Actions uses non-mutating checks in this order: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, and `pnpm build`.

## CI/CD and Releases

- `CI` runs on pull requests and `main` pushes, cancels superseded runs, and keeps the full verification order as `typecheck` -> `lint` -> `format:check` -> `test` -> `build`.
- Docs-only changes are limited to `docs/**`, root `*.md`, and markdown files under `.github/`; they take the reduced path and run `pnpm format:check` instead of the full verification sequence.
- `Release Please` opens and updates the release PR, bumps `package.json`, maintains `CHANGELOG.md`, and publishes the GitHub release after the release PR is merged.
- Release Please uses the dedicated `RELEASE_PLEASE_TOKEN` secret so the release PR and published release can trigger downstream GitHub workflows.
- Releasable non-breaking commit types follow Release Please's Node strategy: `feat`, `fix`, and `chore(deps)`; breaking changes such as `refactor!` still trigger a major release.
- `Preview Release PR` deploys only the Release Please branch (`release-please--branches--main`) to a stable Cloudflare Pages preview alias.
- `Deploy Production` runs only when a GitHub release is published and deploys the static `dist/client` Pages artifact, never the SSR bundle.
- CI and deploy workflows upload or deploy `dist/client` directly as the Cloudflare Pages payload.

## GitHub Actions Secrets

- `RELEASE_PLEASE_TOKEN` - personal access token used by Release Please so release PR and release events can trigger downstream workflows

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT_NAME`

## Production Build

```bash
pnpm build
```

Cloudflare Pages workflows use `dist/client` directly as the deployable static artifact produced by `pnpm build`.
