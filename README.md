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
- The `unit` project runs the current smoke-test baseline in the Node environment.
- The `browser` project is scaffolded for future Playwright-backed component tests but remains disabled until browser-mode provider dependencies are added intentionally.
- Shared setup lives in `test/setup`.
- `package.json` provides `pnpm test` for the current suite and `pnpm test:watch` for local watch runs; project-specific and explicit coverage runs use direct Vitest commands.

Run tests locally with:

```bash
pnpm test
pnpm vitest run --project unit
pnpm vitest run --project unit --coverage
```

Enable browser-mode tests later, once the provider dependencies are in place, before using `pnpm vitest run --project browser`.

For the full local verification flow used in this repo:

```bash
pnpm run complete-check
```

## Production Build

```bash
pnpm build
```
