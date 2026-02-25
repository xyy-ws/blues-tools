# VOICE-20260225-ANDROID-UI-DEBUG-PANEL

- task_id: `VOICE-20260225-ANDROID-UI-DEBUG-PANEL`
- title: Android 前端 UI 优化 + 可见错误与事件面板
- repo: `/root/.openclaw/workspace/.projects/xiaodeng-voice-assistant`
- branch: `main`
- workdir: `/root/.openclaw/workspace/.projects/xiaodeng-voice-assistant`
- status: `DOING`
- last_update: `2026-02-25 03:58 UTC`

## 目标
优化主界面可用性，提供状态、错误、事件流可视化，支持快速验收与排障。

## 当前状态
- 主界面已增加状态区、最近错误、事件流、复制错误、清空事件、发送测试日志按钮。
- 新增 UI 测试并通过；Debug 构建通过。

## 关键证据
- 测试：`node --test test/v012-main-activity-*.test.mjs test/v022-main-activity-debug-panel.test.mjs` -> PASS
- 构建：`./gradlew :app:assembleDebug` -> BUILD SUCCESSFUL
- 提交：`33f2637`
