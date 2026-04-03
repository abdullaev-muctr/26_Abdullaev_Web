import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/posts', label: 'Посты' },
  { to: '/users', label: 'Пользователи' },
  { to: '/products', label: 'Товары' }
] as const

export default function NavBar() {
  return (
    <header>
      <nav>
        <div className="logo">API Dashboard</div>
        <ul>
          {TABS.map(tab => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
