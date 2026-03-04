# Baseline Inventory (QMD Migration Prep)

## 1) Source Inventory

### A. Long-term memory
- Path: `MEMORY.md`
- Type: Curated long-term rules / conventions / operating agreements
- Priority: **P0 (highest)** for policy and behavioral recall
- Retention class: **Long-term / evergreen**

### B. Daily memory logs
- Path: `memory/YYYY-MM-DD.md`
- Type: Daily events, checkpoints, progress traces
- Priority: **P1** for recent operational context
- Retention class: **Short-to-mid term**, with periodic compaction/summarization

### C. Topic memory notes
- Path: `memory/topics/*.md`
- Type: Topic-focused summaries or durable notes
- Priority: **P1/P2** (depends on topic freshness and relevance)
- Retention class: **Mid-to-long term**, topic lifecycle managed

## 2) Estimated Current Volume (initial)

> Preparation-phase estimate; exact counts should be refreshed by periodic inventory job.

- `MEMORY.md`: 1 file, moderate length, high-value density
- `memory/YYYY-MM-DD.md`: variable (grows daily), medium-value density
- `memory/topics/*.md`: currently sparse/optional, potentially high-value by topic

## 3) Source Priority Rules (retrieval-time)

1. **Policy/rule queries** → prioritize `MEMORY.md`
2. **Recent status/progress queries** → prioritize latest `memory/YYYY-MM-DD.md` windows
3. **Topic deep-dive queries** → prioritize `memory/topics/*.md`
4. Tie-breakers: recency > semantic score gap threshold > source priority

## 4) Target QMD Mapping

| Source | QMD Collection | Required Metadata |
|---|---|---|
| `MEMORY.md` | `memory_rules` | `source_file`, `tier=long_term`, `language`, `tags`, `sensitivity` |
| `memory/YYYY-MM-DD.md` | `memory_daily` | `source_file`, `date`, `tier=daily`, `language`, `tags`, `sensitivity` |
| `memory/topics/*.md` | `memory_topics` | `source_file`, `topic`, `tier=topic`, `language`, `tags`, `sensitivity` |

## 5) Initial Metadata Contract

- `source_file` (string, absolute or workspace-relative canonical path)
- `date` (YYYY-MM-DD, nullable)
- `topic` (string, nullable)
- `tier` (`long_term|daily|topic`)
- `sensitivity` (`public|internal|restricted`)
- `language` (BCP-47-like tag, e.g., `zh-CN`, `en`)
- `tags` (string array)
- `chunk_id` (stable chunk id)
- `dedupe_key` (hash)

## 6) Scope Guardrails (must hold)

- Keep production retrieval provider as local.
- No rewrite/delete of existing memory files.
- QMD remains shadow-index/shadow-retrieval only in this phase.

## 7) Done Evidence

- Source list documented
- Priority/retention class documented
- Source→target mapping documented
- Initial volume estimate documented
