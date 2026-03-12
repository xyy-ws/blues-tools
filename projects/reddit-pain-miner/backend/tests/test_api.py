import time
from pathlib import Path

from fastapi.testclient import TestClient

from app.api import routes
from app.core import config
from app.main import app

client = TestClient(app)


def test_health():
    resp = client.get('/health')
    assert resp.status_code == 200
    assert resp.json()['status'] == 'ok'


def _wait_for_job(job_id: str, timeout_s: float = 8.0):
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        resp = client.get(f'/admin/jobs/{job_id}')
        assert resp.status_code == 200
        job = resp.json()['job']
        if job['state'] in {'success', 'failed'}:
            return job
        time.sleep(0.1)
    raise AssertionError(f'job {job_id} did not finish in time')


def test_admin_reddit_and_github_endpoints_happy_path(tmp_path, monkeypatch):
    env_file = tmp_path / '.env'
    env_file.write_text('MOCK_MODE=true\nGITHUB_ENABLED=false\n', encoding='utf-8')

    monkeypatch.setattr(config, 'ENV_PATH', env_file)
    monkeypatch.setattr(routes, 'ENV_PATH', env_file)

    save_reddit = client.post(
        '/admin/config/reddit',
        json={
            'REDDIT_CLIENT_ID': 'cid',
            'REDDIT_CLIENT_SECRET': 'secret',
            'REDDIT_USER_AGENT': 'ua-test',
            'REDDIT_SUBREDDITS': 'SaaS,Entrepreneur',
            'MOCK_MODE': True,
        },
    )
    assert save_reddit.status_code == 200
    assert save_reddit.json()['status'] == 'ok'

    save_github = client.post(
        '/admin/config/github',
        json={
            'GITHUB_TOKEN': 'ghp_dummy',
            'GITHUB_REPOS': 'octocat/Hello-World',
            'GITHUB_ENABLED': False,
            'GITHUB_LIMIT': 10,
        },
    )
    assert save_github.status_code == 200
    assert save_github.json()['status'] == 'ok'
    env_text = env_file.read_text(encoding='utf-8')
    assert "REDDIT_CLIENT_ID='cid'" in env_text
    assert "GITHUB_REPOS='octocat/Hello-World'" in env_text

    get_reddit = client.get('/admin/config/reddit')
    assert get_reddit.status_code == 200
    assert get_reddit.json()['config']['MOCK_MODE'] is True

    get_github = client.get('/admin/config/github')
    assert get_github.status_code == 200
    assert get_github.json()['config']['GITHUB_LIMIT'] == 10

    test_reddit = client.post('/admin/reddit/test')
    assert test_reddit.status_code == 200
    assert test_reddit.json()['status'] == 'ok'

    test_github = client.post('/admin/github/test')
    assert test_github.status_code == 200
    assert test_github.json()['status'] == 'ok'

    ingest_reddit = client.post('/admin/reddit/ingest', json={'limit': 2})
    assert ingest_reddit.status_code == 200
    assert ingest_reddit.json()['status'] == 'ok'
    assert ingest_reddit.json()['job_id']
    reddit_job = _wait_for_job(ingest_reddit.json()['job_id'])
    assert reddit_job['source'] == 'reddit'
    assert reddit_job['state'] == 'success'
    assert reddit_job['result']['source'] == 'reddit'

    latest_reddit = client.get('/admin/jobs/latest?source=reddit')
    assert latest_reddit.status_code == 200
    assert latest_reddit.json()['job']['job_id'] == ingest_reddit.json()['job_id']

    ingest_github = client.post('/admin/github/ingest', json={'limit': 2})
    assert ingest_github.status_code == 200
    assert ingest_github.json()['status'] == 'ok'
    assert ingest_github.json()['job_id']
    github_job = _wait_for_job(ingest_github.json()['job_id'])
    assert github_job['source'] == 'github'
    assert github_job['state'] == 'success'
    assert github_job['result']['source'] == 'github'

    ingest_sync = client.post('/admin/reddit/ingest', json={'limit': 1, 'sync': True})
    assert ingest_sync.status_code == 200
    assert ingest_sync.json()['result']['source'] == 'reddit'

    top20_github = client.get('/painpoints/top20?source=github&days=30')
    assert top20_github.status_code == 200
    items = top20_github.json()['items']
    assert isinstance(items, list)
    if items:
        row = items[0]
        assert row['source'] == 'github'
        assert 'repo' in row
        assert 'issue_number' in row
        assert 'labels' in row
        assert 'state' in row
        assert 'summary' in row

        ev = client.get(f"/evidence/{row['id']}")
        assert ev.status_code == 200
        assert 'summary' in ev.json()

    report_resp = client.post('/admin/reports/generate')
    assert report_resp.status_code == 200
    report_json = report_resp.json()
    assert report_json['status'] == 'ok'
    assert Path(report_json['result']['json_path']).exists()
