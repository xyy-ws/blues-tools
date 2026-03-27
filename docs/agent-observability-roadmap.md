# Agent Observability Dashboard 项目流程表（从简到繁）

> 目标：围绕“可视化 agent 工作流 + 可闭环自主优化 + 多平台通用对接”逐步落地。
> 执行方式：按流程推进，不强制固定周节奏。

---

## 总原则

1. 每个阶段都要有可运行成果与验收标准。
2. 先可观测，再评估，再优化自动化。
3. 先支持 OpenClaw，再抽象为多平台适配。
4. 避免一次做全，优先最小闭环。

---

## Phase 0：项目骨架与规范（地基）

### 目标
统一模型与工程骨架，确保后续不返工。

### 产出
- 架构图 v1（采集→标准化→存储→可视化→评估→优化）
- 统一事件协议 v1（run/trace/span/token/cost/decision/evidence）
- 状态机定义（PLAN→DOING→VERIFY→COMMIT→PUSH→REPORT→DONE/BLOCKED）
- 仓库结构与本地启动脚本（docker compose）
- 最小数据流通（手工事件可入库并在前端可见）

### 验收标准
- 能通过一条模拟事件跑通“写入→查询→展示”。

---

## Phase 1：最小可观测闭环（MVP-1）

### 目标
先“看见正在发生什么”。

### 产出
- OpenClaw 采集器（先接 sessions_list / session_status）
- 实时事件流（SSE/WebSocket）
- Dashboard v1：
  - 活跃会话列表
  - token/cost 实时卡片
  - 基础执行时间线
- 基础阻塞告警（例如无推进超阈值）

### 验收标准
- 任务运行中，前端可在数秒内看到 token 与状态变化。

---

## Phase 2：执行链路可视化（MVP-2）

### 目标
看清主从 agent 执行链路。

### 产出
- trace_id/span_id/parent_span_id 全链路关联
- 主 agent → 子 agent → verifier 拓扑/树状展示
- 节点钻取（耗时、状态、工具调用摘要、错误摘要）
- trace 回放查询（按 trace/task/session）

### 验收标准
- 任一任务可回放完整执行链，并准确展示父子关系。

---

## Phase 3：产出与证据层

### 目标
不仅看过程，还要看“产出是否有效”。

### 产出
- 产出面板（artifact、commit、验收结论）
- 证据关联（节点→日志/报告/提交哈希）
- “高耗低产”检测规则（初版）

### 验收标准
- 可定位“高 token 但低有效产出”的热点节点。

---

## Phase 4：评估与基准（Eval & Benchmark）

### 目标
从可观测升级为可评估。

### 产出
- 指标字典：成功率、首过率、P95、重试率、成本/任务
- 基准任务集（小/中/大）
- Prompt/Agent/Model A/B 对比
- 回归门禁（劣于基线时标记阻断）

### 验收标准
- 任一 Prompt/Agent 改动后可输出基准对比报告。

---

## Phase 5：自主优化闭环（先半自动）

### 目标
让系统可提出建议并验证收益。

### 产出
- Agent 可读 insights API
- 优化建议引擎 v1（规则驱动）
- Apply → Re-evaluate → Keep/Rollback 流程
- 人工审批开关（默认启用）

### 验收标准
- 可完成一次“建议→应用→复测→保留/回滚”的完整闭环。

---

## Phase 6：多平台适配层（通用化）

### 目标
支持多 agent 平台接入，不绑定单一框架。

### 产出
- Adapter Interface v1
- OpenClaw Adapter（基准实现）
- 第二平台 Adapter（如 LangGraph/AutoGen 二选一）
- Capability Matrix（平台能力支持表）

### 验收标准
- 至少两个平台事件可进入同一 Dashboard 统一展示与评估。

---

## 横向约束（全阶段生效）

1. **思维可视化边界**：展示 decision summary，不直接暴露原始隐藏推理。
2. **安全与脱敏**：凭据/PII 自动脱敏，保留审计日志。
3. **成本口径统一**：保留原始账单字段 + 统一成本换算器。
4. **可靠性**：采集链路故障不影响主任务执行（旁路、可降级）。
5. **版本化**：事件协议与 API 均做 schema version 管理。

---

## 里程碑推进方式

按流程表顺序推进；每完成一个 Phase：
- 给出阶段回执（完成项、证据、风险、下一阶段入口）
- 再进入下一 Phase

（不强制固定周节奏）
