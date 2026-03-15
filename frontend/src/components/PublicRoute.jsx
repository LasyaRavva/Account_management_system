import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const PublicRoute = () => {
  const { isAuthenticated, isReady } = useAuth()

  if (!isReady) {
    return <div className="page-state">Preparing your workspace...</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default PublicRoute
