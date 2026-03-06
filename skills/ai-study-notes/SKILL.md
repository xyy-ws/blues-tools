---
name: ai-study-notes
description: Record and summarize AI learning progress into Obsidian/Markdown notes with a flexible workflow (flash, standard, deep-research). Use when the user asks to log study sessions, capture Q&A, create concept cards, or generate daily/weekly learning summaries without rigid templates.
---

# AI Study Notes

Capture AI learning progress in a low-friction way and keep notes useful for review.

## Workflow

1. Identify target note location.
   - Prefer user-provided Obsidian vault path.
   - If missing, write to workspace fallback: `notes/ai-learning/`.
2. Select note depth mode.
   - **Flash**: 3 lines (learned / unclear / next step).
   - **Standard**: topic, key points, misconceptions, actionable step.
   - **Deep**: standard + method analysis + pros/cons + transfer-to-use-case.
3. Update files incrementally.
   - Daily log: `Daily/YYYY-MM-DD.md`
   - Concept cards: `Concepts/<concept>.md`
   - Q&A cards: `FAQ/<topic>.md`
   - Weekly review: `Weekly/YYYY-Www.md`
4. Preserve user language and add minimal normalization.
   - Keep original phrasing for user questions.
   - Add concise clarified answer below.
5. End each update with a `Next Review` line.

## Output Rules

- Keep notes concise and practical; avoid over-formatting.
- Prefer Markdown bullets over large prose blocks.
- Use Obsidian-friendly links like `[[Concepts/Attention]]`.
- Add tags sparingly, e.g. `#ai-learning #agent #transformer`.
- If uncertain information appears, mark as `Needs verification`.

## Templates

Read and apply templates from `references/templates.md`.
Choose the lightest template that still preserves learning value.
