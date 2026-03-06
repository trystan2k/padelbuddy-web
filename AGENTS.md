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

## Tasks

Whatever task you are told to implement, check the @priority.md file first, to identify if it has a dependency with other tasks. If it does, do not continue and ask for clarification.

## QA

`npm run complete-check`

## Github

This project uses GitHub tools, like GitHub Issues, GitHub Projects, and GitHub Actions. It is also has Copilot review enabled, so whenever a pull request is created, it have Copilot review requested.s

## Conventions

- **Branch**: `feature/PBW-[id]-[title]`
- **Commit**: `[type]: [description]` (feat/fix/docs/style/refactor/test/chore)
- **Indent**: 2 spaces
- **Files**: snake_case/kebab-case | **Code**: camelCase
- **Units**: rpx (prefer), px (only for fixed sizing)
- **Github Project**: `PadelBuddy Web` (https://github.com/users/trystan2k/projects/5)
- **Task Tracking**: Create GitHub Issues first, then add issues to project (no draft project items)
- **Issue IDs**: Use GitHub issue number as task ID reference (e.g., `#12`)
- **Dependencies**: Use `Depends On` with issue links (e.g., `#1`, `#3`)

## Skills (load when needed)

- `react-modern` - Modern React 19 patterns and best practices
- `typescript-modern` - Modern TypeScript patterns, strict type safety, and runtime validation
- `tanstack-start` - Tanstack Start features
- `css-modules` - CSS Modules features
- `vite` - Vite features
- `vitest` - Vitest features
- `playwright` - Playwright features
- `biome` - Linting/formatting
- `husky` / `lint-staged` - Git hooks
- `git` - Git features
- `gh-cli` - GitHub operations
- `gh-project` - GitHub Projects operations

## MCP Priority

- Always prefer **Serena MCP** for supported operations (file search, content search, code intelligence) when available
- Fall back to native opencode tools only when Serena MCP is unavailable

## Project
