# Weekly Memory Review

Week: 2026-W12
Reviewer: 小灯

## A) Weekly Summary
- Major outcomes:
  - 记忆与巡检主链路稳定：Cross-Session Digest、Learning Loop、Daily Review、每日规则复盘持续执行并落盘。
  - HEARTBEAT 保守模式执行一致：对停滞任务仅告警、不自动重启，行为符合 guardrails。
  - 长期规则治理继续“Merge-first（可并入则并入）”：R188~R199 候选大多并入既有母规则增强条款，未新增母规则编号。
  - 渠道路由治理完成一次关键修正：学习类 cron 回执由旧频道迁移到 `#imporving`，并已更新 jobs 配置。
- Ongoing threads:
  - `PAINMINER-GITHUB-SOURCE-20260310` 长期停滞，持续 `SUSPECTED_STALL`，尚未完成“恢复/暂停”决策闭环。
  - 部分 cron 仍受 usage limit 影响，偶发触发失败或回合中断。
  - 若干候选规则仍缺“最小实跑回执”样本（尤其 interruption/resume、handoff/hosted tool 覆盖矩阵相关）。

## B) What Should Become Long-Term Memory
List only stable, reusable rules:
1. **停滞任务决策闸门**：同一任务连续告警后，必须进入明确状态迁移（`DOING` 恢复或 `PAUSED` 挂起），避免无限重复告警。
2. **规则治理合并优先**：候选规则默认先映射既有母规则增强条款；只有跨场景稳定且不可映射时才新增母规则编号。
3. **高影响完成判定双门闸**：完成声明必须满足 `stream/transport 收口 + interruption 清零`；Realtime 场景额外要求 playback ack 证据。
4. **回执可审计性最小字段**：高影响链路回执默认包含 completion、approval lineage、tool surface/coverage、continuation authority。
5. **配置改动要有可回滚回执**：涉及 cron 路由/投递目标的批量改动，必须保留备份路径与“已生效”证据。

## C) What Should Stay Daily Only
- Temporary context:
  - 单次学习循环中的候选链接、评论区具体线程、当轮互动细节。
  - 某次 heartbeat 触发下的即时告警文案与当轮会话列表。
- One-off incidents:
  - 特定时点的 usage limit 抖动与单回合失败。
  - 某次发帖验证码挑战（如算术题）等一次性流程细节。

## D) Repeated Failures (Top 3)
1) Pattern: 同一 stall 告警跨多轮重复，但任务状态不迁移。
   - Root cause: 有告警机制，但缺“达到阈值即强制决策”的执行门。
   - System fix: 增加“连续 N 次告警必须给出二选一决策（恢复 DOING / 转 PAUSED）”规则与回执。
2) Pattern: cron 受 usage limit 影响时偶发空转，关键任务当轮无产出。
   - Root cause: 缺统一降级通道（轻量回执/最小产出模板）。
   - System fix: 关键 cron 增加降级策略：至少产出失败回执、下一步与重试窗口。
3) Pattern: 候选规则增长快于实跑验证，容易形成“文档充分、样本不足”。
   - Root cause: 学习提炼节奏快，实证回补节奏慢。
   - System fix: 设“候选->转正”最低样本门槛（最小实跑+跨场景复现+回执字段齐全）。

## E) Execution Boundary Updates
- Safe to auto-execute:
  - 只读巡检、跨会话摘要、每日/每周复盘落盘。
  - 非破坏性的任务卡一致性检查（progress file 存在性、状态字段核验）。
  - 学习类/复盘类既定 cron 的例行执行与回执归档。
- Must ask first:
  - 对停滞开发任务执行“恢复推进”这类会引发实际开发动作的切换。
  - 任何外部发送目标变更（新增频道/新增收件人）与批量路由调整。
  - 可能触发系统级副作用的改动（服务重启、全局配置覆盖、批量清理）。

## F) Final Actions
- [ ] Update MEMORY.md with approved rules
- [x] Add follow-up tasks to next week
- [x] Archive this review in memory/

## Suggested MEMORY.md Update List (for approval)
1. 连续 stall 告警必须触发状态迁移决策（恢复 DOING / 转 PAUSED），禁止长期无决策重复告警。
2. 长期规则治理保持“Merge-first”：优先并入母规则，新增母规则需满足不可映射+跨场景稳定证据。
3. 高影响完成声明默认执行“双门闸 + 可审计回执字段集”（含 completion/interruption/approval/surface/continuation）。
4. 关键 cron 在 usage limit 下必须保底输出最小失败回执（原因+下一步+重试窗口），避免静默空转。

## Next-Week Boundary Suggestions
1. **告警决策阈值化**：对同一 `SUSPECTED_STALL` 连续告警达到阈值后，强制进入“恢复 or 暂停”决策流程。
2. **降级可用性优先**：为关键 cron 启用轻量降级模板，确保在配额抖动时仍可给出有效回执。
3. **实证优先于扩规则**：下周控制新增候选数量，优先补齐 R19x 相关最小实跑与跨场景回执。
4. **回执字段标准化**：统一高影响任务回执字段，降低跨会话检索与验收成本。