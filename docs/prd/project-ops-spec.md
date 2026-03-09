# Linear Project Operations Specification

Version: 2.0
Status: Normative

## 1) Tracking Model

- Task-only board model on Linear Project
- Work is tracked as Linear issues linked to the project board
- Draft project items are not allowed

## 2) Required Task Template

Every task item MUST include:
- Problem/context
- Scope and boundaries
- Acceptance criteria
- Test plan
- Depends On (Linear issue references like `PBW-1`, `PBW-3`)
- Rollout notes
- Rollback notes
- T-shirt estimate
- Risk notes

## 3) Status Flow

Required statuses:

- Ready
- In Progress
- Review
- Blocked
- Done
- Canceled

Rules:
- Status updates are manual
- Blocked status MUST include blocker reason
- Review status means the PR is ready for review
- Done means merged to `main`

## 4) PR and Task Linkage

- PRs SHOULD reference one or more Linear task issues
- Issues are created first, then added to the Linear project board
- Issue titles SHOULD use normal task titles; the Linear identifier already provides the task ID
- Branch naming MUST be `feature/[linear-issue-id]-[title]` using the full Linear issue identifier, for example `feature/PBW-123-score-engine`

## 5) Review Policy

- Normal review policy applies to all PRs, including docs-only PRs
- Owner override is case-by-case manual

## 6) Team/Ownership

- No strict code ownership model for v1
- Typical parallelism assumption: 1-2 developers
