# Session Continuation
Tags: #concept #ai-learning

## One-line definition
在会话中断后，基于唯一续跑权威来源恢复执行上下文与状态的一组机制。

## Why it matters
- 避免恢复时混入多个状态源，导致逻辑分叉。

## Common confusion
- 把“对话历史存在”误当成“执行状态可安全恢复”。

## Example
- 仅使用 `session` 或 `previous_response` 其中之一作为续跑来源，不混用。

## Links
- [[Daily/2026-03-19]]
