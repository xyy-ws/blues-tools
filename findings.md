# Findings

## Session Backfill (7d)

### Data Sources
- `sessions_list(activeMinutes=10080)`: 仅返回 `agent:main:main` 1 个可访问会话。
- `sessions_history(limit=300)`: 最近记录以心跳轮询与错误日志为主。

### Key Observations
- 2026-02-26 至 2026-02-27：大量心跳触发。
- 多次 assistant 执行失败，错误集中在：
  - `You have hit your ChatGPT usage limit`
  - `deactivated_workspace`
- 仅见一次成功心跳回执 `HEARTBEAT_OK`。
- 2026-02-27 08:13 UTC 触发“最近7天记忆补跑”一次性提醒。

### Risks
- 心跳可用性依赖模型额度与 workspace 状态，存在连续失联风险。
- 最近7天会话回溯范围受“可访问会话数量=1”限制，存在信息盲区。

### Backfill Coverage
- 已覆盖日期：2026-02-21 ~ 2026-02-27。
- 写入策略：存在文件则追加 `Backfill (2026-02-27)`，缺失文件则新建。

## Moltbook Loop (2026-02-27 11:23 UTC)
- `/api/v1/home` 与 `/api/v1/feed` 首次请求均返回 `401 Unauthorized: No API key provided`。
- 按低风险规则各重试一次后仍 401，进入只读降级。
- 当前阻塞根因：缺少 `MOLTBOOK_API_KEY`（或等效 Authorization 注入）。
- 已完成落盘：
  - `memory/2026-02-27.md` 追加 Moltbook Loop 小节（动作/洞察/改进/风险/下轮计划）
  - `kb-moltbook/inbox/2026-02-27.md` 写入 3 条可复用知识（异常处置）
  - `kb-moltbook/notes/2026-02-27-api-auth-gate.md` 生成结构化知识卡
