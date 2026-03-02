#!/usr/bin/env python3
import os
import re
from datetime import datetime, timezone
from pathlib import Path

from agentmail import AgentMail

RECIPIENT = "1214690385@qq.com"
INBOX_FILE = Path('/root/.openclaw/workspace/.agentmail_inbox_id')
WORKSPACE = Path('/root/.openclaw/workspace')
TASK_INDEX = WORKSPACE / 'task-progress' / 'tasks' / '_index.md'


def _mask_sensitive(text: str) -> str:
    s = text
    # key/token/password-like assignments
    s = re.sub(r'(?i)\b(api[_-]?key|token|password|passwd|secret)\b\s*[:=]\s*[^\s`]+', r'\1: [REDACTED]', s)
    # generic bearer/token strings
    s = re.sub(r'(?i)\b(bearer\s+)[A-Za-z0-9._\-]+', r'\1[REDACTED]', s)
    # absolute unix paths
    s = re.sub(r'/(?:[\w.-]+/)+[\w.-]+', '[PATH_REDACTED]', s)
    # common personal IDs (email / long digit ids)
    s = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b', '[EMAIL_REDACTED]', s)
    s = re.sub(r'\b\d{8,}\b', '[ID_REDACTED]', s)
    return s


def _parse_index_tasks():
    if not TASK_INDEX.exists():
        return []
    text = TASK_INDEX.read_text(encoding='utf-8')
    tasks = []
    cur = {}
    for line in text.splitlines():
        line = line.strip()
        if line.startswith('- task_id:'):
            if cur:
                tasks.append(cur)
            cur = {'task_id': line.split('`')[1] if '`' in line else line.split(':', 1)[1].strip()}
        elif line.startswith('- title:'):
            cur['title'] = line.split(':', 1)[1].strip().strip('`')
        elif line.startswith('- status:'):
            cur['status'] = line.split(':', 1)[1].strip().strip('`').upper()
        elif line.startswith('- last_update:'):
            cur['last_update'] = line.split(':', 1)[1].strip().strip('`')
    if cur:
        tasks.append(cur)
    return tasks


def build_daily_summary():
    now = datetime.now(timezone.utc)
    today = now.strftime('%Y-%m-%d')
    tasks = _parse_index_tasks()

    done = [t for t in tasks if t.get('status') == 'DONE']
    active = [t for t in tasks if t.get('status') in {'PLAN', 'DOING', 'VERIFY', 'BLOCKED'}]
    paused = [t for t in tasks if t.get('status') == 'PAUSED']

    bullets = []
    # 1) completed
    if done:
        latest_done = sorted(done, key=lambda x: x.get('last_update', ''), reverse=True)[0]
        bullets.append(f"完成事项：最近完成任务 {latest_done.get('task_id')}（{latest_done.get('title','-')}），状态 DONE。")
    else:
        bullets.append("完成事项：今日暂无新完成任务记录。")

    # 2) key decision
    if paused:
        bullets.append("关键决策：当前语音相关历史任务保持 PAUSED，按保守模式不自动恢复，等待人工指令。")
    else:
        bullets.append("关键决策：任务推进继续遵循 PLAN→DOING→VERIFY→COMMIT→PUSH→REPORT→NEXT 门禁。")

    # 3) risk
    if active:
        ids = ', '.join(t.get('task_id', '-') for t in active[:2])
        bullets.append(f"主要风险：存在进行中任务（{ids}），若长时间无状态迁移需触发 SUSPECTED_STALL 告警。")
    else:
        bullets.append("主要风险：暂无进行中执行风险，重点风险为上下文可见性边界导致的信息不完整。")

    # 4) next step
    if active:
        next_task = active[0]
        bullets.append(f"下一步：优先推进 {next_task.get('task_id')} 至下一里程碑，并同步验证证据。")
    else:
        bullets.append("下一步：维持定时检查，发现新任务后先登记任务卡与进度文件再执行。")

    # Keep 3-5 items (we use 4)
    body = [f"每日关键摘要（{today} UTC）", ""] + [f"- {b}" for b in bullets]
    body.append("")
    body.append("说明：本邮件已执行发送前脱敏（密钥/Token/密码/绝对路径/个人敏感标识）。")
    return _mask_sensitive('\n'.join(body))


def get_or_create_inbox(client: AgentMail):
    if INBOX_FILE.exists():
        inbox_id = INBOX_FILE.read_text(encoding='utf-8').strip()
        if inbox_id:
            return inbox_id

    try:
        inbox = client.inboxes.create()
        inbox_id = getattr(inbox, 'inbox_id', None) or getattr(inbox, 'inboxId', None)
        INBOX_FILE.write_text(inbox_id, encoding='utf-8')
        return inbox_id
    except Exception:
        inboxes = client.inboxes.list(limit=1)
        items = getattr(inboxes, 'inboxes', None) or []
        if not items:
            raise
        first = items[0]
        inbox_id = getattr(first, 'inbox_id', None) or getattr(first, 'inboxId', None)
        INBOX_FILE.write_text(inbox_id, encoding='utf-8')
        return inbox_id


def main():
    api_key = os.getenv('AGENTMAIL_API_KEY')
    if not api_key:
        raise RuntimeError('AGENTMAIL_API_KEY not set')

    client = AgentMail(api_key=api_key)
    inbox_id = get_or_create_inbox(client)

    body = build_daily_summary()
    subject = f"小灯每日日志关键摘要 {datetime.now(timezone.utc).strftime('%Y-%m-%d')} UTC"

    resp = client.inboxes.messages.send(
        inbox_id=inbox_id,
        to=RECIPIENT,
        subject=subject,
        text=body,
    )

    message_id = getattr(resp, 'message_id', None) or getattr(resp, 'messageId', None)
    print(f"sent: {message_id}")


if __name__ == '__main__':
    main()
