import { Link } from 'react-router-dom'

const STYLES = [{ id: 'blues', label: '布鲁斯 / Blues', status: '可用 / Available', to: '/blues/home' }]

export function HomePage() {
  return (
    <section className="page">
      <h1>首页 / Home</h1>
      <p className="muted">选择风格开始练习。当前仅提供布鲁斯风格。</p>

      <div className="card">
        <div className="card-title-row">
          <h2>风格 / Styles</h2>
          <span className="badge info">1 style</span>
        </div>
        <ul className="list" aria-label="Style list">
          {STYLES.map((style) => (
            <li key={style.id} className="list-item">
              <div className="card-title-row">
                <strong>
                  <Link to={style.to}>{style.label}</Link>
                </strong>
                <span className="badge success">{style.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
