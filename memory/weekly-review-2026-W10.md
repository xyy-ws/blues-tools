# Weekly Memory Review

Week: 2026-W10 (2026-03-02 ~ 2026-03-08)
Reviewer: 小灯

## A) Weekly Summary
- Major outcomes:
  - 连续完成每日/多轮跨会话 digest，覆盖率多数轮次 >1 会话，`COVERAGE_ALERT` 控制机制稳定执行。
  - 学习循环持续运行（4h/6h），沉淀多批规则候选（约 R53~R79 区间），并保持“候选先行、暂不直接覆盖 MEMORY.md”。
  - HEARTBEAT 保守模式执行稳定：任务巡检以“只检查+告警”为主，未发现需自动恢复的在跑任务。
  - 定时提醒链路可用，但出现间歇性 usage limit/模型额度限制，重试后可恢复。
- Ongoing threads:
  - 候选规则证据强化：从“单源经验”向“跨源/跨任务类型”推进。
  - Cron/学习循环在高并发时的 busy-check 与错峰策略还需持续优化。
  - 一些能力（如浏览器 relay 附着）仍有环境依赖阻塞，需保留人工兜底路径。

## B) What Should Become Long-Term Memory
List only stable, reusable rules:
1. 覆盖可见性规则：跨会话汇总必须附会话覆盖证据；覆盖不足时强制标注“部分覆盖/COVERAGE_ALERT”，禁止写成“全量完成”。
2. 候选升级门：长期规则进入 MEMORY.md 前必须满足最小证据门（跨源或跨任务类型复现），否则维持候选状态。
3. 完成判定三层闭环：完成=执行完成+可见性完成+失败披露完成；任一缺失不得宣称“已完成”。
4. 定时任务稳态策略：配额/限流场景默认“有限重试+错峰”，并记录失败类型用于后续阈值调优。

## C) What Should Stay Daily Only
- Temporary context:
  - 当日具体会话ID、某次限流报错、某次 relay/no-tab 波动。
  - 当天学习条目细节、评论ID、短期跟进提示。
- One-off incidents:
  - 具体某轮 browser relay 未附着、某次 usage limit 的单次失败与恢复。

## D) Repeated Failures (Top 3)
1) Pattern: 间歇性 usage limit/配额限制导致 cron 或回执失败
   - Root cause: 同时段触发任务密度高、重试/退避策略不统一
   - System fix: 统一“指数退避+最大重试次数+错峰窗口”模板，并在失败日志写入错误分型
2) Pattern: 候选规则容易因单轮高质量内容被过早长期化
   - Root cause: 证据门槛定义不够硬，跨源验证被延后
   - System fix: 固化“候选->观察->长期”三级状态与最小样本门槛
3) Pattern: 环境依赖导致链路偶发阻塞（如 relay 附着）
   - Root cause: 外部交互条件不稳定，缺少前置可用性探针
   - System fix: 在执行前增加环境探针与可替代路径（失败即降级，不阻塞主链）

## E) Execution Boundary Updates
- Safe to auto-execute:
  - 心跳巡检（保守模式）、会话覆盖统计、周/日复盘文件生成、候选规则清单整理。
  - 非敏感内部文档整理与结构化摘要落盘。
- Must ask first:
  - 任何对外发布/发送（公开渠道、群发、跨平台外发）。
  - 修改系统级配置、安装/卸载软件、删除/覆盖关键项目文件。
  - 将候选规则直接写入 MEMORY.md（建议先给出清单并等待确认）。

## F) Final Actions
- [x] Update MEMORY.md with approved rules（本周仅输出建议清单，未直接写入）
- [x] Add follow-up tasks to next week
- [x] Archive this review in memory/

## Suggested MEMORY.md Update Candidates (for approval)
1. 新增“跨会话覆盖证据强制门”条目（覆盖不足必须标注 `COVERAGE_ALERT`）。
2. 新增“长期规则升级证据门”条目（未达跨源/跨任务复现不入 MEMORY）。
3. 强化“完成声明门”为三层闭环（执行/可见性/失败披露）。
4. 新增“定时任务限流稳态策略”（退避、错峰、失败分型日志）。

## Next-Week Execution Boundaries (recommended)
- 继续保守模式：仅检查+告警，不自动重启。
- 学习循环优先“质量收敛”而非“数量扩张”：每轮最多新增1-2条候选规则。
- 未达到证据门槛的候选统一留在 review 文件，不进入 MEMORY.md。
- 发生限流时优先保证主任务链路，学习/提醒任务自动降频。