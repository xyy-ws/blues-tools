# App 生成流程对照与补足（OpenClaw）

## 一、对照：主流产品设计流程 vs 当前实践

### 1) 双钻模型（Discover/Define/Develop/Deliver）
- Discover：用户痛点与目标场景
- Define：定义 MVP 与成功标准
- Develop：方案探索与原型验证
- Deliver：实现、测试、发布、复盘

### 2) 本次实践映射
- 已做得好：
  - Define：MVP 范围、任务拆解清晰
  - Deliver：测试/构建/E2E/分支推进完整
  - 复盘：已形成可追溯记录
- 暴露不足：
  - Discover 可视化不足（早期可见样片交付晚）
  - 权限/部署前置检查不够系统化
  - 用户感知进度与工程进度节奏不一致

## 二、补足机制（以后固定执行）

### A. 启动前 10 分钟清单（必须）
- [ ] Token 权限自检（Contents/PR/Actions）
- [ ] 预览链路自检（域名/反代/端口/base path）
- [ ] 交付节奏声明（每 30~60 分钟可见结果）

### B. 交付节奏（必须）
- 第一阶段（30-45 分钟）：可见样片（UI/交互）
- 第二阶段（2-4 小时）：功能闭环
- 第三阶段：质量门禁 + 复盘沉淀

### C. 记录策略（实时）
- 项目进行中：更新 `docs/progress.md`
- 里程碑后：更新 `docs/notes/<date>-<project>-retro.md`
- 项目结束：复制并填写 `PROJECT_NOTE_TEMPLATE.zh-CN.md`

## 三、每次项目的标准输出物
1. `docs/progress.md`（实时）
2. `docs/notes/<date>-<project>-retro.md`（复盘）
3. PR 描述（范围、验证、已知问题、回滚）
4. 预览地址（可访问）

## 四、触发规则（建议）
- 新项目开始：自动创建一份项目笔记（基于模板）
- 每个任务完成：自动追加执行日志
- 出现故障：自动写入 RCA 表格
- 项目完成：自动生成 KPT 总结
