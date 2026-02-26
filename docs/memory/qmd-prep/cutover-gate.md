# Cutover Gate Checklist (No Cutover Yet)

## Current Phase

**P0 Preparation / Shadow only** — production retrieval remains local.

## Fast Canary Exception (approved by user)

- Mode: **24h fast canary** (QMD primary + local fallback)
- Requirement: one-step rollback to local-only must be verified before switch
- Decision points: T+1h / T+6h / T+24h
- Any critical trigger hit => immediate rollback

## 1) Hard Gates for Cutover Consideration

All must pass:

1. **Quality gate**
   - Recall@5 on key policy/progress queries is non-inferior to Local
   - Manual relevance checks show no critical regression

2. **Performance gate**
   - p95 latency <= 1.5x local baseline
   - No sustained tail-latency spikes in weekly runs

3. **Reliability gate**
   - Failure rate < 1%
   - No unresolved high-priority incidents

4. **Security gate**
   - Redaction checks passed
   - Dry-run audit: 0 high-severity findings

## 2) Approval Checklist

- [ ] Technical sign-off
- [ ] Security sign-off
- [ ] User sign-off

No phase promotion without all three.

## 3) Phased Rollout Options

### Stage A — 10% advisory mode
- QMD used only as advisory comparison
- User-facing answer path unchanged
- Collect additional evidence

### Stage B — 50% advisory mode
- Wider coverage for shadow confidence
- Continue strict monitoring and rollback readiness

### Stage C — Full switch candidate
- Enable full QMD retrieval path only after all gates pass
- Immediate fallback toggle to local-only required

## 4) Fallback Requirement

A documented, tested one-step fallback to local-only must exist before any cutover.

## 5) Evidence Package Required for Decision

- Latest weekly report (metrics + trend)
- Failure analysis summary
- Security audit summary
- Signed gate checklist

## 6) Decision Outcomes

- **APPROVE**: proceed to next rollout stage
- **HOLD**: continue shadow and tuning
- **REJECT**: rollback/keep local-only and remediate
