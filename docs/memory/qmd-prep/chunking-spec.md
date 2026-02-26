# Chunking & Metadata Specification (QMD Prep)

## 1) Chunk Size Policy

Use deterministic hierarchical chunking with soft/hard limits:

- **Small chunk**: 300–600 chars (policy bullets, dense rules)
- **Medium chunk**: 600–1200 chars (default for logs/notes)
- **Large chunk**: 1200–2200 chars (only when section integrity matters)
- Hard max: 2500 chars (force split)

### Split boundaries (priority order)
1. Heading boundaries (`#`, `##`, `###`)
2. List block boundaries
3. Paragraph boundaries
4. Sentence boundaries (fallback)

### Overlap policy
- Default overlap: 10% (min 80 chars, max 220 chars)
- No overlap for very short policy bullets (<300 chars)

## 2) Metadata Keys (required)

- `source_file`: canonical path
- `date`: YYYY-MM-DD (nullable)
- `topic`: topic id/name (nullable)
- `tier`: `long_term|daily|topic`
- `sensitivity`: `public|internal|restricted`
- `language`: e.g. `zh-CN`, `en`
- `tags`: string[]

## 3) Additional Operational Metadata (recommended)

- `chunk_id`: deterministic id (`<source>:<offset>:<len>`)
- `chunk_index`: numeric order in source
- `ingested_at`: UTC timestamp
- `source_mtime`: source file modification timestamp
- `dedupe_key`: see section 4
- `redaction_applied`: boolean

## 4) Dedupe Strategy

`dedupe_key = SHA256(normalize(text) + "|" + canonical_source_path)`

Normalization function:
1. Trim leading/trailing whitespace
2. Collapse repeated internal whitespace
3. Normalize markdown bullets (`-`, `*`) to canonical form
4. Remove non-semantic zero-width chars
5. Preserve language content and punctuation semantics

## 5) Redaction Rules

Before ingestion, apply deterministic redaction for sensitive tokens:

- API keys / secrets / tokens → `[REDACTED_SECRET]`
- Password-like patterns → `[REDACTED_PASSWORD]`
- Private IDs when not needed for retrieval → `[REDACTED_ID]`

Rules:
- Redaction must preserve context shape (sentence still understandable)
- Mark `redaction_applied=true` when any replacement occurs
- Keep original source untouched (no in-place edits)

## 6) Edge Cases

1. **Very short lines (single bullet rules)**
   - Merge adjacent bullets by heading context until small chunk lower-bound is reached.
2. **Mixed language paragraphs**
   - Keep as one chunk if semantically linked; set dominant language + tag `mixed-lang`.
3. **Huge daily logs**
   - Split by time blocks/sections first, then apply default medium chunking.
4. **Repeated boilerplate**
   - Keep first instance per source section; later duplicates rely on dedupe_key.

## 7) Determinism Requirement

Given same source + same version of rules, chunk boundaries and dedupe_key outputs must be stable.
