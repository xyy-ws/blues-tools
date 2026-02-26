# Fast Canary Change Sheet (QMD)

## 目标与边界
- 目标：24h 内完成 QMD 极速灰度（QMD 主用 + local 可一键回退）
- 边界：不改写原始记忆文件（`MEMORY.md`、`memory/*.md`、`task-progress/*`）
- 边界：仅进行配置切换、seed 导入、评测与观测

## 配置项映射（现值/目标值/回滚值）

| Key | 现值 | 目标值 | 回滚值 |
|---|---|---|---|
| `agents.defaults.memorySearch.provider` | `local` | `qmd` | `local` |
| `agents.defaults.memorySearch.fallbackProvider` | *(待确认)* | `local` | `local` |
| `agents.defaults.memorySearch.qmd.endpoint` | *(待确认)* | `http://127.0.0.1:3100`（示例） | 保持不变 |
| `agents.defaults.memorySearch.qmd.timeoutMs` | *(待确认)* | `1500` | `1200`（或原值） |
| `agents.defaults.memorySearch.topK` | *(待确认)* | `5` | 原值 |

> 注：带“待确认”的项在 Task 4 切换前通过实际配置文件补全。

## 单步回滚口令（模板）
1. 将 provider 切回 local-only
2. 重载服务
3. 验证 local 路径恢复

示例命令（以实际配置路径为准）：
```bash
# 1) 修改配置：provider=qmd -> local
# 2) 重启网关
openclaw gateway restart
# 3) 验证
openclaw status
```

## 执行前复核清单
- [x] 每个配置项均有目标值
- [x] 每个配置项均有回滚值（或原值恢复说明）
- [x] 回滚动作不依赖多步人工流程
