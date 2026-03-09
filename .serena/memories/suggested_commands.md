# Suggested Commands

## Bootstrap (First Time)
```bash
# Install dependencies
pnpm install

# Install Playwright Chromium (once)
pnpm exec playwright install chromium
```

## Development
```bash
# Start dev server
pnpm dev
```

## Testing
```bash
# Run full test suite with coverage
pnpm test

# Watch mode
pnpm test:watch

# Unit tests only
pnpm vitest run --project unit

# Browser tests only
pnpm vitest run --project browser

# Explicit coverage run
pnpm vitest run --project unit --project browser --coverage
```

## Quality Checks
```bash
# Full local verification (lint, typecheck, test)
pnpm run complete-check
```

## Build
```bash
# Production build
pnpm build
```

## System Utilities (Darwin/macOS)
```bash
# File operations
ls -la                    # List files with details
find . -name "*.ts"       # Find TypeScript files
grep -r "pattern" .       # Search content

# Git operations
git status
git diff
git log --oneline -10
```

## Notes
- This repo is still bootstrapping; some commands may not exist yet
- Node version is managed via `mise` (see `mise.toml`)
- Required Node version: 24.14.0
