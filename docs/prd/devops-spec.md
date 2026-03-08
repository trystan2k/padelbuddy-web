# DevOps and CI/CD Specification

Version: 2.0
Status: Normative

## 1) Toolchain

- Package manager: `pnpm`
- Node policy: single pinned LTS version
- Lockfile MUST be committed in PRs when dependency graph changes

## 2) Branching and PR Model

- Development model: feature branches + pull requests
- Branch naming: `feature/PBW-[id]-[title]` where `id` is the GitHub issue number
- PR MUST link one or more relevant project task issues
- Project workflow MUST create issues first and then add them to the project board

Main branch policy:
- Owner direct push is allowed
- Standard path remains PR flow with checks

## 3) Commit and Release Conventions

- Conventional Commits required
- Scope is optional, but recommended
- Release-trigger commit types: `feat`, `fix`, `perf`, `refactor`
- Semantic versioning required
- Automated changelog generation required

## 4) Required CI Policy

Code PR required checks:
- Lint
- Unit tests (coverage gate)
- E2E critical suite (mobile profiles, Chromium + WebKit)

CI behavior:
- Cancel outdated in-progress runs for same PR on new commits

Docs-only exception:
- Path-based detection for `docs/**` + markdown meta files
- Run docs/lint checks only

## 5) Deployment Model

- Environments: preview + production
- Preview deployments: public, one per PR branch
- Production deploy: automatic on merge to `main`
- Deployment mechanism: GitHub Actions deploy to Cloudflare Pages
- Build model: static Pages output (client-only runtime)

## 6) PWA and Update Policy

- Installability is release-blocking
- Offline strategy: app-shell caching
- Locale caching offline: active locale only
- Service worker update UX: apply silently on next launch

## 7) Security and Secrets

- Baseline security headers are required for static hosting
- CSP posture: moderate baseline
- Minimal secrets policy for v1 (deploy/runtime essentials only)

## 8) Observability and Logging

- No external analytics in v1
- No external error monitoring in v1
- Production console logging policy: errors only
