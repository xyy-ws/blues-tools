# 本次项目笔记（Session-wrap-up 风格）

## 会话收尾摘要
### 本次捕获内容
- 需求与决策：生活类习惯 App，Web 优先，匿名设备+恢复码，双语需求（zh-CN/en）。
- 交付结果：Habit MVP 主线任务完成，预览与域名联调完成。
- UI 演进：从功能版 → quick-ui 样片 → 主项目高级感部署。

### 本次更新的核心文件
- `docs/progress.md`（实时进度）
- `docs/notes/2026-02-16-openclaw-app-retro.md`（复盘）
- `docs/notes/APP_GENERATION_PLAYBOOK.zh-CN.md`（流程对照与补足）
- `docs/notes/PROJECT_NOTE_TEMPLATE.zh-CN.md`（标准模板）

### 问题与处理
- GitHub push/PR 权限：补 scope 后解决。
- 预览 502/404：修复反代与前端子路径配置。
- E2E 超时：定位到渲染链路问题并修复。

### 下次会话建议
1. 启动前先跑“权限+预览链路”检查。
2. 先交 30 分钟可见样片，再推进完整功能。
3. 每个里程碑自动写入项目笔记与 RCA。
