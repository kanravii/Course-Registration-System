import { useState } from 'react'
import Navbar from '../components/Navbar'
import DataTable from '../components/DataTable'
import LoadingMessage from '../components/LoadingMessage'
import ErrorMessage from '../components/ErrorMessage'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import UserForm from '../components/UserForm'
import { useAuth } from '../context/AuthContext'
import { useApiData } from '../hooks/useApiData'
import { getUsers, createUser, updateUser, deleteUser } from '../services/api'

function AdminDashboard() {
  const { user: currentUser, logout } = useAuth()
  const { data: users, error, reload } = useApiData(getUsers)

  const [roleFilter, setRoleFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null) // null while creating a new user
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [notice, setNotice] = useState('')

  // login returns `id`, the users list returns `_id`, so compare those two
  const isSelf = (u) => u._id === currentUser.id

  function openCreate() {
    setNotice('')
    setEditingUser(null)
    setShowForm(true)
  }

  function openEdit(u) {
    setNotice('')
    setEditingUser(u)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingUser(null)
  }

  function askDelete(u) {
    setNotice('')
    setDeleteTarget(u)
  }

  // Errors thrown here (duplicate email, last admin, ...) are shown inside the form by UserForm
  async function handleSave(payload) {
    if (editingUser) {
      await updateUser(editingUser._id, payload)
      setNotice(`Updated ${payload.name}.`)
    } else {
      await createUser(payload)
      setNotice(`Created ${payload.name}.`)
    }

    // If admins just removed their own admin access, their session is no longer valid
    const lostAccess =
      Boolean(editingUser) &&
      isSelf(editingUser) &&
      (payload.role !== 'admin' || payload.active === false)

    closeForm()
    if (lostAccess) {
      logout()
      return
    }
    reload()
  }

  // Errors thrown here are shown inside the confirm dialog by ConfirmDialog
  async function handleDelete() {
    await deleteUser(deleteTarget._id)
    setNotice(`Deleted ${deleteTarget.name}.`)
    setDeleteTarget(null)
    reload()
  }

  const userById = users ? Object.fromEntries(users.map((u) => [u._id, u])) : {}
  const advisors = users ? users.filter((u) => u.role === 'advisor') : []
  const visibleUsers = users
    ? users.filter((u) => roleFilter === 'all' || u.role === roleFilter)
    : []

  const columns = [
    { header: 'Name', render: (u) => u.name },
    { header: 'Email', render: (u) => u.email },
    { header: 'Role', render: (u) => u.role },
    { header: 'ID', render: (u) => u.studentId || u.employeeId || '-' },
    { header: 'Advisor', render: (u) => userById[u.advisorId]?.name || '-' },
    { header: 'Status', render: (u) => (u.active ? 'Active' : 'Inactive') },
    {
      header: 'Actions',
      render: (u) => (
        <>
          <button onClick={() => openEdit(u)}>Edit</button>
          <button
            className="danger"
            onClick={() => askDelete(u)}
            disabled={isSelf(u)}
            title={isSelf(u) ? 'You cannot delete your own account' : undefined}
          >
            Delete
          </button>
        </>
      ),
    },
  ]

  let content
  if (error) {
    content = <ErrorMessage message={`Unable to load users. ${error.message}`} onRetry={reload} />
  } else if (!users) {
    content = <LoadingMessage text="Loading users..." />
  } else {
    content = (
      <>
        <div className="toolbar">
          <div>
            <label htmlFor="role-filter">Filter by role</label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="advisor">Advisor</option>
              <option value="student">Student</option>
            </select>
          </div>
          <button onClick={openCreate}>Create user</button>
        </div>
        <p className="form-hint">
          Showing {visibleUsers.length} of {users.length} users
        </p>
        <DataTable
          columns={columns}
          rows={visibleUsers}
          getRowKey={(u) => u._id}
          emptyMessage="No users match this filter."
        />
      </>
    )
  }

  return (
    <>
      <Navbar title="Admin Dashboard" />
      <main className="page">
        <h1>Manage Users</h1>

        {notice && (
          <div className="success-message" role="status">
            {notice}
          </div>
        )}

        {content}

        {showForm && (
          <Modal title={editingUser ? 'Edit user' : 'Create user'}>
            <UserForm
              user={editingUser}
              advisors={advisors}
              onSubmit={handleSave}
              onCancel={closeForm}
            />
          </Modal>
        )}

        {deleteTarget && (
          <ConfirmDialog
            title="Delete user"
            message={`Delete ${deleteTarget.name} (${deleteTarget.email})? This cannot be undone.`}
            confirmLabel="Delete"
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </main>
    </>
  )
}

export default AdminDashboard