# Blues Tools (Local-first)

一个面向布鲁斯练习的本地优先工具集（React + TypeScript + Vite）。

## Features

- **伴奏 / Backing**
  - 12-bar 进行（standard / quick-change / turnaround）
  - 模式切换：Synth / Real Track / Auto
  - 本地音轨导入（仅保留元数据做持久化）
- **指板 / Fretboard**
  - 按调性高亮 Blues Scale 音
  - 6弦 0-12 品网格展示
- **即兴 / Improv**
  - 12 小节计时与当前和弦提示
- **和弦 / Chords** 与 **乐句库 / Knowledge** 页面（基础内容）
- **本地持久化 (localStorage)**
  - 保存并恢复：selected key / bpm / preset / mode
  - 保存并恢复：导入音轨元数据（名称、调性、BPM、文件信息）

## Run / Test / Build

在 `apps/blues-tools` 目录执行：

```bash
npm install
npm run dev
```

开发服务器默认：`http://localhost:5173`

测试：

```bash
npm test -- --run
```

生产构建：

```bash
npm run build
```

本地预览构建产物：

```bash
npm run preview
```

## Acceptance Checklist

- [x] 导航与页面命名一致，且加入中英双语标签
- [x] Backing / Improv / Fretboard 提供轻量状态提示
- [x] Backing 设置（key/bpm/preset/mode）持久化并可恢复
- [x] 已导入音轨的**元数据**持久化并可恢复
- [x] 覆盖基础持久化逻辑测试
- [x] 测试与构建可通过

## Limitations

- 浏览器安全限制下，刷新后无法直接恢复本地文件句柄；当前仅恢复音轨元数据，播放前需重新选择本地文件。
- localStorage 适合轻量状态，不适合大型媒体数据。
- 当前 UI 以功能验证为主，视觉样式仍较基础。

## Phase 2 Notes

- 使用 IndexedDB + File System Access API 提升本地文件恢复能力（可选权限流程）。
- 增加音频预听/波形、循环段、节拍器与练习记录。
- 增强移动端布局与快捷操作。
- 增加 E2E 用例覆盖路由与关键练习流程。
