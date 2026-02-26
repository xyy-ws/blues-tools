# Shadow Retrieval Evaluation Plan (QMD vs Local)

## 1) Purpose

Evaluate QMD as a **shadow** retrieval backend against current local retrieval without changing production answer routing.

## 2) Dataset Design (20–30 queries)

Target: 24 representative prompts (can expand to 30).

### Query classes
1. **Task progress recall** (8)
2. **Policy/rule recall** (8)
3. **Incident/history recall** (8)

### Dataset template

| query_id | class | query_text | expected_evidence_refs | relevance_labels(top-k) | notes |
|---|---|---|---|---|---|
| Q001 | policy | … | file/section anchors | 0/1/2 | … |

- Relevance label: `2=highly relevant`, `1=partially relevant`, `0=irrelevant`

## 3) Execution Protocol

For each query:
1. Run Local retrieval with fixed K (default K=5)
2. Run QMD shadow retrieval with same K and equivalent time window
3. Store results in comparison sheet:
   - retrieved chunks
   - source paths
   - scores
   - latency
   - error state

## 4) Metrics

### Recall@K
`Recall@K = (# queries where at least one expected relevant chunk appears in top-K) / (total queries)`

### Precision@K (manual labeled)
`Precision@K = (sum relevant items in top-K across queries) / (total retrieved items across queries)`

### Latency
- p50 latency (ms)
- p95 latency (ms)

### Failure rate
`FailureRate = (# retrieval failures) / (total retrieval attempts)`

## 5) Pass Thresholds (draft)

- Recall@5 (policy/progress classes): **QMD >= Local**
- p95 latency: **QMD <= 1.5x Local baseline**
- Failure rate: **< 1%**
- Security dry-run findings: **0 high severity**

## 6) Weekly Report Format

## Week N Summary
- Coverage: X queries
- Recall@5: Local A / QMD B
- Precision@5: Local A / QMD B
- p50/p95 latency: Local A/B, QMD C/D
- Failure rate: Local A%, QMD B%
- Security notes: …
- Recommendation: Continue shadow / Tune chunking / Block cutover

## 7) Tooling Output Artifacts

- `docs/memory/qmd-prep/eval-dataset.csv`
- `docs/memory/qmd-prep/eval-runs/YYYY-WW.jsonl`
- `docs/memory/qmd-prep/eval-weekly-report-YYYY-WW.md`

## 8) Non-goals

- No user-facing answer routing to QMD in this phase
- No destructive edits to existing memory sources
