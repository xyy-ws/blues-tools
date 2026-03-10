from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from .classify import classify_category
from .clean import clean_text
from .cluster import cluster_theme
from .filter import is_noise
from .sentiment import sentiment_intensity


@dataclass
class PipelineOutput:
    text: str
    category: str
    sentiment: float
    intensity: float
    theme: str
    week: str
    date: date


def process_post(raw_text: str, dt: date) -> PipelineOutput:
    cleaned = clean_text(raw_text)
    if is_noise(cleaned):
        cleaned = ''
    category = classify_category(cleaned)
    sentiment, intensity = sentiment_intensity(cleaned)
    theme = cluster_theme(cleaned)
    week = f"{dt.isocalendar().year}-W{dt.isocalendar().week:02d}"
    return PipelineOutput(cleaned, category, sentiment, intensity, theme, week, dt)
