import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function ReportPage() {
  const [report, setReport] = useState(null)

  useEffect(() => {
    api.latestReport().then(setReport).catch(() => setReport(null))
  }, [])

  if (!report) return <div>No report yet. Run backend report generation.</div>

  return (
    <div>
      <h2>Daily Report: {report.date}</h2>
      <ul>
        <li>Markdown: <code>{report.markdown_path}</code></li>
        <li>JSON: <code>{report.json_path}</code></li>
      </ul>
    </div>
  )
}
