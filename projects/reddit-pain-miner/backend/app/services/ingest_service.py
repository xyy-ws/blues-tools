from datetime import timezone

from sqlalchemy.orm import Session

from app.collector.reddit_collector import collect_posts
from app.db.models import PainPoint, RawPost
from app.pipeline.processor import process_post


def ingest(limit: int, db: Session) -> int:
    posts = collect_posts(limit=limit)
    inserted = 0
    for p in posts:
        exists = db.query(RawPost).filter(RawPost.source_id == p.source_id).first()
        if exists:
            continue
        raw = RawPost(
            source_id=p.source_id,
            subreddit=p.subreddit,
            title=p.title,
            body=p.body,
            score=p.score,
            created_at=p.created_at.astimezone(timezone.utc).replace(tzinfo=None),
        )
        db.add(raw)

        out = process_post(f"{p.title} {p.body}", p.created_at.date())
        if out is None:
            continue
        pain = PainPoint(
            source_id=p.source_id,
            text=out.text,
            category=out.category,
            sentiment=out.sentiment,
            intensity=out.intensity,
            theme=out.theme,
            week=out.week,
            date=out.date,
        )
        db.add(pain)
        inserted += 1
    db.commit()
    return inserted
