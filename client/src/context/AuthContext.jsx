import { createContext, useContext, useEffect, useState } from 'react'
import * as api from '../services/api'

const AuthContext = createContext(null)
const USER_KEY = 'crs_user'

// Restore the session after a page refresh
function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw && api.getToken() ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)

  // api.js fires this event when the server answers 401 to a logged-in request
  useEffect(() => {
    const handleExpired = () => {
      localStorage.removeItem(USER_KEY)
      setUser(null)
    }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  async function login(email, password) {
    const data = await api.login(email, password)
    api.setToken(data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  function logout() {
    api.clearToken()
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}