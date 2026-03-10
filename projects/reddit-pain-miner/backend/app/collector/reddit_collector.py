from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Iterable

import praw

from app.core.config import settings


@dataclass
class CollectedPost:
    source_id: str
    subreddit: str
    title: str
    body: str
    score: int
    created_at: datetime


MOCK_POSTS = [
    {
        'source_id': 'm1',
        'subreddit': 'SaaS',
        'title': 'Stripe pricing is killing my margins',
        'body': 'Transaction fees + subscriptions feel impossible for early stage.',
        'score': 42,
    },
    {
        'source_id': 'm2',
        'subreddit': 'Entrepreneur',
        'title': 'Onboarding process takes too long and users churn',
        'body': 'Our setup steps are too many and support tickets are exploding.',
        'score': 33,
    },
    {
        'source_id': 'm3',
        'subreddit': 'smallbusiness',
        'title': 'Feature broken after latest update',
        'body': 'Inventory sync keeps failing and this is frustrating.',
        'score': 28,
    },
]


def _mock_collect(limit: int = 100) -> list[CollectedPost]:
    now = datetime.now(tz=timezone.utc)
    return [
        CollectedPost(
            source_id=p['source_id'],
            subreddit=p['subreddit'],
            title=p['title'],
            body=p['body'],
            score=p['score'],
            created_at=now,
        )
        for p in MOCK_POSTS[:limit]
    ]


def _praw_collect(limit: int = 100) -> list[CollectedPost]:
    reddit = praw.Reddit(
        client_id=settings.reddit_client_id,
        client_secret=settings.reddit_client_secret,
        user_agent=settings.reddit_user_agent,
    )
    posts: list[CollectedPost] = []
    subreddits = settings.reddit_subreddits
    for submission in reddit.subreddit(subreddits).new(limit=limit):
        posts.append(
            CollectedPost(
                source_id=submission.id,
                subreddit=str(submission.subreddit),
                title=submission.title,
                body=submission.selftext or '',
                score=submission.score,
                created_at=datetime.fromtimestamp(submission.created_utc, tz=timezone.utc),
            )
        )
    return posts


def collect_posts(limit: int = 100) -> Iterable[CollectedPost]:
    has_creds = bool(settings.reddit_client_id and settings.reddit_client_secret)
    if settings.mock_mode or not has_creds:
        return _mock_collect(limit)
    return _praw_collect(limit)
