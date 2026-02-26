# Config Diff — Fast Canary (Seed-only QMD)

## Effective Configuration

- `memory.backend`: `qmd`
- `memory.qmd.includeDefaultMemory`: `false`
- `memory.qmd.paths`:
  - `path=/root/.openclaw/workspace/docs/memory/qmd-prep/seed`
  - `pattern=**/*.jsonl`
  - `name=qmd-seed`
- `memory.qmd.update.embedTimeoutMs`: `600000`
- `agents.defaults.memorySearch.provider`: `local` (unchanged, schema-compatible)
- `agents.defaults.memorySearch.fallback`: `none`

## Why this diff

- Prevents mixed-source recall (old raw memory + seed duplicates)
- Ensures migration validation targets only normalized seed artifacts
- Keeps rollback path simple and explicit

## Rollback (one-step)

1. Edit `~/.openclaw/openclaw.json`:
   - set `memory.backend` to `builtin`
2. Restart gateway:
   - `openclaw gateway restart`
3. Verify:
   - `openclaw gateway status`
   - `openclaw memory status --agent main --deep --json`

## Backup files created during change

- `~/.openclaw/openclaw.json.bak.qmd-fast-canary-20260226`
- `~/.openclaw/openclaw.json.bak.before-qmd-backend-20260226`
- `~/.openclaw/openclaw.json.bak.seed-only-20260226`
