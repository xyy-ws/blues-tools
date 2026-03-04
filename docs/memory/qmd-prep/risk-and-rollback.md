# Risk Register & Rollback Runbook (QMD Prep)

## 1) Risk Register

| Risk | Symptom | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Low-quality recall | Key facts missing in top-K | Wrong/weak memory grounding | Tune chunking/metadata, expand eval set, block cutover | Memory maintainer |
| Index drift | Same source yields inconsistent retrieval over time | Non-deterministic behavior | Deterministic ingest, periodic re-index checksums, drift alerts | Infra |
| Service unavailability | QMD timeout/5xx | Shadow evaluation gaps / future prod risk | Retry + circuit-breaker + fallback local | Infra |
| Sensitive chunk leakage | Secrets/IDs appear in retrieved chunks | Security/privacy incident | Redaction pipeline + audit + denylist patterns | Security |

## 2) Trigger Matrix

| Trigger | Severity | Action |
|---|---|---|
| Recall regression > 5% on key query classes | High | Freeze tuning window, block promotion |
| p95 latency > 1.5x baseline for 2 consecutive runs | Medium | Performance tuning, no phase advance |
| Failure rate >= 1% weekly | High | Investigate reliability, block promotion |
| Any high-severity security finding | Critical | Immediate rollback to local-only shadow disable |

## 3) Rollback Conditions

Initiate rollback when any condition holds:
1. High-severity security issue confirmed
2. Sustained high failure rate (>=1%) with unresolved root cause
3. Severe recall degradation on policy/progress recall
4. QMD service instability causing repeated timeouts/errors

## 4) Rollback Actions (single-step preference)

1. Set retrieval path to local-only (production unchanged by design)
2. Disable QMD shadow retrieval job
3. Keep logs/artifacts for postmortem
4. Open incident note with:
   - timestamp
   - trigger evidence
   - impacted scope
   - next remediation checkpoint

## 5) Operational Runbook (dry-run now)

- [ ] Verify local retrieval healthy
- [ ] Toggle shadow retrieval OFF
- [ ] Confirm no QMD calls in evaluation scheduler
- [ ] Capture final status snapshot
- [ ] Notify stakeholders with evidence + next step

## 6) Post-rollback Recovery Criteria

Resume shadow only if:
- Root cause identified and fixed
- Re-test passes thresholds on representative query set
- Security re-audit passes (0 high severity)
