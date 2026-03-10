# Task Card — REDDIT-PAIN-20260310-MVP

- task_id: REDDIT-PAIN-20260310-MVP
- title: Reddit 痛点挖掘系统 MVP（前后端）
- repo: workspace (isolated project dir)
- branch: main (feature files under projects/reddit-pain-miner)
- workdir: /root/.openclaw/workspace/projects/reddit-pain-miner
- status: DONE
- last_update: 2026-03-10T07:25:00Z
- progress_file: task-progress/tasks/REDDIT-PAIN-20260310-MVP.md

## Scope
- Data source: Reddit
- Categories: 功能痛点/流程痛点/付费痛点
- Outputs: 高频痛点Top20、新增痛点周环比、高情绪强度占比、证据与建议
- Deliverable: Backend + Frontend + daily report generation + local run

## Milestones
1. PLAN: architecture + scaffold + schema
2. DOING: backend (collector/pipeline/api)
3. DOING: frontend dashboard
4. VERIFY: run tests + sample dataset + end-to-end checks
5. COMMIT/PUSH/REPORT

## Notes
- Project isolation required under projects/reddit-pain-miner
- Use multi-agent flow: planner -> builder -> verification-qa-guard
