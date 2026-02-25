# VOICE-20260225-AGENT-GATEWAY-MVP

- task_id: `VOICE-20260225-AGENT-GATEWAY-MVP`
- title: 安卓单URL语音链路（网关稳定器 + agent大脑）MVP
- repo: `/root/.openclaw/workspace/.projects/xiaodeng-voice-assistant`
- branch: `main`
- workdir: `/root/.openclaw/workspace/.projects/xiaodeng-voice-assistant`
- status: `BLOCKED`
- last_update: `2026-02-25 00:38 UTC`

## 目标
在保持 APK 仅配置一个 URL 的前提下，完成可验收的语音回路：APK -> 语音网关 -> Agent。

## 当前状态
- 已进入执行阶段（DOING）。
- Task 1（冻结 API contract + MVP 边界）已完成并通过测试。

## 最近动作
1. 将 `test/v015-direct-provider-interface.test.mjs` 改为契约字段锁定测试（required + optional）。
2. 执行测试并捕获 FAIL 证据（缺少 `request_id` 等字段）。
3. 更新 `api-contract.md` 与 `milestones.md`，补齐 Gateway MVP 统一响应契约与范围边界。
4. 复跑 `node --test test/v015-direct-provider-interface.test.mjs`，结果 PASS。
5. 按用户要求切换子代理执行 Task 2-4，拉起失败并记录配对阻塞证据。

## 下一步
1. 用户侧完成网关配对/恢复（建议先执行 `openclaw status` 检查）。
2. 重新拉起子代理继续 Task 2（Agent Adapter seam）。
3. 按里程碑提交 Task 2-4 的测试结果与 commit 回执。

## 阻塞项
- `SUBAGENT_PAIRING_REQUIRED`：子代理拉起失败，网关返回 `gateway closed (1008): pairing required`（target: `ws://127.0.0.1:18789`）。
- 需先完成 OpenClaw pairing / gateway 可用性恢复后，才能继续 Task 2-4 子代理执行。

## 风险提示（MVP范围内）
- 需要控制时延与超时，避免移动端抖动。
- 需保证会话绑定与幂等，避免串话与重复执行。
- 需规范错误码，确保Android端可稳定回退。
