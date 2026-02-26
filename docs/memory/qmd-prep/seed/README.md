# QMD Seed (Normalized)

本目录是 QMD 的标准化输入层（只增不改），不替代原始记忆源。

## Files
- `rules.jsonl`：长期规则/约定
- `progress.jsonl`：任务进度快照
- `incidents.jsonl`：历史事件/决策/风险

## JSONL Common Schema
- `id` string
- `text` string
- `source_file` string
- `date` string|null
- `topic` string|null
- `tier` one of `long_term|daily|topic`
- `sensitivity` one of `public|internal|restricted`
- `language` string
- `tags` string[]
