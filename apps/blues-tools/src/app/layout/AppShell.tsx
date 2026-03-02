import { NavLink, Outlet, useLocation } from 'react-router-dom'

const topLevelNavItems = [
  { to: '/', label: '全局首页', end: true },
  { to: '/home', label: '布鲁斯主页', end: true },
]

const bluesToolNavItems = [
  { to: '/backing', label: '伴奏' },
  { to: '/chord-fretboard', label: '和弦与指板' },
  { to: '/improv', label: '即兴' },
  { to: '/knowledge', label: '乐句库' },
  { to: '/substyles', label: '子风格库' },
]

export function AppShell() {
  const location = useLocation()
  const onGlobalHome = location.pathname === '/'

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">🎸 布鲁斯练习工具</div>
          <nav aria-label="站点导航" className="header-nav-stack">
            <ul className="nav-list nav-list-primary">
              {topLevelNavItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    className={({ isActive }) => `nav-link nav-link-level${isActive ? ' active' : ''}`}
                    to={item.to}
                    end={item.end}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <ul className="nav-list nav-list-secondary" aria-label="布鲁斯功能导航">
              {bluesToolNavItems.map((item) => (
                <li key={item.to}>
                  <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to={item.to}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="app-header-inner app-header-subrow">
          <span className={`badge ${onGlobalHome ? 'info' : 'success'}`}>{onGlobalHome ? '第 1 层：全局入口' : '第 2 层：布鲁斯工具'}</span>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="app-footer-inner muted">围绕 12 小节 · 练习优先 · 打开即用</div>
      </footer>
    </div>
  )
}
