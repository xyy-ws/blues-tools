import { Link } from 'react-router-dom'

const tools = [
  { to: '/backing', label: '伴奏 / Backing' },
  { to: '/chord-fretboard', label: '和弦+指板 / Chord + Fretboard' },
  { to: '/improv', label: '即兴 / Improv' },
  { to: '/knowledge', label: '乐句库 / Knowledge' },
]

export function BluesHomePage() {
  return (
    <section className="page">
      <h1>布鲁斯主页 / Blues Home</h1>
      <p className="muted">选择布鲁斯练习工具继续。</p>

      <div className="card">
        <div className="card-title-row">
          <h2>工具 / Tools</h2>
          <span className="badge info">{tools.length} tools</span>
        </div>
        <ul className="list" aria-label="Blues tool list">
          {tools.map((tool) => (
            <li key={tool.to} className="list-item">
              <Link to={tool.to}>{tool.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
