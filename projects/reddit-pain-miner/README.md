# Reddit Pain Miner (Local MVP)

End-to-end local MVP for mining Reddit pain points with FastAPI backend + React frontend.

## Project Structure
- `backend/` FastAPI, SQLite, pipeline, collector, report generation
- `frontend/` React dashboard/report UI
- `data/` SQLite DB
- `reports/` generated daily reports

## Quick Start

### 1) Backend setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
PYTHONPATH=. python scripts/init_db.py
PYTHONPATH=. python scripts/seed_mock.py
PYTHONPATH=. uvicorn app.main:app --reload --port 8000
```

### 2) Frontend setup
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://127.0.0.1:5173
Backend: http://127.0.0.1:8000

## API Endpoints
- `GET /metrics/overview`
- `GET /painpoints/top20`
- `GET /painpoints/new-weekly`
- `GET /reports/daily/latest`
- `GET /evidence/{painpoint_id}`
- `GET /metrics/trend?days=7|30`

## Tests (exact sequence)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
PYTHONPATH=. pytest -q tests
```

## Notes
- Collector uses PRAW when credentials are provided.
- `MOCK_MODE=true` allows full demo without Reddit API keys.
