#!/usr/bin/env python3
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

from agentmail import AgentMail

RECIPIENT = "1214690385@qq.com"
INBOX_FILE = Path('/root/.openclaw/workspace/.agentmail_inbox_id')
WORKSPACE = Path('/root/.openclaw/workspace')


def load_memory_text():
    now = datetime.now(timezone.utc)
    today = now.strftime('%Y-%m-%d')
    yesterday = (now - timedelta(days=1)).strftime('%Y-%m-%d')

    parts = []
    for day in [today, yesterday]:
        p = WORKSPACE / 'memory' / f'{day}.md'
        if p.exists():
            parts.append(f"## {day}\n\n" + p.read_text(encoding='utf-8')[:12000])

    if not parts:
        return "今日暂无可发送的 memory 日志内容。"

    return "\n\n---\n\n".join(parts)


def get_or_create_inbox(client: AgentMail):
    if INBOX_FILE.exists():
        inbox_id = INBOX_FILE.read_text(encoding='utf-8').strip()
        if inbox_id:
            return inbox_id

    inbox = client.inboxes.create(username='xiaodeng-daily-memory')
    inbox_id = getattr(inbox, 'inbox_id', None) or getattr(inbox, 'inboxId', None)
    INBOX_FILE.write_text(inbox_id, encoding='utf-8')
    return inbox_id


def main():
    api_key = os.getenv('AGENTMAIL_API_KEY')
    if not api_key:
        raise RuntimeError('AGENTMAIL_API_KEY not set')

    client = AgentMail(api_key=api_key)
    inbox_id = get_or_create_inbox(client)

    body = load_memory_text()
    subject = f"小灯每日日志摘要 {datetime.now(timezone.utc).strftime('%Y-%m-%d')} UTC"

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
