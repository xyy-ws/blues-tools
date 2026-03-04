# Info Push App MVP Plan (Task 2)

## Product target
Build Web + Android app that delivers AI updates via:
- System push notifications
- In-app message center

## Confirmed constraints
- Topic: AI
- Source mode: keyword + designated source hybrid
- Push windows: 09:00 / 20:00 (local timezone)
- Code + docs synced to GitHub

## M1 deliverables (this commit)
- Project scaffold under `apps/info-push`
- API contract draft
- Minimal runnable API endpoints

## API contract (draft)
- `GET /health`
- `GET /v1/feed?topic=ai`
- `GET /v1/messages`
- `POST /v1/preferences`
- `POST /v1/push/trigger`

## Next
- Add ingestion workers (RSS/API first, lightweight crawler fallback)
- Add dedupe/ranking pipeline
- Wire web message center UI + Android client skeleton
