from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models import DailyReport, PainPoint


def get_overview(db: Session) -> dict:
    total = db.query(func.count(PainPoint.id)).scalar() or 0
    high_emotion = db.query(func.count(PainPoint.id)).filter(PainPoint.intensity >= 0.66).scalar() or 0
    ratio = round((high_emotion / total), 3) if total else 0.0

    weekly = get_new_weekly(db)
    wow = weekly[-1]['wow_change'] if weekly else 0
    return {
        'total_painpoints': total,
        'high_emotion_ratio': ratio,
        'weekly_wow_change': wow,
    }


def get_top20(db: Session, category: str | None = None, days: int = 30) -> list[dict]:
    since = date.today() - timedelta(days=days)
    q = db.query(PainPoint).filter(PainPoint.date >= since)
    if category:
        q = q.filter(PainPoint.category == category)
    rows = q.order_by(PainPoint.intensity.desc(), PainPoint.id.desc()).limit(20).all()
    return [
        {
            'id': r.id,
            'source_id': r.source_id,
            'text': r.text,
            'category': r.category,
            'intensity': r.intensity,
            'sentiment': r.sentiment,
            'theme': r.theme,
            'date': r.date.isoformat(),
        }
        for r in rows
    ]


def get_new_weekly(db: Session) -> list[dict]:
    rows = db.query(PainPoint.week, func.count(PainPoint.id)).group_by(PainPoint.week).order_by(PainPoint.week.asc()).all()
    data = []
    prev = 0
    for week, cnt in rows:
        wow = cnt - prev if prev else 0
        data.append({'week': week, 'new_count': cnt, 'wow_change': wow})
        prev = cnt
    return data


def get_latest_report(db: Session) -> dict | None:
    r = db.query(DailyReport).order_by(DailyReport.report_date.desc()).first()
    if not r:
        return None
    return {
        'date': r.report_date.isoformat(),
        'markdown_path': r.markdown_path,
        'json_path': r.json_path,
    }


def get_evidence(db: Session, painpoint_id: int) -> dict | None:
    p = db.query(PainPoint).filter(PainPoint.id == painpoint_id).first()
    if not p:
        return None
    return {
        'id': p.id,
        'source_id': p.source_id,
        'text': p.text,
        'category': p.category,
        'theme': p.theme,
        'sentiment': p.sentiment,
        'intensity': p.intensity,
        'date': p.date.isoformat(),
    }


def get_trend(db: Session, days: int = 7) -> list[dict]:
    since = date.today() - timedelta(days=days)
    rows = db.query(PainPoint.date, func.count(PainPoint.id)).filter(PainPoint.date >= since).group_by(PainPoint.date).order_by(PainPoint.date.asc()).all()
    m = defaultdict(int)
    for d, c in rows:
        m[d.isoformat()] = c
    result = []
    for i in range(days + 1):
        d = since + timedelta(days=i)
        result.append({'date': d.isoformat(), 'count': m[d.isoformat()]})
    return result
