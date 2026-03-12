from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from threading import Lock
from typing import Any, Callable
from uuid import uuid4


JobState = str
JobRunner = Callable[[Callable[[int, str], None]], Any]


@dataclass
class JobRecord:
    job_id: str
    source: str
    state: JobState = 'queued'
    progress: int = 0
    message: str = 'Queued'
    result: Any = None
    error: str | None = None
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class JobManager:
    def __init__(self, max_workers: int = 2):
        self._jobs: dict[str, JobRecord] = {}
        self._latest_by_source: dict[str, str] = {}
        self._lock = Lock()
        self._executor = ThreadPoolExecutor(max_workers=max_workers, thread_name_prefix='ingest-job')

    def submit(self, source: str, runner: JobRunner) -> JobRecord:
        job_id = uuid4().hex
        rec = JobRecord(job_id=job_id, source=source)
        with self._lock:
            self._jobs[job_id] = rec
            self._latest_by_source[source] = job_id

        self._executor.submit(self._run, job_id, runner)
        return rec

    def _run(self, job_id: str, runner: JobRunner) -> None:
        self._update(job_id, state='running', progress=3, message='Started')

        def progress_cb(progress: int, message: str) -> None:
            self._update(job_id, progress=progress, message=message)

        try:
            result = runner(progress_cb)
            self._update(job_id, state='success', progress=100, message='Completed', result=result)
        except Exception as exc:  # noqa: BLE001
            self._update(job_id, state='failed', message=f'Failed: {exc}', error=str(exc))

    def _update(self, job_id: str, **kwargs) -> None:
        with self._lock:
            rec = self._jobs[job_id]
            for k, v in kwargs.items():
                setattr(rec, k, v)
            rec.updated_at = datetime.now(timezone.utc).isoformat()

    def get(self, job_id: str) -> JobRecord | None:
        with self._lock:
            rec = self._jobs.get(job_id)
            if rec is None:
                return None
            return JobRecord(**asdict(rec))

    def latest(self, source: str | None = None) -> JobRecord | None:
        with self._lock:
            if source:
                jid = self._latest_by_source.get(source)
                rec = self._jobs.get(jid) if jid else None
                return JobRecord(**asdict(rec)) if rec else None
            if not self._jobs:
                return None
            rec = max(self._jobs.values(), key=lambda j: j.updated_at)
            return JobRecord(**asdict(rec))


job_manager = JobManager()
