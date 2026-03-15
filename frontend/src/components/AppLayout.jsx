import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { formatCurrency } from '../utils/formatters.js'

const AppLayout = () => {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Account Management System</p>
          <h1 className="topbar-title">Move money with a clear audit trail</h1>
        </div>
        <div className="topbar-actions">
          <div className="balance-pill">
            <span>Available balance</span>
            <strong>{formatCurrency(user?.balance)}</strong>
          </div>
          <button type="button" className="ghost-button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <nav className="nav-tabs" aria-label="Primary navigation">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/send-money"
          className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
        >
          Send Money
        </NavLink>
        <NavLink
          to="/statement"
          className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
        >
          Account Statement
        </NavLink>
      </nav>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
