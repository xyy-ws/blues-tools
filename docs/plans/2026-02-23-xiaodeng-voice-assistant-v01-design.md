# 小灯语音唤醒助手（Android 常驻 v0.1）Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 Android 手机上实现「小灯小灯」唤醒并可直接语音对话的可用闭环（v0.1）。

**Architecture:** 采用“本地唤醒 + 云端对话”分层架构：手机端负责前台服务常驻、唤醒词检测、录音上传与回播；云端 OpenClaw 负责 ASR/LLM/TTS。先实现稳定闭环，再做延迟优化。

**Tech Stack:** Android (Kotlin + Foreground Service + AudioRecord), Porcupine (wake word), HTTPS API, OpenClaw ASR/LLM/TTS。

---

### Task 1: 项目骨架与里程碑文档（Milestone-1）

**Files:**
- Create: `docs/projects/xiaodeng-voice-assistant/README.md`
- Create: `docs/projects/xiaodeng-voice-assistant/milestones.md`
- Create: `docs/projects/xiaodeng-voice-assistant/risk-register.md`

**Step 1: 写入目标与范围文档（先定义可验收边界）**

写明：
- v0.1 必达：唤醒、录音、云端回复、TTS 回播
- v0.1 非目标：离线全链路、iOS、多设备联动

**Step 2: 补里程碑拆解**

里程碑：
- M1 规划与骨架
- M2 安卓端唤醒常驻
- M3 云端对话打通
- M4 连续对话与稳定性
- M5 验收与发布

**Step 3: 风险清单**

覆盖：
- Android 后台常驻限制
- 唤醒误触发/漏触发
- 语音链路延迟抖动
- 电量与发热
- 网络异常回退策略

**Step 4: 验证 M1 产物完整性**

Run: `test -f docs/projects/xiaodeng-voice-assistant/README.md && test -f docs/projects/xiaodeng-voice-assistant/milestones.md && test -f docs/projects/xiaodeng-voice-assistant/risk-register.md && echo OK`
Expected: `OK`

**Step 5: Commit**

```bash
git add docs/projects/xiaodeng-voice-assistant
git commit -m "docs(project): initialize xiaodeng voice assistant v0.1 milestone docs"
```

### Task 2: Android 常驻监听最小实现（Milestone-2）

**Files:**
- Create: `apps/xiaodeng-assistant/android/README.md`
- Create: `apps/xiaodeng-assistant/android/app/src/main/java/.../WakeService.kt`
- Create: `apps/xiaodeng-assistant/android/app/src/main/java/.../WakeDetector.kt`

**Step 1:** 先写 README 明确运行方式与权限（麦克风、前台服务）。

**Step 2:** 实现前台服务骨架（启动通知、生命周期、异常重启策略）。

**Step 3:** 接入 wake word 检测（Porcupine），唤醒后抛出事件。

**Step 4:** 本地验证：手动触发 + 唤醒词日志可见。

**Step 5:** commit。

### Task 3: 云端语音对话打通（Milestone-3）

**Files:**
- Create: `apps/xiaodeng-assistant/android/app/src/main/java/.../VoiceUploadClient.kt`
- Create: `docs/projects/xiaodeng-voice-assistant/api-contract.md`

**Steps:**
1. 定义请求/响应协议（audio -> text/tts_url）。
2. 上传录音并接收回复。
3. 回播 TTS。
4. 验证单轮对话成功。
5. commit。

### Task 4: 连续对话与稳定性（Milestone-4）

**Files:**
- Modify: `WakeService.kt`
- Create: `docs/projects/xiaodeng-voice-assistant/test-report-template.md`

**Steps:**
1. 增加“会话窗口”（唤醒后 N 秒内免唤醒连续对话）。
2. 增加网络失败回退提示。
3. 记录延迟与失败率。
4. 跑 3 轮连续对话验收。
5. commit。

### Task 5: 验收与发布（Milestone-5）

**Files:**
- Create: `docs/releases/xiaodeng-voice-assistant-v0.1.0.md`
- Create: `docs/projects/xiaodeng-voice-assistant/acceptance-report.md`

**Steps:**
1. 汇总验收数据（唤醒成功、单轮成功、3轮稳定、延迟统计）。
2. 输出安装与回滚说明。
3. 发布并推送里程碑回执。
4. commit/tag。
