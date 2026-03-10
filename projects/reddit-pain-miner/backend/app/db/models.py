from sqlalchemy import Column, Date, DateTime, Float, Integer, String, Text
from sqlalchemy.sql import func

from app.db.database import Base


class RawPost(Base):
    __tablename__ = 'raw_posts'

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(String(64), unique=True, index=True, nullable=False)
    subreddit = Column(String(128), index=True, nullable=False)
    title = Column(Text, nullable=False)
    body = Column(Text, nullable=True)
    score = Column(Integer, default=0)
    created_at = Column(DateTime, nullable=False)
    inserted_at = Column(DateTime, server_default=func.now())


class PainPoint(Base):
    __tablename__ = 'pain_points'

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(String(64), index=True, nullable=False)
    text = Column(Text, nullable=False)
    category = Column(String(32), index=True, nullable=False)
    sentiment = Column(Float, nullable=False)
    intensity = Column(Float, nullable=False)
    theme = Column(String(64), index=True, nullable=False)
    week = Column(String(16), index=True, nullable=False)
    date = Column(Date, index=True, nullable=False)


class DailyReport(Base):
    __tablename__ = 'daily_reports'

    id = Column(Integer, primary_key=True, index=True)
    report_date = Column(Date, unique=True, index=True)
    markdown_path = Column(String(255), nullable=False)
    json_path = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
