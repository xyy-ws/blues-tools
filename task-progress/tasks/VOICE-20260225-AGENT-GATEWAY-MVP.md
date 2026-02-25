# VOICE-20260225-AGENT-GATEWAY-MVP

- task_id: `VOICE-20260225-AGENT-GATEWAY-MVP`
- title: 安卓单URL语音链路（网关稳定器 + agent大脑）MVP
- repo: `/root/.openclaw/workspace/.projects/xiaodeng-voice-assistant`
- branch: `main`
- workdir: `/root/.openclaw/workspace/.projects/xiaodeng-voice-assistant`
- status: `DOING`
- last_update: `2026-02-25 00:42 UTC`

## 目标
在保持 APK 仅配置一个 URL 的前提下，完成可验收的语音回路：APK -> 语音网关 -> Agent。

## 当前状态
- 已进入执行阶段（DOING）。
- Task 1~4 已完成（契约冻结、Adapter seam、session+幂等、超时+限流+错误码）。

## 最近动作
1. 完成 Task 2：新增 `agent-adapter.mjs` 并将 `server.mjs` 解耦为 adapter 调用。
2. 完成 Task 3：新增 `session-store.mjs`，实现单设备 session 绑定与 request_id 幂等缓存。
3. 完成 Task 4：实现 `withTimeout` 与 `isRateLimited`，标准化 `UNAUTHORIZED/RATE_LIMITED/AGENT_TIMEOUT` 错误码。
4. 相关测试均已按“先 FAIL 后 PASS”执行通过（v017/v018/v019）。

## 下一步
1. 执行 Task 5：Android 客户端 fallback 与错误态处理。
2. 执行 Task 6：E2E 验证与 APK 产物回执。
3. 执行 Task 7：发布门禁清单并等待 push 确认。

## 阻塞项
- 子代理通道仍存在 pairing 问题，但已切换主会话执行，不影响当前里程碑推进。

## 风险提示（MVP范围内）
- 需要控制时延与超时，避免移动端抖动。
- 需保证会话绑定与幂等，避免串话与重复执行。
- 需规范错误码，确保Android端可稳定回退。
