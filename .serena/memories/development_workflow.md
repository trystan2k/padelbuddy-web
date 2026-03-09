# Development Workflow

## 1. Task Intake
1. Check Linear for task dependencies
2. If dependencies exist, verify they're implemented
3. Create feature branch: `feature/[linear-issue-id]-[title]`

## 2. Implementation
1. Follow code conventions (see `code_style_conventions.md`)
2. Use approved deepthink plan as guide
3. Prefer simple solutions over complex ones
4. Don't change code without explaining reasoning

## 3. Testing
1. Write tests for new functionality
2. Run `pnpm test` to verify all tests pass
3. Ensure coverage meets >=80% threshold

## 4. Quality Check
```bash
pnpm run complete-check
```

## 5. Commit & PR
1. Commit with format: `[type]: [description]`
2. Push and create PR
3. Copilot review is auto-requested
4. Link PR to Linear issue

## 6. Merge
1. Wait for CI + Copilot review
2. Address any feedback
3. Squash merge to main
4. Update Linear issue status

## Skills Available
Load these skills when needed:
- `react-modern` - React 19 patterns
- `typescript-modern` - TypeScript patterns
- `tanstack-start` - TanStack Start features
- `css-modules` - CSS Modules
- `vite` - Vite features
- `vitest` - Vitest testing
- `playwright` - E2E testing
- `biome` - Linting/formatting
- `husky` / `lint-staged` - Git hooks
- `git` - Git operations
- `gh-cli` - GitHub CLI
- `linear` - Linear.app operations
