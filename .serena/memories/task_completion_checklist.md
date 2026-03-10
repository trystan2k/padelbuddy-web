# Task Completion Checklist

When a task is marked complete, run the following verification:

## 1. Quality Gates
```bash
pnpm run complete-check
```

This should include:
- Linting (Oxlint)
- Formatting (Oxfmt)
- Type checking (TypeScript)
- All tests passing (Vitest unit + browser)

## 2. Coverage Requirements
- Unit coverage must be >=80% for lines and branches
- E2E critical-path tests must pass on Chromium + WebKit

## 3. Pre-Commit
- Husky hooks run lint-staged automatically
- Only staged files are linted

## 4. Before Merge
- All CI checks pass
- PR has Copilot review requested (automatic)

## 5. Linear Issue
- Update issue status when task is complete
- Link PR to issue

## Acceptance Gates (Release)
- AG-01: All required CI checks pass
- AG-02: Unit coverage >=80% (lines and branches)
- AG-03: E2E critical-path suite passes on mobile profiles
- AG-04: PWA installability validated
- AG-05: Hardware validation complete
