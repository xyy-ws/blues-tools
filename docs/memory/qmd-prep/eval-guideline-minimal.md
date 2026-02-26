# Minimal Canary Evaluation Guideline

## 范围
- 评测集：`eval-dataset-minimal.csv`（10 条）
- K 值：默认 `K=5`
- 对比对象：Local vs QMD（同 query、同 K、同时间窗口）

## 指标口径
1. Recall@5
- 定义：top-5 中是否命中 expected evidence
- 目标：关键类（policy/progress）QMD >= Local

2. Precision@5（人工打标）
- 标注：2=高度相关，1=部分相关，0=无关
- 统计：相关项/总返回项

3. p95 Latency
- 分别统计 Local/QMD
- 目标：QMD <= 1.5x Local

4. Failure Rate
- 失败包括：超时、异常、空结果异常
- 目标：<1%

## 验收判定
- PASS：全部阈值满足
- HOLD：轻微波动但可继续观测
- FAIL：关键阈值失败，执行回滚

## 输出格式
每轮输出：
- query_id
- local_hit(q0/1)
- qmd_hit(q0/1)
- local_latency_ms
- qmd_latency_ms
- local_err
- qmd_err
- reviewer_note
