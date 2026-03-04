# HEARTBEAT.md

# Conservative mode (safe rollout): check + alert only, no auto-restart.
# Scope: OpenClaw updates & optimization tasks.

- Read long-term task list / active task context.
- For each non-DONE task, verify progress file exists.
  - If missing, create a minimal progress file from current context.
- For DOING/VERIFY tasks, check liveness signals:
  - recent progress update
  - recent commit/log activity
  - recent state transition
- If no progress for 20+ minutes:
  - mark SUSPECTED_STALL
  - send proactive alert with evidence and suggested next action
- If task reaches DONE with acceptance evidence:
  - send completion receipt (task_id, summary, artifacts/paths, commit hash if any)

# Guardrails
- Do NOT auto-restart tasks in conservative mode.
- Never stay silent when a running task has stalled.
