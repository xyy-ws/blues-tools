from app.db.database import SessionLocal
from app.services.report_service import generate_daily_report

if __name__ == '__main__':
    db = SessionLocal()
    report = generate_daily_report(db)
    db.close()
    print(report)
