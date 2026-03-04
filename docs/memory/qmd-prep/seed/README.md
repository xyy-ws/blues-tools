# QMD Seed (Normalized)

This folder now contains FULL seed generated from current memory sources.

## Inputs
- MEMORY.md
- memory/**/*.md
- task-progress/**/*.md

## Outputs
- rules.jsonl
- progress.jsonl
- incidents.jsonl
- full-seed-report.json

## Notes
- Source files are not modified (extract-only).
- Basic redaction applied for obvious secret patterns.
- Deduplication via SHA256(normalized_text + source_file).
