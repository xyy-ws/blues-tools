import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/backing', label: 'Backing' },
  { to: '/fretboard', label: 'Fretboard' },
  { to: '/improv', label: 'Improv' },
  { to: '/chords', label: 'Chords' },
  { to: '/knowledge', label: 'Knowledge' },
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
