# VOICE-20260225-DEBUG-LOG-RELAY

- task_id: `VOICE-20260225-DEBUG-LOG-RELAY`
- title: Android 调试日志网络实时回传（LogRelay）
- repo: `/root/.openclaw/workspace/.projects/xiaodeng-voice-assistant`
- branch: `main`
- workdir: `/root/.openclaw/workspace/.projects/xiaodeng-voice-assistant`
- status: `DOING`
- last_update: `2026-02-25 02:09 UTC`

## 目标
实现手机日志通过网络实时回传到网关，便于远程协同调试唤醒服务。

## 当前状态
- 已完成 Android 侧 `LogRelayClient`。
- 已完成网关侧 `/v1/debug/logs` 接口与按设备日志落盘。
- 已完成构建与新增测试通过。

## 最近动作
1. 新增测试：`v020-debug-log-relay`、`v021-wakeservice-log-relay-wiring`（先 FAIL 后 PASS）。
2. 新增网关日志入口：`/v1/debug/logs`（token 鉴权，`DEBUG_LOG_DIR` 落盘）。
3. 新增 Android 上报：`LogRelayClient.kt`，并在 `WakeService` 关键路径打点。
4. 完成“独立会话槽”执行：`app-voice-brain` 绑定（`v023` PASS，commit `50ed437`）。
5. 完成本地小灯调用器：adapter 支持通过 `openclaw agent --session-id app-voice-brain:*` 本地调用（`v024` PASS，commit `98d0296`）。

## 下一步
1. 启动 direct bridge（不依赖外部 upstream URL）。
2. 在手机触发语音与“发送测试日志”，验证 `reply_text` 与 `logs/device-debug/*.log` 同时可见。
3. 通过后切到 `VERIFY` 并输出联调回执。

## 阻塞项
- 无代码阻塞。
- 待实机联调验证日志是否实时到达。
