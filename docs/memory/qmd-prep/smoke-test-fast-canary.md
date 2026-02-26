# Smoke Test — Fast Canary (QMD Seed-only)

Date: 2026-02-26

## Environment checks

- Gateway: running (`RPC probe: ok`)
- Memory backend: `qmd`
- Data source mode: `seed-only` (`includeDefaultMemory=false`)
- QMD CLI: available (`qmd --help` works)

## Index/embedding health

- `openclaw memory status --agent main --deep --json`
  - `backend=qmd`
  - `files=26`
  - `chunks=26`
  - `custom.qmd.collections=1`
  - `vector.available=true`
  - `embeddingProbe.ok=true`
- QMD index path:
  - `/root/.openclaw/agents/main/qmd/xdg-cache/qmd/index.sqlite`

## Commands executed

- `qmd --help`
- `openclaw memory index --agent main --verbose`
- `openclaw memory status --agent main --deep --json`
- `openclaw gateway status`

## Observations

- Initial earlier issue (`unrecognized qmd`) resolved by switching to `memory.backend=qmd` (correct schema path).
- Initial earlier issue (`qmd command not found`) resolved by installing qmd CLI.
- Initial earlier issue (`unable to open database file`) resolved after index initialization.
- During one run, `qmd embed` timeout was observed; current status probe shows embedding available and probe OK.

## Current verdict (smoke scope)

- **PASS (smoke-level)**: service healthy, index readable, seed-only source active, vector probe OK.
- **Pending for full canary closure**: 24h observation checkpoints (T+1h/T+6h/T+24h) and minimal query-set metric table.
