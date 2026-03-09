# Project Overview

## Purpose
Padel Buddy Web is a mobile-first, client-only web app for live padel score tracking. It supports:
- Bluetooth HID presenter remote input
- Touch/click controls
- Voice announcements
- Full match scoring with FIP-aligned rules
- Post-match endless play mode

## Target Users
- Recreational and semi-competitive padel players
- Coaches, referees, and spectators tracking scores
- Primary usage: mobile phones/tablets courtside (mobile-first, desktop supported)

## Tech Stack (Planned/Current)
- **Runtime**: Node.js 24.14.0 (mise managed)
- **Package Manager**: pnpm
- **Framework**: TanStack Start (file-based routing)
- **UI**: React 19 + Base UI (accessible primitives)
- **Styling**: CSS Modules
- **Build**: Vite
- **Testing**: Vitest (unit + browser projects via Playwright)
- **Linting/Formatting**: Biome
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions
- **Deployment**: Cloudflare Pages (static output)
- **Storage**: IndexedDB (client-only persistence)
- **i18n**: English, Portuguese, Spanish

## Key Constraints
- Client-only architecture (no backend in v1)
- No user accounts/authentication
- No multi-device sync
- No external analytics/telemetry

## Documentation
- Master PRD: `docs/prd/prd-v2.md`
- Scoring spec: `docs/prd/scoring-spec.md`
- UX spec: `docs/prd/ux-spec.md`
- QA spec: `docs/prd/qa-spec.md`
- DevOps spec: `docs/prd/devops-spec.md`
- Project ops spec: `docs/prd/project-ops-spec.md`
- Release runbook: `docs/prd/release-incident-runbook.md`
