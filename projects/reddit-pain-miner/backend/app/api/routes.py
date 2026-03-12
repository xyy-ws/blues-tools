from datetime import date
from pathlib import Path

from dotenv import dotenv_values, set_key
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.collector.github_collector import collect_issues
from app.collector.reddit_collector import collect_posts
from app.core.config import ENV_PATH, reload_settings, settings
from app.db.database import SessionLocal, get_db
from app.services.ingest_service import ingest
from app.services.job_manager import job_manager
from app.services.metrics_service import (
    get_evidence,
    get_latest_report,
    get_new_weekly,
    get_overview,
    get_report_by_date,
    get_top20,
    get_trend,
)
from app.services.report_service import generate_daily_report

router = APIRouter()


class RedditConfigPayload(BaseModel):
    reddit_client_id: str | None = Field(default='', alias='REDDIT_CLIENT_ID')
    reddit_client_secret: str | None = Field(default='', alias='REDDIT_CLIENT_SECRET')
    reddit_user_agent: str = Field(default='reddit-pain-miner/0.1', alias='REDDIT_USER_AGENT')
    reddit_subreddits: str = Field(default='Entrepreneur,SaaS,smallbusiness,startups', alias='REDDIT_SUBREDDITS')
    mock_mode: bool = Field(default=True, alias='MOCK_MODE')

    model_config = {'populate_by_name': True}


class GithubConfigPayload(BaseModel):
    github_token: str | None = Field(default='', alias='GITHUB_TOKEN')
    github_repos: str = Field(default='', alias='GITHUB_REPOS')
    github_enabled: bool = Field(default=False, alias='GITHUB_ENABLED')
    github_limit: int = Field(default=100, alias='GITHUB_LIMIT', ge=1, le=1000)

    model_config = {'populate_by_name': True}


class IngestPayload(BaseModel):
    limit: int = Field(default=100, ge=1, le=1000)
    sync: bool = Field(default=False)


def _bool_str(v: bool) -> str:
    return 'true' if v else 'false'


def _to_bool(value, fallback: bool) -> bool:
    return str(value if value is not None else _bool_str(fallback)).lower() in {'1', 'true', 'yes', 'on'}


def _persist_env(values: dict):
    ENV_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not ENV_PATH.exists():
        ENV_PATH.write_text('', encoding='utf-8')
    for key, value in values.items():
        serialized = _bool_str(value) if isinstance(value, bool) else str(value or '')
        set_key(str(ENV_PATH), key, serialized)


@router.get('/admin/config/reddit')
def get_reddit_config():
    env = dotenv_values(ENV_PATH)
    return {
        'status': 'ok',
        'config': {
            'REDDIT_CLIENT_ID': env.get('REDDIT_CLIENT_ID', settings.reddit_client_id or ''),
            'REDDIT_CLIENT_SECRET': env.get('REDDIT_CLIENT_SECRET', settings.reddit_client_secret or ''),
            'REDDIT_USER_AGENT': env.get('REDDIT_USER_AGENT', settings.reddit_user_agent),
            'REDDIT_SUBREDDITS': env.get('REDDIT_SUBREDDITS', settings.reddit_subreddits),
            'MOCK_MODE': _to_bool(env.get('MOCK_MODE'), settings.mock_mode),
        },
        'env_path': str(ENV_PATH),
    }


@router.post('/admin/config/reddit')
def save_reddit_config(payload: RedditConfigPayload):
    values = payload.model_dump(by_alias=True)
    _persist_env(values)
    refreshed = reload_settings()
    return {
        'status': 'ok',
        'message': 'Reddit configuration saved',
        'config': {
            'REDDIT_CLIENT_ID': refreshed.reddit_client_id or '',
            'REDDIT_CLIENT_SECRET': refreshed.reddit_client_secret or '',
            'REDDIT_USER_AGENT': refreshed.reddit_user_agent,
            'REDDIT_SUBREDDITS': refreshed.reddit_subreddits,
            'MOCK_MODE': refreshed.mock_mode,
        },
    }


@router.get('/admin/config/github')
def get_github_config():
    env = dotenv_values(ENV_PATH)
    return {
        'status': 'ok',
        'config': {
            'GITHUB_TOKEN': env.get('GITHUB_TOKEN', settings.github_token or ''),
            'GITHUB_REPOS': env.get('GITHUB_REPOS', settings.github_repos),
            'GITHUB_ENABLED': _to_bool(env.get('GITHUB_ENABLED'), settings.github_enabled),
            'GITHUB_LIMIT': int(env.get('GITHUB_LIMIT', settings.github_limit)),
        },
        'env_path': str(ENV_PATH),
    }


@router.post('/admin/config/github')
def save_github_config(payload: GithubConfigPayload):
    values = payload.model_dump(by_alias=True)
    _persist_env(values)
    refreshed = reload_settings()
    return {
        'status': 'ok',
        'message': 'GitHub configuration saved',
        'config': {
            'GITHUB_TOKEN': refreshed.github_token or '',
            'GITHUB_REPOS': refreshed.github_repos,
            'GITHUB_ENABLED': refreshed.github_enabled,
            'GITHUB_LIMIT': refreshed.github_limit,
        },
    }


@router.post('/admin/reddit/test')
def test_reddit_connection():
    try:
        posts = list(collect_posts(limit=1))
        return {
            'status': 'ok',
            'result': {
                'mode': 'mock' if settings.mock_mode else 'live',
                'sample_count': len(posts),
            },
        }
    except Exception as exc:
        return {'status': 'error', 'error': str(exc)}


@router.post('/admin/reddit/ingest')
async def ingest_reddit(payload: IngestPayload):
    if payload.sync:
        try:
            local_db = SessionLocal()
            try:
                inserted = ingest(limit=payload.limit, db=local_db, source='reddit', batch_size=25)
            finally:
                local_db.close()
            return {'status': 'ok', 'result': {'inserted': inserted, 'limit': payload.limit, 'source': 'reddit'}}
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f'Ingest failed: {exc}')

    def runner(progress_cb):
        local_db = SessionLocal()
        try:
            inserted = ingest(limit=payload.limit, db=local_db, source='reddit', progress_cb=progress_cb, batch_size=25)
            return {'inserted': inserted, 'limit': payload.limit, 'source': 'reddit'}
        finally:
            local_db.close()

    job = job_manager.submit(source='reddit', runner=runner)
    return {'status': 'ok', 'job_id': job.job_id}


@router.post('/admin/github/test')
def test_github_connection():
    try:
        sample_limit = settings.github_limit if settings.github_limit > 0 else 1
        issues = list(collect_issues(limit=min(1, sample_limit)))
        return {
            'status': 'ok',
            'result': {
                'mode': 'mock' if not settings.github_enabled else 'live',
                'sample_count': len(issues),
                'repos': [r.strip() for r in settings.github_repos.split(',') if r.strip()],
            },
        }
    except Exception as exc:
        return {'status': 'error', 'error': str(exc)}


@router.post('/admin/github/ingest')
async def ingest_github(payload: IngestPayload):
    effective_limit = payload.limit or settings.github_limit

    if payload.sync:
        try:
            local_db = SessionLocal()
            try:
                inserted = ingest(limit=effective_limit, db=local_db, source='github', batch_size=25)
            finally:
                local_db.close()
            return {'status': 'ok', 'result': {'inserted': inserted, 'limit': effective_limit, 'source': 'github'}}
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f'GitHub ingest failed: {exc}')

    def runner(progress_cb):
        local_db = SessionLocal()
        try:
            inserted = ingest(limit=effective_limit, db=local_db, source='github', progress_cb=progress_cb, batch_size=25)
            return {'inserted': inserted, 'limit': effective_limit, 'source': 'github'}
        finally:
            local_db.close()

    job = job_manager.submit(source='github', runner=runner)
    return {'status': 'ok', 'job_id': job.job_id}


@router.get('/admin/jobs/latest')
def get_latest_job(source: str | None = Query(default=None, pattern='^(reddit|github)$')):
    job = job_manager.latest(source=source)
    if not job:
        raise HTTPException(status_code=404, detail='No job found')
    return {'status': 'ok', 'job': job.__dict__}


@router.get('/admin/jobs/{job_id}')
def get_job(job_id: str):
    job = job_manager.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    return {'status': 'ok', 'job': job.__dict__}


@router.post('/admin/reports/generate')
def generate_report(db: Session = Depends(get_db)):
    try:
        report = generate_daily_report(db)
        return {'status': 'ok', 'result': report}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Report generation failed: {exc}')


@router.get('/metrics/overview')
def metrics_overview(source: str = Query(default='all', pattern='^(all|reddit|github)$'), db: Session = Depends(get_db)):
    s = None if source == 'all' else source
    return get_overview(db, source=s)


@router.get('/painpoints/top20')
def painpoints_top20(
    category: str | None = Query(default=None),
    source: str = Query(default='all', pattern='^(all|reddit|github)$'),
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
):
    s = None if source == 'all' else source
    return {'items': get_top20(db, category=category, days=days, source=s)}


@router.get('/painpoints/new-weekly')
def painpoints_new_weekly(source: str = Query(default='all', pattern='^(all|reddit|github)$'), db: Session = Depends(get_db)):
    s = None if source == 'all' else source
    return {'items': get_new_weekly(db, source=s)}


@router.get('/reports/daily/latest')
def reports_daily_latest(db: Session = Depends(get_db)):
    report = get_latest_report(db)
    if not report:
        raise HTTPException(status_code=404, detail='No report found')
    return report


@router.get('/reports/daily/file')
def reports_daily_file(
    date_str: str = Query(alias='date'),
    file_type: str = Query(alias='type', pattern='^(md|json)$'),
    db: Session = Depends(get_db),
):
    try:
        d = date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=422, detail='Invalid date format, expected YYYY-MM-DD')

    report = get_report_by_date(db, d)
    if not report:
        raise HTTPException(status_code=404, detail='Report not found')

    file_path = report['markdown_path'] if file_type == 'md' else report['json_path']
    p = Path(file_path)
    if not p.exists():
        raise HTTPException(status_code=404, detail='Report file missing on server')

    media_type = 'text/markdown; charset=utf-8' if file_type == 'md' else 'application/json'
    return FileResponse(path=str(p), media_type=media_type, filename=p.name)


@router.get('/evidence/{painpoint_id}')
def evidence(painpoint_id: int, db: Session = Depends(get_db)):
    ev = get_evidence(db, painpoint_id)
    if not ev:
        raise HTTPException(status_code=404, detail='Pain point not found')
    return ev


@router.get('/metrics/trend')
def metrics_trend(
    days: int = Query(default=7, ge=7, le=30),
    source: str = Query(default='all', pattern='^(all|reddit|github)$'),
    db: Session = Depends(get_db),
):
    s = None if source == 'all' else source
    return {'items': get_trend(db, days, source=s)}
