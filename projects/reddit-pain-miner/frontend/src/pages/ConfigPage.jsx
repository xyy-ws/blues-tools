import { useEffect, useRef, useState } from 'react'
import { api } from '../services/api'
import ViewState from '../components/ViewState'

const initialReddit = {
  REDDIT_CLIENT_ID: '',
  REDDIT_CLIENT_SECRET: '',
  REDDIT_USER_AGENT: 'reddit-pain-miner/0.1',
  REDDIT_SUBREDDITS: 'Entrepreneur,SaaS,smallbusiness,startups',
  MOCK_MODE: true,
}

const initialGithub = {
  GITHUB_TOKEN: '',
  GITHUB_REPOS: '',
  GITHUB_ENABLED: false,
  GITHUB_LIMIT: 100,
}

const initialJob = { source: '', jobId: '', state: '', progress: 0, message: '', result: null, error: null }

export default function ConfigPage() {
  const [redditForm, setRedditForm] = useState(initialReddit)
  const [githubForm, setGithubForm] = useState(initialGithub)
  const [redditLimit, setRedditLimit] = useState(100)
  const [githubLimit, setGithubLimit] = useState(100)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [redditJob, setRedditJob] = useState(initialJob)
  const [githubJob, setGithubJob] = useState(initialJob)
  const pollsRef = useRef({})

  useEffect(() => {
    return () => {
      Object.values(pollsRef.current).forEach((timer) => clearInterval(timer))
    }
  }, [])

  useEffect(() => {
    Promise.all([api.getRedditConfig(), api.getGithubConfig()])
      .then(([redditRes, githubRes]) => {
        if (redditRes?.config) {
          const cfg = { ...initialReddit, ...redditRes.config, REDDIT_CLIENT_SECRET: '' }
          setRedditForm(cfg)
        }
        if (githubRes?.config) {
          const cfg = { ...initialGithub, ...githubRes.config, GITHUB_TOKEN: '' }
          setGithubForm(cfg)
          setGithubLimit(Number(cfg.GITHUB_LIMIT || 100))
        }
      })
      .catch((e) => setStatus(`Failed to load config: ${e.message}`))
  }, [])

  const runAction = async (label, action) => {
    setLoading(true)
    setStatus(`${label}...`)
    try {
      const res = await action()
      setStatus(`${label} OK: ${JSON.stringify(res.result || res.config || res)}`)
    } catch (e) {
      setStatus(`${label} failed: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const setJobForSource = (source, job) => {
    if (source === 'reddit') setRedditJob(job)
    if (source === 'github') setGithubJob(job)
  }

  const startPollingJob = (source, jobId) => {
    if (pollsRef.current[source]) clearInterval(pollsRef.current[source])

    const tick = async () => {
      try {
        const res = await api.getJob(jobId)
        const j = res?.job || {}
        const next = {
          source,
          jobId,
          state: j.state || 'queued',
          progress: Number(j.progress || 0),
          message: j.message || '',
          result: j.result || null,
          error: j.error || null,
        }
        setJobForSource(source, next)

        if (j.state === 'success' || j.state === 'failed') {
          clearInterval(pollsRef.current[source])
          delete pollsRef.current[source]
          setStatus(`${source.toUpperCase()} ingest ${j.state}: ${j.message}`)
        }
      } catch (e) {
        clearInterval(pollsRef.current[source])
        delete pollsRef.current[source]
        setStatus(`${source.toUpperCase()} ingest status failed: ${e.message}`)
      }
    }

    tick()
    pollsRef.current[source] = setInterval(tick, 1500)
  }

  const runIngest = async (source, limit) => {
    setStatus(`Starting ${source} ingest...`)
    setJobForSource(source, { ...initialJob, source, state: 'queued', progress: 0, message: 'Queued...' })
    try {
      const res = source === 'reddit' ? await api.ingestReddit(limit) : await api.ingestGithub(limit)
      if (!res?.job_id) throw new Error('Missing job_id from server')
      setJobForSource(source, { ...initialJob, source, jobId: res.job_id, state: 'queued', progress: 0, message: 'Queued...' })
      startPollingJob(source, res.job_id)
      setStatus(`${source.toUpperCase()} ingest enqueued: ${res.job_id}`)
    } catch (e) {
      setJobForSource(source, { ...initialJob, source, state: 'failed', progress: 0, message: `Failed: ${e.message}`, error: e.message })
      setStatus(`${source.toUpperCase()} ingest failed: ${e.message}`)
    }
  }

  const renderJob = (job, title) => {
    if (!job.jobId && !job.state) {
      return <ViewState type="empty" text={`No ${title} ingest job started.`} />
    }

    return (
      <div className="job-card">
        <div className="job-head">
          <strong>{title}</strong>
          <span className="muted">{job.jobId ? `job ${job.jobId.slice(0, 10)}…` : 'pending'}</span>
        </div>
        <div className="job-progress-track">
          <div className="job-progress-fill" style={{ width: `${Math.max(0, Math.min(100, job.progress))}%` }} />
        </div>
        <div className="small muted">{job.progress}% • {job.state || 'queued'}</div>
        <div className="state status-box">{job.message || 'Queued'}</div>
        {job.result ? <div className="small">Result: {JSON.stringify(job.result)}</div> : null}
        {job.error ? <div className="state error status-box">Error: {job.error}</div> : null}
      </div>
    )
  }

  return (
    <>
      <section className="panel">
        <h2>Source configuration</h2>
        <p className="muted">Configure Reddit and GitHub data sources, then run Test/Ingest independently.</p>
      </section>

      <section className="panel">
        <h3 className="section-title">Reddit</h3>
        <div className="form-grid">
          <label>Client ID</label>
          <input value={redditForm.REDDIT_CLIENT_ID} onChange={(e) => setRedditForm({ ...redditForm, REDDIT_CLIENT_ID: e.target.value })} />
          <label>Client Secret</label>
          <input type="password" autoComplete="new-password" placeholder="••••••••" value={redditForm.REDDIT_CLIENT_SECRET} onChange={(e) => setRedditForm({ ...redditForm, REDDIT_CLIENT_SECRET: e.target.value })} />
          <label>User Agent</label>
          <input value={redditForm.REDDIT_USER_AGENT} onChange={(e) => setRedditForm({ ...redditForm, REDDIT_USER_AGENT: e.target.value })} />
          <label>Subreddits</label>
          <input value={redditForm.REDDIT_SUBREDDITS} onChange={(e) => setRedditForm({ ...redditForm, REDDIT_SUBREDDITS: e.target.value })} />
          <label>Mock Mode</label>
          <input type="checkbox" checked={redditForm.MOCK_MODE} onChange={(e) => setRedditForm({ ...redditForm, MOCK_MODE: e.target.checked })} />
          <label>Ingest Limit</label>
          <input type="number" min="1" max="1000" value={redditLimit} onChange={(e) => setRedditLimit(Number(e.target.value || 1))} />
        </div>
        <div className="stack">
          <button disabled={loading} onClick={() => runAction('Save Reddit Config', () => api.saveRedditConfig(redditForm))}>Save Reddit Config</button>
          <button disabled={loading} onClick={() => runAction('Test Reddit', () => api.testReddit())}>Test Reddit</button>
          <button onClick={() => runIngest('reddit', redditLimit)}>Ingest Reddit</button>
        </div>
        {renderJob(redditJob, 'Reddit ingest')}
      </section>

      <section className="panel">
        <h3 className="section-title">GitHub</h3>
        <div className="form-grid">
          <label>Token</label>
          <input type="password" autoComplete="new-password" placeholder="ghp_••••••••" value={githubForm.GITHUB_TOKEN} onChange={(e) => setGithubForm({ ...githubForm, GITHUB_TOKEN: e.target.value })} />
          <label>Repos (owner/repo, comma separated)</label>
          <input value={githubForm.GITHUB_REPOS} onChange={(e) => setGithubForm({ ...githubForm, GITHUB_REPOS: e.target.value })} />
          <label>Enabled</label>
          <input type="checkbox" checked={githubForm.GITHUB_ENABLED} onChange={(e) => setGithubForm({ ...githubForm, GITHUB_ENABLED: e.target.checked })} />
          <label>Default Limit</label>
          <input type="number" min="1" max="1000" value={githubForm.GITHUB_LIMIT} onChange={(e) => setGithubForm({ ...githubForm, GITHUB_LIMIT: Number(e.target.value || 1) })} />
          <label>Ingest Limit</label>
          <input type="number" min="1" max="1000" value={githubLimit} onChange={(e) => setGithubLimit(Number(e.target.value || 1))} />
        </div>
        <div className="stack">
          <button disabled={loading} onClick={() => runAction('Save GitHub Config', () => api.saveGithubConfig(githubForm))}>Save GitHub Config</button>
          <button disabled={loading} onClick={() => runAction('Test GitHub', () => api.testGithub())}>Test GitHub</button>
          <button onClick={() => runIngest('github', githubLimit)}>Ingest GitHub</button>
        </div>
        {renderJob(githubJob, 'GitHub ingest')}
      </section>

      <section className="panel">
        <h3 className="section-title">Global action</h3>
        <button className="btn-primary" disabled={loading} onClick={() => runAction('Generate Report', () => api.generateReport())}>Generate Report</button>
      </section>

      <section className="panel">
        <h3 className="section-title">Status</h3>
        {!status ? <ViewState type="empty" text="No action run yet." /> : <div className="state status-box">{loading ? 'Working…' : status}</div>}
      </section>
    </>
  )
}
