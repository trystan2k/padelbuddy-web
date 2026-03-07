# Backlog

| github_id | pbw_id | title | dependencies |
|---|---|---|---|
| 1 | PBW-001 | Scaffold TanStack Start client-only app with pnpm and pinned Node LTS | |
| 2 | PBW-002 | Configure strict TypeScript domain types for match state and actions | PBW-001 |
| 3 | PBW-003 | Integrate Base UI and CSS Modules foundation | PBW-001 |
| 12 | PBW-004 | Define detailed design tokens in global styles | PBW-003 |
| 13 | PBW-005 | Build setup screen with required match configuration fields | PBW-002\|PBW-004 |
| 11 | PBW-006 | Add conditional Best-of-1 deciding-set inline question | PBW-005 |
| 9 | PBW-007 | Implement scoring engine normal progression and Advantage Golden Point | PBW-002 |
| 10 | PBW-008 | Implement set and match resolution for Best-of-1 3 5 | PBW-007 |
| 8 | PBW-009 | Implement standard tiebreak logic 7 by 2 | PBW-007 |
| 5 | PBW-010 | Implement deciding-set super tiebreak logic 10 by 2 | PBW-008\|PBW-009 |
| 6 | PBW-011 | Implement continuous serve rotation across games tiebreaks and sets | PBW-009\|PBW-010 |
| 4 | PBW-012 | Implement optional side-switch prompts odd games and every 6 tiebreak points | PBW-011 |
| 7 | PBW-013 | Build active match minimal scoreboard UI with Undo Mute Reset and server indicator | PBW-004\|PBW-011 |
| 20 | PBW-014 | Implement touch scoring controls with minimum 48px targets | PBW-013 |
| 17 | PBW-015 | Implement remote and keyboard alias mapping with fixed 300ms debounce | PBW-013 |
| 15 | PBW-016 | Implement undo score-actions-only with full derived rollback | PBW-007\|PBW-008\|PBW-011 |
| 22 | PBW-017 | Implement match end winner screen and Continue Playing flow | PBW-008\|PBW-010\|PBW-013 |
| 14 | PBW-018 | Implement Reset Match confirmation and full reset to setup | PBW-013 |
| 18 | PBW-019 | Implement i18n architecture with repo JSON dictionaries en pt es | PBW-001 |
| 23 | PBW-020 | Implement browser-language detection fallback and language preference persistence | PBW-019 |
| 21 | PBW-021 | Enforce setup-only language switching | PBW-019\|PBW-005 |
| 16 | PBW-022 | Implement speech engine with locale to English to mute fallback | PBW-019 |
| 19 | PBW-023 | Implement tiebreak-specific speech and configurable verbosity | PBW-022\|PBW-009 |
| 29 | PBW-024 | Implement speech queue policy cancel queued and speak latest only | PBW-022 |
| 31 | PBW-025 | Implement always-visible mute toggle behavior | PBW-013\|PBW-022 |
| 37 | PBW-026 | Build IndexedDB storage layer schema v1 current match only | PBW-002 |
| 42 | PBW-027 | Implement optimistic UI with durable ordered action queue | PBW-026\|PBW-007 |
| 39 | PBW-028 | Implement startup resume discard prompt with Resume emphasized | PBW-027 |
| 41 | PBW-029 | Implement corrupted-state hard-fail recovery screen with Reset and continue | PBW-027 |
| 38 | PBW-030 | Implement incompatible schema silent reset with one-time notice | PBW-026 |
| 36 | PBW-031 | Configure PWA manifest icons and installability requirements | PBW-001 |
| 40 | PBW-032 | Implement service worker app-shell caching for full offline lifecycle | PBW-031\|PBW-013\|PBW-027 |
| 35 | PBW-033 | Cache active locale dictionary for offline use | PBW-019\|PBW-032 |
| 55 | PBW-034 | Implement service worker update policy apply on next launch silently | PBW-032 |
| 64 | PBW-035 | Implement wake lock integration with non-blocking fallback warning | PBW-013 |
| 65 | PBW-036 | Enforce accessibility baseline semantics focus contrast on core flows | PBW-005\|PBW-013 |
| 66 | PBW-037 | Respect prefers-reduced-motion in animations | PBW-004\|PBW-013 |
| 44 | PBW-038 | Implement landscape-preferred prompt while keeping portrait usable | PBW-013 |
| 43 | PBW-039 | Implement production error UX and errors-only console policy | PBW-029 |
| 51 | PBW-040 | Create unit test suite for scoring invariants | PBW-007\|PBW-008\|PBW-009\|PBW-010\|PBW-011\|PBW-012\|PBW-016 |
| 47 | PBW-041 | Configure global unit coverage threshold 80 lines and branches | PBW-040 |
| 45 | PBW-042 | Create E2E critical-path suite on mobile profiles Chromium and WebKit | PBW-005\|PBW-013\|PBW-017\|PBW-018\|PBW-028\|PBW-032 |
| 58 | PBW-043 | Configure E2E single retry and 7-day artifact retention | PBW-042 |
| 56 | PBW-044 | Implement docs-only CI exception via path-based detection | PBW-046 |
| 48 | PBW-045 | Implement pnpm run complete-check full local gate | PBW-040\|PBW-042 |
| 46 | PBW-046 | Build CI workflows for lint unit and required E2E checks | PBW-001\|PBW-040\|PBW-042 |
| 52 | PBW-047 | Configure CI concurrency cancel outdated runs per PR | PBW-046 |
| 63 | PBW-048 | Implement public preview deployment for every PR branch | PBW-046 |
| 59 | PBW-049 | Implement production auto-deploy on main via GitHub Actions to Cloudflare Pages | PBW-046 |
| 50 | PBW-050 | Configure baseline security headers with moderate CSP | PBW-049 |
| 53 | PBW-051 | Configure Conventional Commits and commitlint scope optional recommended | PBW-001 |
| 60 | PBW-052 | Configure semantic versioning and automated changelog for feat fix perf refactor | PBW-051 |
| 61 | PBW-053 | Create GitHub Project task template with full required fields | PBW-052 |
| 62 | PBW-054 | Configure project status flow Todo In Progress Review Blocked Done and blocked reason | PBW-053 |
| 54 | PBW-055 | Document branch naming and PR linkage policy with project item IDs | PBW-053 |
| 57 | PBW-056 | Execute milestone manual hardware full regression and record by task owner | PBW-015\|PBW-042 |
| 49 | PBW-057 | Run release readiness checklist and first production dry run | PBW-041\|PBW-043\|PBW-049\|PBW-050\|PBW-052\|PBW-056 |
