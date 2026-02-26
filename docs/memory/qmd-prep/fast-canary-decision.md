# Fast Canary Decision

Date: 2026-02-26

## Current Decision

**Status: CONDITIONAL PASS (operational) / FORMAL HOLD (until 24h checkpoints complete)**

Reasoning:
- Operationally pass:
  - QMD backend active and healthy
  - seed-only mode active
  - index + embedding probe healthy
  - auto-sync with change-detection enabled
- Formal hold:
  - 24h checkpoints (T+1h/T+6h/T+24h) not yet fully recorded

## Acceptance Evidence (available now)
- `docs/memory/qmd-prep/config-diff-fast-canary.md`
- `docs/memory/qmd-prep/smoke-test-fast-canary.md`
- `docs/memory/qmd-prep/fast-canary-observation-24h.md`

## Rollback Command (one-step)
1. set `memory.backend` to `builtin` in `~/.openclaw/openclaw.json`
2. run `openclaw gateway restart`
3. verify with `openclaw memory status --agent main --deep --json`

## Next Closure Action
- Append T+1h/T+6h/T+24h observations and then flip status from FORMAL HOLD -> PASS.
