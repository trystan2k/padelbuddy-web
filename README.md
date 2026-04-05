# Padel Buddy Web

A mobile-first, client-only Padel score tracker optimized for courtside use. Supports Bluetooth remote controllers, touch scoring, match persistence, and multi-language (English, Spanish, Portuguese).

## Tech Stack

- **Framework**: TanStack Start (SSR-capable but deployed as static SPA)
- **UI**: React 19 + Base UI + CSS Modules
- **Routing**: TanStack Router (code-split, type-safe)
- **Build**: Vite 8
- **Testing**: Vitest (unit) + Playwright (E2E)
- **i18n**: react-i18next
- **Persistence**: IndexedDB
- **Deployment**: Cloudflare Pages

## Requirements

- Node `24.14.1`
- pnpm `10.33.0`

Use `mise` for automatic Node version switching — `package.json` declares the required version.

## Local Development

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000`.

## Scripts

| Command               | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| `pnpm dev`            | Start dev server with hot reload                                  |
| `pnpm build`          | Build for production (outputs to `dist/client`)                   |
| `pnpm test`           | Run unit tests with coverage                                      |
| `pnpm test:e2e`       | Run E2E tests (requires Chromium)                                 |
| `pnpm test:e2e:ui`    | Open Playwright UI for debugging                                  |
| `pnpm lint`           | Lint with Oxlint + Stylelint                                      |
| `pnpm lint:fix`       | Auto-fix lint issues                                              |
| `pnpm format`         | Format with Oxfmt                                                 |
| `pnpm typecheck`      | TypeScript type check                                             |
| `pnpm complete-check` | Full verification: typecheck → lint → format → test → e2e → build |

## App Structure

```
src/
├── components/     # React components (screens, UI primitives)
├── core/           # Match engine, scoring logic, game state
├── lib/            # Utilities (i18n, persistence, speech, input)
├── routes/         # TanStack Router route definitions
└── styles.css      # Global styles + design tokens
```

### Routes

- `/` — Home/Setup screen (new match configuration)
- `/match/:id` — Active match scoring
- `/match/finish/:id` — Match end summary and stats

### Key Features

- **Score tracking**: Real-time padel scoring with game/set/match logic
- **Side-switch prompts**: Alerts at 1-1 in deciding set
- **Bluetooth remote**: Web Bluetooth API for physical scoring buttons
- **Match persistence**: IndexedDB stores in-progress matches
- **i18n**: English, Spanish, Portuguese
- **PWA**: Installable, offline-capable
- **Share**: Export match stats as image

## Testing

Install Playwright browsers once:

```bash
pnpm exec playwright install chromium
```

Run tests:

```bash
pnpm test          # Unit tests
pnpm test:e2e     # E2E tests
pnpm test:e2e:headed  # Watch tests run in browser
```

## Production Deployment

Production deploys to Cloudflare Pages on GitHub release. The `dist/client` folder is uploaded as a static artifact.

- **Production URL**: `https://padelbuddyweb.pages.dev`
- **Preview releases**: Deployed automatically for `release-please--branches--main` branch

## CI/CD

GitHub Actions runs on every PR and push to `main`:

1. `typecheck` → `lint` → `format:check` → `test` → `build`

Release Please manages versioning and changelog. Merging a release PR triggers the production deployment workflow.

## Design

Visual design uses design tokens defined in `design-tokens/` and compiled to `src/styles.css` via Style Dictionary. See `docs/design/padelbuddyweb.pen` for the Pencil source file.
