# GitHub Project Operations Specification

Version: 2.0
Status: Normative

## 1) Tracking Model

- Task-only board model on GitHub Project
- Work is tracked as GitHub Issues linked to the project board
- Draft project items are not allowed

## 2) Required Task Template

Every task item MUST include:
- Problem/context
- Scope and boundaries
- Acceptance criteria
- Test plan
- Depends On (GitHub issue references like `#1`, `#3`)
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

- PRs SHOULD reference one or more project task issues
- Issues are created first, then added to the project board
- Issue titles MUST NOT include custom task IDs (no `PBW-001` title prefix)
- Branch naming MUST be `feature/PBW-[id]-[title]` where `[id]` is the GitHub issue number

## 5) Review Policy

- Normal review policy applies to all PRs, including docs-only PRs
- Owner override is case-by-case manual

## 6) Team/Ownership

- No strict code ownership model for v1
- Typical parallelism assumption: 1-2 developers
