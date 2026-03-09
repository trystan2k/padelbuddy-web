# Directory Structure

## Current (Bootstrap Stage)
```
├── .github/workflows/     # CI workflow definitions (planned)
├── .husky/                # Git hooks (planned)
├── .opencode/             # OpenCode skills and config
├── .serena/               # Serena MCP data
├── docs/
│   ├── plan/              # Planning documents
│   ├── development-logs/  # Development logs
│   ├── prd/               # Product requirements
│   │   ├── prd-v2.md      # Master PRD
│   │   ├── scoring-spec.md
│   │   ├── ux-spec.md
│   │   ├── qa-spec.md
│   │   ├── devops-spec.md
│   │   ├── project-ops-spec.md
│   │   └── release-incident-runbook.md
│   └── PRD-Initial.md
├── src/                   # Source code (to be created)
│   ├── components/        # React components
│   ├── core/              # Domain modules (match, etc.)
│   ├── routes/            # TanStack Start routes
│   └── styles.css         # Global styles
├── test/                  # Test files (to be created)
│   ├── components/        # Component tests
│   ├── core/              # Domain tests
│   ├── setup/             # Test setup
│   └── utils/             # Test utilities
├── AGENTS.md              # Agent instructions
├── ARCHITECTURE.md        # Architecture documentation
├── mise.toml              # Tool version management
└── README.md              # Project README
```

## Key Directories
- `src/core/match/` - Match domain types and constants
- `src/routes/` - File-based TanStack Start routes
- `src/components/` - React components with CSS Modules
- `test/` - Vitest tests (unit + browser projects)
- `docs/prd/` - Product requirements and specifications
