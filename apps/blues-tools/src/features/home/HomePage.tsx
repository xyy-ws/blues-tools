import { Link } from 'react-router-dom'

const STYLES = [{ id: 'blues', label: '布鲁斯', status: '可用', to: '/home' }]

export function HomePage() {
  return (
    <section className="page">
      <h1>首页</h1>
      <p className="muted">一级导航：先选风格，再进入风格内工具。当前仅提供布鲁斯风格。</p>

      <div className="card">
        <div className="card-title-row">
          <h2>风格</h2>
          <span className="badge info">第 1 层 · 1 个风格</span>
        </div>
        <ul className="list" aria-label="风格列表">
          {STYLES.map((style) => (
            <li key={style.id} className="list-item">
              <div className="card-title-row">
                <strong>
                  <Link to={style.to}>{style.label}</Link>
                </strong>
                <span className="badge success">{style.status}</span>
              </div>
              <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
                进入二级主页
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
