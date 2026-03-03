# Implementation Priority

Tasks are grouped into waves. All tasks within the same wave can be worked on in parallel.
Each wave must be fully complete before starting the next.

---

### Wave 1 — Foundation

| github_id | title | depends on |
|---|---|---|
| #1 | Scaffold TanStack Start client-only app with pnpm and pinned Node LTS | |
| #61 | Create GitHub Project task template with full required fields | |

---

### Wave 2 — Core Setup (parallel)

| github_id | title | depends on |
|---|---|---|
| #2 | Configure strict TypeScript domain types for match state and actions | #1 |
| #3 | Integrate Base UI and CSS Modules foundation | #1 |
| #18 | Implement i18n architecture with repo JSON dictionaries en pt es | #1 |
| #36 | Configure PWA manifest icons and installability requirements | #1 |
| #53 | Configure Conventional Commits and commitlint scope optional recommended | #1 |
| #54 | Document branch naming and PR linkage policy with project item IDs | #61 |
| #62 | Configure project status flow Todo In Progress Blocked Done and blocked reason | #61 |

---

### Wave 3 — Domain Types, Styling, i18n, Storage Base (parallel)

| github_id | title | depends on |
|---|---|---|
| #9 | Implement scoring engine normal progression and Advantage Golden Point | #2 |
| #12 | Define detailed design tokens in global styles | #3 |
| #16 | Implement speech engine with locale to English to mute fallback | #18 |
| #23 | Implement browser-language detection fallback and language preference persistence | #18 |
| #37 | Build IndexedDB storage layer schema v1 current match only | #2 |
| #60 | Configure semantic versioning and automated changelog for feat fix perf refactor | #53 |

---

### Wave 4 — Scoring Rules, Setup UI, Persistence (parallel)

| github_id | title | depends on |
|---|---|---|
| #8 | Implement standard tiebreak logic 7 by 2 | #9 |
| #10 | Implement set and match resolution for Best-of-1 3 5 | #9 |
| #13 | Build setup screen with required match configuration fields | #2, #12 |
| #29 | Implement speech queue policy cancel queued and speak latest only | #16 |
| #38 | Implement incompatible schema silent reset with one-time notice | #37 |
| #42 | Implement optimistic UI with durable ordered action queue | #37, #9 |

---

### Wave 5 — Advanced Scoring, Setup Extensions, Recovery (parallel)

| github_id | title | depends on |
|---|---|---|
| #5 | Implement deciding-set super tiebreak logic 10 by 2 | #10, #8 |
| #11 | Add conditional Best-of-1 deciding-set inline question | #13 |
| #19 | Implement tiebreak-specific speech and configurable verbosity | #16, #8 |
| #21 | Enforce setup-only language switching | #18, #13 |
| #39 | Implement startup resume discard prompt with Resume emphasized | #42 |
| #41 | Implement corrupted-state hard-fail recovery screen with Reset and continue | #42 |

---

### Wave 6 — Serve Rotation, Error UX (parallel)

| github_id | title | depends on |
|---|---|---|
| #6 | Implement continuous serve rotation across games tiebreaks and sets | #8, #5 |
| #43 | Implement production error UX and errors-only console policy | #41 |

---

### Wave 7 — Match UI Core, Undo (parallel)

| github_id | title | depends on |
|---|---|---|
| #4 | Implement optional side-switch prompts odd games and every 6 tiebreak points | #6 |
| #7 | Build active match minimal scoreboard UI with Undo Mute Reset and server indicator | #12, #6 |
| #15 | Implement undo score-actions-only with full derived rollback | #9, #10, #6 |

---

### Wave 8 — Match Controls, PWA, Accessibility, Testing Base (parallel)

| github_id | title | depends on |
|---|---|---|
| #14 | Implement Reset Match confirmation and full reset to setup | #7 |
| #17 | Implement remote and keyboard alias mapping with fixed 300ms debounce | #7 |
| #20 | Implement touch scoring controls with minimum 48px targets | #7 |
| #22 | Implement match end winner screen and Continue Playing flow | #10, #5, #7 |
| #31 | Implement always-visible mute toggle behavior | #7, #16 |
| #40 | Implement service worker app-shell caching for full offline lifecycle | #36, #7, #42 |
| #44 | Implement landscape-preferred prompt while keeping portrait usable | #7 |
| #51 | Create unit test suite for scoring invariants | #9, #10, #8, #5, #6, #4, #15 |
| #64 | Implement wake lock integration with non-blocking fallback warning | #7 |
| #65 | Enforce accessibility baseline semantics focus contrast on core flows | #13, #7 |
| #66 | Respect prefers-reduced-motion in animations | #12, #7 |

---

### Wave 9 — Offline, Locale Cache, E2E, Coverage (parallel)

| github_id | title | depends on |
|---|---|---|
| #35 | Cache active locale dictionary for offline use | #18, #40 |
| #45 | Create E2E critical-path suite on mobile profiles Chromium and WebKit | #13, #7, #22, #14, #39, #40 |
| #47 | Configure global unit coverage threshold 80 lines and branches | #51 |
| #55 | Implement service worker update policy apply on next launch silently | #40 |

---

### Wave 10 — CI/CD, Local Gate, Hardware QA (parallel)

| github_id | title | depends on |
|---|---|---|
| #46 | Build CI workflows for lint unit and required E2E checks | #1, #51, #45 |
| #48 | Implement pnpm run complete-check full local gate | #51, #45 |
| #57 | Execute milestone manual hardware full regression and record by task owner | #17, #45 |
| #58 | Configure E2E single retry and 7-day artifact retention | #45 |

---

### Wave 11 — CI Quality, Deployments (parallel)

| github_id | title | depends on |
|---|---|---|
| #52 | Configure CI concurrency cancel outdated runs per PR | #46 |
| #56 | Implement docs-only CI exception via path-based detection | #46 |
| #59 | Implement production auto-deploy on main via GitHub Actions to Cloudflare Pages | #46 |
| #63 | Implement public preview deployment for every PR branch | #46 |

---

### Wave 12 — Security Headers

| github_id | title | depends on |
|---|---|---|
| #50 | Configure baseline security headers with moderate CSP | #59 |

---

### Wave 13 — Release Readiness

| github_id | title | depends on |
|---|---|---|
| #49 | Run release readiness checklist and first production dry run | #47, #58, #59, #50, #60, #57 |
