# Weekly Memory Review

Week: 2026-W11
Reviewer: 小灯

## A) Weekly Summary
- Major outcomes:
  - 本周持续执行高频自动化节奏：Cross-Session Digest、Learning Loop、Daily Review、每日规则复盘形成稳定流水。
  - 规则主线进一步收敛：`surface 分面治理`、`active surface 减法`、`resume pointer 完整性`、`cross-session 证据类型+provenance`。
  - 每日记忆邮件流程稳定运行，并保持“发送前脱敏+回执落盘”。
  - 任务看门狗持续生效，能稳定识别并重复告警停滞任务（保守模式，无自动重启）。
- Ongoing threads:
  - `memory_search` 工具仍间歇不可用（见 qmd ENOENT 类错误），语义召回链路不稳定。
  - 部分 cron/会话出现模型 usage limit，导致任务触发后直接失败。
  - 停滞任务（如 PAINMINER 相关）未形成状态转移闭环，需人工决策。

## B) What Should Become Long-Term Memory
List only stable, reusable rules:
1. 高影响判断必须执行分面治理：`display / continuation / audit / artifact` 不可混面；摘要只做导航，不做权威来源。
2. 默认最小活跃表面：工具/历史/审批按需暴露，避免“全量能力一次性摊给模型”。
3. 任何恢复链路必须携带 `pointer + branch context + replay scope`，否则视为“恢复执行、未恢复理解”。
4. 跨会话经验主张必须先标 `evidence mode`，再附最小 `provenance header`，禁止把离散档案链包装成连续观察。

## C) What Should Stay Daily Only
- Temporary context:
  - 某些特定 Discord 频道的一次性调试细节与临时 hotpatch 操作路径。
  - 单次学习循环中的候选文章/评论链接与短期互动统计。
- One-off incidents:
  - 当周特定时段的 usage limit 爆发与单次 cron 失败记录。
  - 某些单帖验证挑战（算术验证码）等一次性发布流程细节。

## D) Repeated Failures (Top 3)
1) Pattern: 定时任务命中 usage limit 后直接失败，造成当轮任务空转。
   - Root cause: 模型配额/路由层不可用时缺少降级执行通道。
   - System fix: 给关键 cron 增加失败分级（retry窗口+降级模型/低成本模板输出+失败回执统一落盘）。
2) Pattern: `memory_search` 不稳定导致语义召回链断裂，复盘依赖人工文件回读。
   - Root cause: qmd 相关依赖/运行时路径异常。
   - System fix: 建立“语义召回不可用”降级标准流程（grep/目录扫描模板），并单独排查 qmd 环境。
3) Pattern: 看门狗持续告警同一停滞任务，但任务状态长期不转移。
   - Root cause: 告警机制稳定，但缺“强制决策闸门”（继续/暂停/降级/关闭）。
   - System fix: 对连续 N 次 stall 告警自动生成决策工单，要求明确状态迁移。

## E) Execution Boundary Updates
- Safe to auto-execute:
  - 只读巡检、跨会话摘要、每日日志落盘、每周复盘生成、脱敏后日报邮件发送。
  - 对 non-DONE 任务做进度文件存在性检查与最小模板补齐。
- Must ask first:
  - 破坏性系统改动（覆盖式 patch、全局重启、批量删除）。
  - 对外公开发送（非既定 cron 渠道）或涉及敏感信息出站。

## F) Final Actions
- [x] Update MEMORY.md with approved rules（本周先产出候选清单，待人工确认后转正）
- [x] Add follow-up tasks to next week
- [x] Archive this review in memory/

## Next-Week Boundary Suggestions
1. 保持 heartbeat 保守模式：继续“检查+告警+回执”，暂不自动重启任务。
2. 对连续 stall 告警引入“第3次必须决策”边界，避免长期重复告警无状态迁移。
3. 为关键 cron 增加 usage limit 降级输出（至少回执+待办），避免“触发即空白失败”。
4. 优先修复 `memory_search` 运行链路，恢复语义召回能力。