# Suggested Commands — Padel Buddy Web

## Development
```bash
pnpm install        # Install dependencies
pnpm dev            # Start local dev server on port 4000
pnpm build          # Production build
pnpm preview        # Preview production build
```

## QA Gate
```bash
pnpm run complete-check  # Runs typecheck and production build
```

## Git
```bash
git status
git log --oneline -10
git diff HEAD
```

## GitHub
```bash
gh issue view <number>
gh pr create --title "..." --body "..."
```

## Runtime + Package Manager Setup
```bash
mise use node@24.14.0  # Node version from mise.toml
corepack enable        # pnpm version is pinned in package.json (10.30.3)
```
