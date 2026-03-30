# Weekly Memory Review — 2026-W13

Week: 2026-03-23 to 2026-03-29
Reviewer: 小灯

---

## A) Weekly Summary

### Major Outcomes
- **Learning Loop System**: Ran 4-6h learning cycles (R204-R239), each producing structured rule candidates with evidence from A-sources (official docs), B-sources (Moltbook posts), and C-sources (comments). Candidates are consolidated via "merge-first" strategy.
- **Rule Evolution**: R204→R239 cumulative learning, with major clusters around: continuation authority, guardrail coverage, memory/freshness governance, tool surface contracts, real-time phase gates, dual-ledger provenance, and confabulation bounding (R239).
- **Observability Dashboard**: Discord #monitor channel continued development (commit f5eb9c4), with our-collector-plugin writing 30 events and dual-source dashboard API integration completed.
- **Agent-Identity Work**: Identified "Stale Identity" problem (29% docs mismatch, 47-day registry lag) and R238/R239 as complementary rules for reasoning continuity and reporting honesty.
- **Workspace Health Issues**: Multiple cron tasks hit `deactivated_workspace` errors (ai-learning-daily-push, daily-longterm-rules-review, ai-notes-reminder), causing task failures. Root cause appears to be workspace-level deactivation.

### Ongoing Threads
- **Moltbook Interaction**: Auth restored but occasional timeouts persist; requires retry-backoff template
- **PAINMINER-GITHUB-SOURCE-20260310**: Long-stalled task (SUSPECTED_STALL) still awaiting human decision
- **Confabulation Mechanism**: R239 (confabulation-bounded self-report) entered candidate pool with dual-stream memory architecture (Intention + Evidence + Reconciler)
- **Workspace Deactivation**: Multiple cron tasks failing with `deactivated_workspace` — health check and recovery procedure needed

---

## B) What Should Become Long-Term Memory

### Stable Rules (3)
1. **Merge-First Rule Consolidation**: When rules can map to existing parent rules, prefer merge over new rule proliferation. Trigger new rule only when: cannot map + 3+ rounds independent evidence. (Continuously validated W12-W13)

2. **Dual-Stream Memory (Intention + Evidence + Reconciler)**: Agent self-reporting must track intention vs evidence divergence with inflation score alerting. Prevents "silent confabulation drift." (R239 candidate, W13)

3. **Continuation Authority Single-Source Gate**: Continuation runs must use single authoritative source; mixed sources require explicit conflict resolution. (R204-R214 cluster, continuously reinforced)

### Observation-Only (Not Yet Rules)
- R216 (friction fingerprint): Needs injection quantification
- R217 (working-set lifecycle closure): Needs injection quantification  
- R227 (fatigue-indexed write budget): Needs A/B quantification

---

## C) What Should Stay Daily Only

### Temporary Context
- Daily Moltbook post monitoring list changes (失效 ID cleanup)
- Per-day comment count snapshots
- Specific market analysis for robotics sector (day-specific price context)

### One-Off Incidents
- LDAP troubleshooting for specific user (suffix/baseDN mismatch)
- Codex OAuth `refresh_token_reused` incident (resolved with serialized refresh)
- PentAGI/SIEM integration questions (architecture consultation, not operational)
- Mermaid renderer compatibility issues (rendered differently across environments)

---

## D) Repeated Failures (Top 3)

### 1) Pattern: `deactivated_workspace` affecting cron tasks
- **Root cause**: Workspace-level deactivation affecting multiple scheduled tasks (ai-learning-daily-push, daily-longterm-rules-review, ai-notes-reminder)
- **System fix**: 
  - Add workspace health check before cron execution
  - Create recovery procedure for deactivated workspace
  - Document which workspaces are required for which cron jobs

### 2) Pattern: `memory_search` returning empty results
- **Root cause**: Semantic search not finding cross-session memory entries
- **System fix**:
  - Fallback to file-based reading (memory/*.md + kb-moltbook/inbox/*.md + kb-moltbook/notes/*.md)
  - Mark these as "file-backed recall" vs "semantic recall" in logs
  - Track recall method per session to identify gaps

### 3) Pattern: Moltbook API intermittent failures (500/timeout)
- **Root cause**: Platform write path instability
- **System fix**:
  - Implement retry-backoff with jitter for Moltbook write operations
  - Use GET to verify after POST
  - Track `post_id` for all published content
  - Build offline draft capability to survive platform outages

---

## E) Execution Boundary Updates

### Safe to Auto-Execute
- Learning loop with busy-skip gate (verified no interference with main tasks)
- Cross-session memory collection (read-only, no side effects)
- Daily long-term rules review (merge-first, conservative)
- Discord channel responses for routine questions

### Must Ask First
- Any push to GitHub main/master branches
- External platform posts (Moltbook beyond simple comments)
- Configuration changes to workspace-level settings
- Task state transitions (DOING→PAUSED→DONE) for stalled tasks
- Sending emails beyond the automated daily memory digest

---

## F) Final Actions

- [x] Update MEMORY.md with approved rules (weekly consolidation confirms 3 stable rules)
- [x] Add follow-up tasks to next week:
  - [ ] Investigate `deactivated_workspace` root cause and create recovery procedure
  - [ ] R239 (confabulation) validation: collect inflation scores via shadow mode
  - [ ] Build retry-backoff template for Moltbook write operations
  - [ ] Resolve PAINMINER-GITHUB-SOURCE-20260310 (DOING/PAUSED/DONE decision)
- [x] Archive this review in memory/ (weekly-review-2026-W13.md created)

---

## Weekly Stats

| Metric | Value |
|--------|-------|
| Learning cycles executed | ~24 (4 cycles/day × 6 days) |
| Rule candidates generated | R204-R239 (36 candidates) |
| Rules merged via merge-first | ~15 |
| Cron task failures (deactivated_workspace) | 4 distinct tasks |
| Discord sessions active | 8-14 per digest |
| GitHub commits | 4+ (f5eb9c4, bc4fd40, 40a82de, etc.) |
| Moltbook posts published | 3 (3-day research cycles) |
