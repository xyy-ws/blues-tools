from datetime import timezone
from math import ceil
from typing import Callable

from sqlalchemy.orm import Session

from app.collector.github_collector import collect_issues
from app.collector.reddit_collector import collect_posts
from app.db.models import PainPoint, RawPost
from app.pipeline.processor import process_post


ProgressCallback = Callable[[int, str], None]


def _source_prefix(source: str) -> str:
    return 'gh:' if source == 'github' else 'rd:'


def _iter_batches(items, batch_size: int):
    for i in range(0, len(items), batch_size):
        yield items[i : i + batch_size]


def _safe_progress(cb: ProgressCallback | None, progress: int, message: str) -> None:
    if cb is None:
        return
    cb(max(0, min(100, int(progress))), message)


def ingest(
    limit: int,
    db: Session,
    source: str = 'reddit',
    progress_cb: ProgressCallback | None = None,
    batch_size: int = 25,
) -> int:
    inserted = 0
    prefix = _source_prefix(source)
    batch_size = max(20, min(50, batch_size))

    _safe_progress(progress_cb, 2, f'Collecting {source} records...')
    records = list(collect_issues(limit=limit)) if source == 'github' else list(collect_posts(limit=limit))
    total = len(records)
    if total == 0:
        _safe_progress(progress_cb, 100, f'No {source} records found')
        return 0

    total_batches = ceil(total / batch_size)

    if source == 'github':
        for batch_index, batch in enumerate(_iter_batches(records, batch_size), start=1):
            for i in batch:
                source_id = i.source_id if i.source_id.startswith(prefix) else f'{prefix}{i.source_id}'
                exists = db.query(RawPost).filter(RawPost.source_id == source_id).first()
                if exists:
                    continue
                body = f"{i.body}\n\n[state:{i.state}] [labels:{','.join(i.labels)}] [url:{i.url}] [updated:{i.updated_at.isoformat()}]"
                raw = RawPost(
                    source_id=source_id,
                    subreddit=i.repo,
                    title=i.title,
                    body=body,
                    score=0,
                    created_at=i.created_at.astimezone(timezone.utc).replace(tzinfo=None),
                )
                db.add(raw)

                enriched_text = f"{i.title} {i.body} labels {' '.join(i.labels)} state {i.state}"
                out = process_post(enriched_text, i.created_at.date(), source='github', context=i.repo)
                if out is None:
                    continue
                db.add(
                    PainPoint(
                        source_id=source_id,
                        text=out.text,
                        category=out.category,
                        sentiment=out.sentiment,
                        intensity=out.intensity,
                        theme=out.theme,
                        week=out.week,
                        date=out.date,
                    )
                )
                inserted += 1

            db.commit()
            progress = 10 + int((batch_index / total_batches) * 85)
            _safe_progress(progress_cb, progress, f'Processed batch {batch_index}/{total_batches} ({source}), inserted={inserted}')
    else:
        for batch_index, batch in enumerate(_iter_batches(records, batch_size), start=1):
            for p in batch:
                source_id = p.source_id if p.source_id.startswith(prefix) else f'{prefix}{p.source_id}'
                exists = db.query(RawPost).filter(RawPost.source_id == source_id).first()
                if exists:
                    continue
                raw = RawPost(
                    source_id=source_id,
                    subreddit=p.subreddit,
                    title=p.title,
                    body=p.body,
                    score=p.score,
                    created_at=p.created_at.astimezone(timezone.utc).replace(tzinfo=None),
                )
                db.add(raw)

                out = process_post(f"{p.title} {p.body}", p.created_at.date(), source='reddit', context=p.subreddit)
                if out is None:
                    continue
                db.add(
                    PainPoint(
                        source_id=source_id,
                        text=out.text,
                        category=out.category,
                        sentiment=out.sentiment,
                        intensity=out.intensity,
                        theme=out.theme,
                        week=out.week,
                        date=out.date,
                    )
                )
                inserted += 1

            db.commit()
            progress = 10 + int((batch_index / total_batches) * 85)
            _safe_progress(progress_cb, progress, f'Processed batch {batch_index}/{total_batches} ({source}), inserted={inserted}')

    _safe_progress(progress_cb, 100, f'{source.capitalize()} ingest complete: inserted={inserted}')
    return inserted
