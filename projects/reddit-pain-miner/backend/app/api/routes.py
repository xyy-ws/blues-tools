from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.metrics_service import get_evidence, get_latest_report, get_new_weekly, get_overview, get_top20, get_trend

router = APIRouter()


@router.get('/metrics/overview')
def metrics_overview(db: Session = Depends(get_db)):
    return get_overview(db)


@router.get('/painpoints/top20')
def painpoints_top20(
    category: str | None = Query(default=None),
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
):
    return {'items': get_top20(db, category=category, days=days)}


@router.get('/painpoints/new-weekly')
def painpoints_new_weekly(db: Session = Depends(get_db)):
    return {'items': get_new_weekly(db)}


@router.get('/reports/daily/latest')
def reports_daily_latest(db: Session = Depends(get_db)):
    report = get_latest_report(db)
    if not report:
        raise HTTPException(status_code=404, detail='No report found')
    return report


@router.get('/evidence/{painpoint_id}')
def evidence(painpoint_id: int, db: Session = Depends(get_db)):
    ev = get_evidence(db, painpoint_id)
    if not ev:
        raise HTTPException(status_code=404, detail='Pain point not found')
    return ev


@router.get('/metrics/trend')
def metrics_trend(days: int = Query(default=7, ge=7, le=30), db: Session = Depends(get_db)):
    return {'items': get_trend(db, days)}
