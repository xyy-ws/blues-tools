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
    <div>
      <nav aria-label="Primary">
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to}>{item.label}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
