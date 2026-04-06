# DevOps and CI/CD Specification

Version: 2.1
Status: Normative

## 1) Toolchain

- Package manager: `pnpm`
- Node policy: single pinned LTS version
- Lockfile MUST be committed in PRs when dependency graph changes

## 2) Branching and PR Model

- Development model: feature branches + pull requests
- Branch naming: `feature/[linear-issue-id]-[title]` using the full Linear issue identifier, for example `feature/PBW-123-score-engine`
- PR MUST link one or more relevant Linear task issues
- Project workflow MUST create Linear issues first and then add them to the project board

Main branch policy:

- Owner direct push is allowed
- Standard path remains PR flow with checks

## 3) Commit and Release Conventions

- Conventional Commits required
- Scope is optional, but recommended
- Release-trigger commit types: `feat`, `fix`, `chore(deps)`, and breaking changes such as `refactor!`
- Semantic versioning required
- Automated changelog generation required

## 4) Required CI Policy

Code PR required checks:

- Typecheck
- Lint
- Format check
- Tests (Vitest unit + browser + coverage gate)
- Build

CI behavior:

- Cancel outdated in-progress runs for same PR on new commits
- Full verification order: `pnpm typecheck` -> `pnpm lint` -> `pnpm format:check` -> `pnpm test` -> `pnpm build`

Docs-only exception:

- Path-based detection for `docs/**` + markdown meta files
- Workflow or config changes under `.github/**` force the full verification path
- Run reduced docs checks only when every changed file stays inside the docs-only path set

## 5) Deployment Model

- Environments: preview + production
- Preview deployments: public, only for the Release Please release PR, refreshed on release PR updates
- Production deploy: automatic only when a GitHub release is published from the merged Release Please PR
- Deployment mechanism: GitHub Actions on GitHub-hosted runners deploy to Cloudflare Pages
- Build model: static Pages output prepared from `dist/`; `dist/server` is never deployed
- Capacitor note: native Android/iOS wrappers embed `dist/client` locally, but native app packaging/distribution is outside the Cloudflare Pages deployment flow and must be synced separately

## 6) PWA and Update Policy

- Installability is release-blocking
- Offline strategy: app-shell caching
- Locale caching offline: active locale only
- Service worker update UX: apply silently on next launch

## 7) Security and Secrets

- Baseline security headers are required for static hosting
- CSP posture: moderate baseline
- Minimal secrets policy for v1 (deploy/runtime essentials only)
- Required GitHub Actions secrets: `RELEASE_PLEASE_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PAGES_PROJECT_NAME`

## 8) Observability and Logging

- No external analytics in v1
- No external error monitoring in v1
- Production console logging policy: errors only
