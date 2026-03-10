const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

async function getJson(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const api = {
  overview: () => getJson('/metrics/overview'),
  top20: (category = '', days = 30) => getJson(`/painpoints/top20?category=${category}&days=${days}`),
  weekly: () => getJson('/painpoints/new-weekly'),
  trend: (days = 7) => getJson(`/metrics/trend?days=${days}`),
  latestReport: () => getJson('/reports/daily/latest'),
  evidence: (id) => getJson(`/evidence/${id}`)
}
