# PRD: Padel Buddy Web App (Refined)

Version: 2.0
Date: 2026-03-03
Status: Draft for implementation planning

## 1) Product Summary

Padel Buddy Web is a mobile-first, client-only web app for live padel score tracking with dual input methods:
- Bluetooth HID presenter remote
- Touch/click controls

The product is optimized for courtside use, supports voice announcements, full match scoring, and post-match endless play.

## 2) Release Scope (v1)

v1 includes the full product scope in this PRD (not phased MVP), including:
- Setup, live scoring, undo, persistence, winner flow, endless mode
- PWA installability and app-shell offline operation
- i18n UI (English, Portuguese, Spanish)
- Speech announcements with locale-aware fallback
- CI/CD, code quality gates, and project operations policy

## 3) Users and Context

- Recreational and semi-competitive padel players
- Coaches, refs, and spectators tracking score
- Primary usage: mobile phones/tablets courtside
- Desktop remains supported but mobile-first is the product focus

## 4) Goals

- G-01: Fast, low-friction point tracking with remote or touch
- G-02: Accurate FIP-aligned scoring with configurable match variants
- G-03: Near-zero-loss recovery of active match state
- G-04: Clear visuals, clear controls, and clear spoken feedback
- G-05: Reliable delivery pipeline with enforceable quality gates

## 5) Out of Scope

- User accounts/authentication
- Multi-device sync
- Match history backend
- External analytics/telemetry services
- Parallel support for v1 once v2 begins

## 6) Functional Requirements

- FR-01 Match Setup MUST support:
  - Team names
  - Best of 1/3/5
  - Initial server team
  - Advantage vs Golden Point
  - Deciding-set super tiebreak option
  - Best-of-1 conditional deciding-set question (inline)
- FR-02 Live scoring MUST support identical behavior for remote, keyboard aliases, and touch controls.
- FR-03 Undo MUST apply to score actions only, while rolling back all derived state changes caused by undone actions.
- FR-04 Match end MUST show winner and offer Continue Playing (endless mode) only after official match completion.
- FR-05 Reset Match MUST require confirmation and return to setup.
- FR-06 Localization MUST include full UI i18n for `en`, `pt`, `es` with setup-time switching.
- FR-07 Speech MUST support on/off and configurable verbosity, with tiebreak-specific phrasing.
- FR-08 Resume flow MUST prompt on startup when recoverable active state exists (Resume emphasized).

Detailed functional contracts are defined in:
- `docs/prd/scoring-spec.md`
- `docs/prd/ux-spec.md`

## 7) Non-Functional Requirements

- NFR-01 Runtime model MUST be client-only (no backend runtime in v1).
- NFR-02 Data persistence MUST use IndexedDB only, optimistic UI with durable ordered action queue.
- NFR-03 Offline MUST support full match lifecycle after app shell is cached.
- NFR-04 Installability MUST be release-blocking.
- NFR-05 Accessibility baseline MUST include semantics, focus visibility, and contrast on core flows.
- NFR-06 Touch targets MUST be at least 48px minimum.
- NFR-07 Motion MUST respect `prefers-reduced-motion`.
- NFR-08 Security headers MUST be configured with moderate CSP baseline.
- NFR-09 Logging in production MUST be errors-only.

Detailed NFR/testability contracts are defined in:
- `docs/prd/qa-spec.md`
- `docs/prd/devops-spec.md`

## 8) Browser and Device Policy

- Mobile-first support target
- Compatibility policy: latest-2 major versions for target mobile browsers
- CI browser engines: Chromium + WebKit

## 9) Acceptance Gates

v1 is release-ready only when all are true:
- AG-01 All required CI checks pass
- AG-02 Unit coverage is >=80% for both lines and branches
- AG-03 Required E2E critical-path suite passes on mobile profiles in Chromium + WebKit
- AG-04 PWA installability validated (automated + manual milestone checks)
- AG-05 Milestone hardware validation complete (full manual remote regression on at least one known-good presenter)

## 10) Delivery and Operations

- Environments: public preview per PR + production
- Production deploy: automatic on `main` via GitHub Actions to Cloudflare Pages static output
- Branch model: feature branches + PRs
- Branch naming: `feature/PBW-[id]-[title]` where `[id]` is the GitHub issue number
- Versioning: Semantic Versioning
- Changelog: automated from commit history

Authoritative process specs:
- `docs/prd/devops-spec.md`
- `docs/prd/project-ops-spec.md`
- `docs/prd/release-incident-runbook.md`
