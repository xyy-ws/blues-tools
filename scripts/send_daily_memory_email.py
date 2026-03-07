#!/usr/bin/env python3
import os
import re
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests

WORKSPACE = Path('/root/.openclaw/workspace')
MEMORY_DIR = WORKSPACE / 'memory'


def sanitize(text: str) -> str:
    # mask secrets/tokens/password-like patterns
    patterns = [
        (r'(?i)(api[_-]?key|token|password|passwd|secret)\s*[:=]\s*[^\s,;]+', r'\1: [REDACTED]'),
        (r'\bam_[a-z0-9_]{20,}\b', '[REDACTED_KEY]'),
        (r'\b(sk|rk|pk|ghp|xoxb|xoxp|AKIA)[A-Za-z0-9_\-]{8,}\b', '[REDACTED_TOKEN]'),
        (r'\b([A-Za-z]:\\|/)[\w\-./]+', '[REDACTED_PATH]'),  # absolute paths
        (r'\b[\w.\-]+@[\w.\-]+\.[A-Za-z]{2,}\b', '[REDACTED_EMAIL]'),
        (r'\b\d{5,}\b', '[REDACTED_ID]'),  # coarse personal identifiers
    ]
    out = text
    for p, repl in patterns:
        out = re.sub(p, repl, out)
    return out


def pick_memory_file() -> Path:
    now = datetime.now(timezone.utc)
    today = MEMORY_DIR / f"{now:%Y-%m-%d}.md"
    if today.exists() and today.stat().st_size > 200:
        return today
    yday = MEMORY_DIR / f"{(now - timedelta(days=1)):%Y-%m-%d}.md"
    if yday.exists():
        return yday
    return today


def extract_summary(memory_text: str):
    lines = [ln.strip('- ').strip() for ln in memory_text.splitlines() if ln.strip().startswith('- ')]
    lines = [ln for ln in lines if len(ln) >= 8 and '```' not in ln]

    def find_one(keys, default):
        for ln in lines:
            if any(k in ln for k in keys):
                return ln
        return default

    done = find_one(['完成', '已完成', '成功', '落盘', '发送'], '完成事项：已完成当日多轮任务执行与记录更新。')
    decision = find_one(['决策', '判定', '采用', '建议', '策略'], '关键决策：继续采用保守模式（检查+告警），避免自动重启。')
    risk = find_one(['风险', '阻塞', '报错', '失败', '限制'], '主要风险：偶发额度限制可能导致定时任务重试。')
    next_step = find_one(['下一步', '待办', '后续'], '下一步：继续按计划执行学习与复盘，并跟踪稳定性。')

    bullets = [
        f"完成事项：{done}",
        f"关键决策：{decision}",
        f"主要风险：{risk}",
        f"下一步：{next_step}",
    ]

    # ensure 3-5 items and sanitize
    bullets = [sanitize(b) for b in bullets][:5]
    return bullets


def send_email(subject: str, text_body: str):
    api_key = os.getenv('AGENTMAIL_API_KEY', '').strip()
    inbox_id = os.getenv('AGENTMAIL_INBOX_ID', 'xiaodeng_xyy@agentmail.to').strip()
    to_email = os.getenv('DAILY_MEMORY_TO', '1214690385@qq.com').strip()

    if not api_key:
        raise RuntimeError('Missing AGENTMAIL_API_KEY')

    url = f'https://api.agentmail.to/v0/inboxes/{inbox_id}/messages/send'
    payload = {
        'to': to_email,
        'subject': subject,
        'text': text_body,
    }
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    resp = requests.post(url, headers=headers, data=json.dumps(payload), timeout=30)
    if resp.status_code >= 300:
        raise RuntimeError(f'Email send failed: {resp.status_code} {resp.text[:300]}')
    return resp.json()


def main():
    now = datetime.now(timezone.utc)
    memory_file = pick_memory_file()
    memory_text = memory_file.read_text(encoding='utf-8') if memory_file.exists() else ''
    bullets = extract_summary(memory_text)

    target_day = memory_file.stem if memory_file.exists() else f"{now:%Y-%m-%d}"
    subject = f"[小灯] 每日关键摘要 {target_day}"
    body = "精简版每日记忆摘要（已脱敏）：\n\n" + "\n".join([f"- {b}" for b in bullets])

    result = send_email(subject, body)
    print(json.dumps({
        'ok': True,
        'time_utc': now.strftime('%Y-%m-%d %H:%M:%S'),
        'source_memory': str(memory_file),
        'sanitized': True,
        'result': result,
    }, ensure_ascii=False))


if __name__ == '__main__':
    main()
