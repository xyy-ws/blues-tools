import { Link } from 'react-router-dom'

const tools = [
  { to: '/backing', label: '伴奏' },
  { to: '/chord-fretboard', label: '和弦+指板' },
  { to: '/improv', label: '即兴' },
  { to: '/knowledge', label: '乐句库' },
  { to: '/substyles', label: '子风格库' },
]

export function BluesHomePage() {
  return (
    <section className="page">
      <h1>布鲁斯主页</h1>
      <p className="muted">二级导航：选择具体布鲁斯练习工具继续。</p>

      <div className="card">
        <div className="card-title-row">
          <h2>工具</h2>
          <span className="badge info">第 2 层 · {tools.length} 个工具</span>
        </div>
        <ul className="list" aria-label="布鲁斯工具列表">
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
