import { NavLink, Outlet, useLocation } from 'react-router-dom'

const topLevelNavItems = [
  { to: '/', label: '全局首页 Global Home', end: true },
  { to: '/home', label: '布鲁斯主页 Blues Dashboard', end: true },
]

const bluesToolNavItems = [
  { to: '/backing', label: '伴奏 Backing' },
  { to: '/chord-fretboard', label: '和弦+指板 Chord+Fretboard' },
  { to: '/improv', label: '即兴 Improv' },
  { to: '/knowledge', label: '乐句库 Knowledge' },
  { to: '/substyles', label: '子风格库 Substyles' },
]

export function AppShell() {
  const location = useLocation()
  const onGlobalHome = location.pathname === '/'

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">🎸 Blues Tools</div>
          <nav aria-label="Information architecture" className="header-nav-stack">
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
            <ul className="nav-list nav-list-secondary" aria-label="Blues tool navigation">
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
          <span className={`badge ${onGlobalHome ? 'info' : 'success'}`}>
            {onGlobalHome ? 'Level 1 / 全局风格层' : 'Level 2 / Blues 工具层'}
          </span>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="app-footer-inner muted">Practice time · 12-bar aware · built for quick blues sessions</div>
      </footer>
    </div>
  )
}
