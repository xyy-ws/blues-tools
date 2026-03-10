from app.db.database import SessionLocal
from app.db.init_db import init_db
from app.services.ingest_service import ingest
from app.services.report_service import generate_daily_report

if __name__ == '__main__':
    init_db()
    db = SessionLocal()
    count = ingest(limit=50, db=db)
    report = generate_daily_report(db)
    db.close()
    print({'inserted': count, 'report': report})
