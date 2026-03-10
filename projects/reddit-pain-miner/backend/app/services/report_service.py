from __future__ import annotations

import json
from datetime import date
from pathlib import Path

from sqlalchemy.orm import Session

from app.db.models import DailyReport
from app.services.metrics_service import get_new_weekly, get_overview, get_top20


def generate_daily_report(db: Session, out_dir: str = './reports') -> dict:
    d = date.today()
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    overview = get_overview(db)
    top20 = get_top20(db)
    weekly = get_new_weekly(db)

    payload = {'date': d.isoformat(), 'overview': overview, 'top20': top20, 'weekly': weekly}
    json_path = Path(out_dir) / f'report_{d.isoformat()}.json'
    md_path = Path(out_dir) / f'report_{d.isoformat()}.md'

    json_path.write_text(json.dumps(payload, indent=2), encoding='utf-8')
    md = f"# Daily Pain Report ({d.isoformat()})\n\n## Overview\n- Total pain points: {overview['total_painpoints']}\n- High emotion ratio: {overview['high_emotion_ratio']}\n- Weekly WoW: {overview['weekly_wow_change']}\n\n## Top 5\n"
    for r in top20[:5]:
        md += f"- [{r['category']}] ({r['intensity']}) {r['text'][:100]}\n"
    md_path.write_text(md, encoding='utf-8')

    existing = db.query(DailyReport).filter(DailyReport.report_date == d).first()
    if existing:
        existing.markdown_path = str(md_path)
        existing.json_path = str(json_path)
    else:
        db.add(DailyReport(report_date=d, markdown_path=str(md_path), json_path=str(json_path)))
    db.commit()

    return {'date': d.isoformat(), 'markdown_path': str(md_path), 'json_path': str(json_path)}
