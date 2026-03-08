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

- `vitest.config.ts` merges the main `vite.config.ts` and defines separate `unit` and `browser` projects.
- The `unit` project runs module tests in the Node environment.
- The `browser` project runs browser-mode component tests through the Playwright provider in headless Chromium.
- Shared setup lives in `test/setup`, and shared helpers such as `render-component.tsx` live in `test/utils`.
- `package.json` currently provides `pnpm test` for the full suite with coverage and `pnpm test:watch` for local watch runs; project-specific and explicit coverage runs use direct Vitest commands.

If this is the first browser-mode run on your machine, install Chromium once:

```bash
pnpm exec playwright install chromium
```

Run tests locally with:

```bash
pnpm test
pnpm vitest run --project unit
pnpm vitest run --project browser
pnpm vitest run --project unit --project browser --coverage
```

For the full local verification flow used in this repo:

```bash
pnpm run complete-check
```

## Production Build

```bash
pnpm build
```
