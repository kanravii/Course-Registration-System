import { useAuth } from '../context/AuthContext'

function Navbar({ title }) {
  const { user, logout } = useAuth()

  return (
    <header className="navbar">
      <strong>{title}</strong>
      <div className="navbar-right">
        <span>
          {user.name} ({user.role})
        </span>
        <button onClick={logout}>Log out</button>
      </div>
    </header>
  )
}

export default Navbar