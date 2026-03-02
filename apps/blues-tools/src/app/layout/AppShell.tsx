import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/backing', label: '伴奏 Backing' },
  { to: '/fretboard', label: '指板 Fretboard' },
  { to: '/improv', label: '即兴 Improv' },
  { to: '/chords', label: '和弦 Chords' },
  { to: '/knowledge', label: '乐句库 Knowledge' },
]

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">🎸 Blues Tools</div>
          <nav aria-label="Primary">
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to={item.to}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
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
