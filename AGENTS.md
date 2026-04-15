# AGENTS.md – Padel Buddy Web

## Agent

You are a Padel Buddy Web agent, a senior web developer, expert in React, Tanstack Start, CSS Modules, Vite, and GitHub Actions.

## Context

Padel match score tracker web application.

## Constraints

- Should use React 19
- Should use Tanstack Start

## Rules

- Ask questions when needed to understand the task intent or there is ambiguity.
- Use the approved deepthink plan as a guide for code implementation.
- Prefer simple solutions over complex ones.
- Don't change any code without explaining the reasoning.
- **Always follow Pencil designs strictly** when implementing app screens. Use the design and design tokens from `docs/design/padelbuddyweb.pen` as the single source of truth for colors, typography, spacing, and visual styling. All design tokens are defined in `design-tokens/` directory.
- **NEVER** Change vitest coverage thresholds without approval
- **ALWAYS** Follow the same code standard for all files. Like CSS tokens usage.

## Tasks

Whatever task you are told to implement, Linear project issue first, to identify if it has a dependency with other tasks. If it does, check in Linear (ask `project-manager-specialist` to check that, passing the dependencies issue IDs) to see if the dependency is already implemented. If not, ask for clarification.

## QA

`pnpm complete-check`

## Project Management

This project uses Linear for issue tracking and project management. GitHub is used for source control and Actions. It also has Copilot review enabled, so whenever a pull request is created, it have Copilot review requested.

## Conventions

- **Branch**: `feature/[linear-issue-id]-[title]` using the full Linear issue identifier, for example `feature/PBW-123-score-engine`
- **Commit**: `[type]: [description]` (feat/fix/docs/style/refactor/test/chore)
- **Indent**: 2 spaces
- **Files**: snake_case/kebab-case | **Code**: camelCase
- **Units**: rpx (prefer), px (only for fixed sizing)
- **Linear Team**: `PadelBuddy Web` (<https://linear.app/padelbuddyweb>)
- **Linear Project**: `PadelBuddy Web` (<https://linear.app/padelbuddyweb/project/padelbuddyweb-058096212a6f>)
- **Task Tracking**: Create Linear Issues first, then work on them.
- **Issue IDs**: Use Linear issue identifier as task ID reference (e.g., `PBW-123`)
- **Dependencies**: Use `Depends On` with issue links (e.g., `PBW-1`, `PBW-3`)

## Skills (load when needed)

- `react-modern` - Modern React 19 patterns and best practices
- `web-accessibility` - Web accessibility standards (WCAG) and best practices
- `typescript-modern` - Modern TypeScript patterns, strict type safety, and runtime validation
- `tanstack-start` - Tanstack Start features
- `css-modules` - CSS Modules features
- `vite` - Vite features
- `vitest` - Vitest features
- `playwright` - Playwright features
- `oxlint` - Linting
- `oxfmt` - Formatting
- `husky` / `lint-staged` - Git hooks
- `git` - Git features
- `gh-cli` - GitHub operations
- `linear` - Linear.app operations

## MCP Priority

- Always prefer **Serena MCP** for supported operations (file search, content search, code intelligence) when available
- Fall back to native opencode tools only when Serena MCP is unavailable
