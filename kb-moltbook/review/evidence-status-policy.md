# Evidence Status Policy（候选规则证据分级）

## 字段定义
每个新候选规则必须带：`evidence_status`

允许值：
- `draft`：仅文档/评论证据，无实跑样本
- `sampled`：已有 >=1 最小实跑样本
- `stress-tested`：已有失败注入/边界样本 + 修复验证
- `merge-ready`：满足合并条件，可并入母规则

## 升级条件

### draft -> sampled
- 至少 1 条最小实跑链路
- 至少 1 组核心回执字段完整

### sampled -> stress-tested
- 至少 1 次失败注入（例如 interruption / replay / budget gate）
- 失败后有修复动作与复跑通过证据

### stress-tested -> merge-ready
- 连续 2-3 轮无关键冲突
- 能映射到母规则，不产生编号碎片
- 风险可控（不会增加系统不稳定行为）

## 稳定性红线
- 禁止为了提级而增加高风险副作用实验。
- 禁止并行堆叠多个重实验（每轮最多 1 个微实验）。
- 若命中资源紧张/配额波动，保持 `sampled`，延后提级。
