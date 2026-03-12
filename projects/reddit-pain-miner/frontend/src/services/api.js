export const API_BASE = import.meta.env.VITE_API_BASE || '/pain-api'

function buildUrl(path) {
  return `${API_BASE}${path}`
}

async function getJson(path) {
  const res = await fetch(buildUrl(path))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function postJson(path, body = {}) {
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const api = {
  overview: (source = 'all') => getJson(`/metrics/overview?source=${encodeURIComponent(source)}`),
  top20: (category = '', days = 30, source = 'all') => getJson(`/painpoints/top20?category=${encodeURIComponent(category)}&days=${days}&source=${encodeURIComponent(source)}`),
  weekly: (source = 'all') => getJson(`/painpoints/new-weekly?source=${encodeURIComponent(source)}`),
  trend: (days = 7, source = 'all') => getJson(`/metrics/trend?days=${days}&source=${encodeURIComponent(source)}`),
  latestReport: () => getJson('/reports/daily/latest'),
  evidence: (id) => getJson(`/evidence/${id}`),
  evidenceUrl: (id) => buildUrl(`/evidence/${id}`),
  reportFileUrl: (date, type) => buildUrl(`/reports/daily/file?date=${encodeURIComponent(date)}&type=${encodeURIComponent(type)}`),

  getRedditConfig: () => getJson('/admin/config/reddit'),
  saveRedditConfig: (payload) => postJson('/admin/config/reddit', payload),
  testReddit: () => postJson('/admin/reddit/test'),
  ingestReddit: (limit, sync = false) => postJson('/admin/reddit/ingest', { limit, sync }),

  getGithubConfig: () => getJson('/admin/config/github'),
  saveGithubConfig: (payload) => postJson('/admin/config/github', payload),
  testGithub: () => postJson('/admin/github/test'),
  ingestGithub: (limit, sync = false) => postJson('/admin/github/ingest', { limit, sync }),
  getJob: (jobId) => getJson(`/admin/jobs/${encodeURIComponent(jobId)}`),
  latestJob: (source) => getJson(`/admin/jobs/latest${source ? `?source=${encodeURIComponent(source)}` : ''}`),

  generateReport: () => postJson('/admin/reports/generate'),
}
