import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME } from '../utils/roles'

// Wraps a page: only a logged-in user with the matching role may see it.
// This is convenience only. The real protection is the backend's requireRole middleware.
function ProtectedRoute({ allowedRole, children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== allowedRole) return <Navigate to={ROLE_HOME[user.role]} replace />

  return children
}

export default ProtectedRoute