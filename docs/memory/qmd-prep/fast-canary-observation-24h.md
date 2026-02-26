# Fast Canary Observation (24h)

Date: 2026-02-26

## T+0 Snapshot (executed)

### Runtime
- Gateway runtime: `running`
- RPC probe: `ok`
- Config path: `~/.openclaw/openclaw.json`

### QMD Backend Health
- `memory.backend`: `qmd`
- Provider/model: `qmd`
- Index DB: `/root/.openclaw/agents/main/qmd/xdg-cache/qmd/index.sqlite`
- Index summary: `files=26`, `chunks=26`, `collections=1`
- Embedding probe: `ok`
- Vector availability: `available=true`

### Seed Coverage
- Seed source mode: `includeDefaultMemory=false` (seed-only)
- Seed files:
  - `rules.jsonl`: 22
  - `progress.jsonl`: 63
  - `incidents.jsonl`: 52
  - Total records: 137

### Auto-sync Mode
- Schedule: every 20 minutes (cron)
- Sync strategy: change-detection fingerprint; unchanged inputs skip regenerate/reindex

## T+1h / T+6h / T+24h

- T+1h: pending
- T+6h: pending
- T+24h: pending

## Notes
- Earlier issues were resolved:
  - wrong schema key (`memorySearch.provider=qmd`) corrected to `memory.backend=qmd`
  - missing qmd command resolved
  - qmd db open issue resolved after indexing
- One historical embed timeout occurred during migration; current probe is healthy.
