import { useState } from 'react'
import ErrorMessage from './ErrorMessage'

const ROLES = ['student', 'advisor', 'admin']

// Used for both "Create user" (user = null) and "Edit user" (user = the row being edited).
// onSubmit must be an async function that throws if the save fails;
// the message is then shown inside the form.
function UserForm({ user, advisors, onSubmit, onCancel }) {
  const isEdit = Boolean(user)
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [role, setRole] = useState(user?.role ?? 'student')
  const [studentId, setStudentId] = useState(user?.studentId ?? '')
  const [advisorId, setAdvisorId] = useState(user?.advisorId ?? '')
  const [password, setPassword] = useState('')
  const [active, setActive] = useState(user?.active ?? true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const payload = { name: name.trim(), email: email.trim(), role }
    if (isEdit) payload.active = active
    if (role === 'student') {
      payload.studentId = studentId.trim()
      payload.advisorId = advisorId || null
    }
    if (password) payload.password = password // blank on edit = keep the current password

    try {
      await onSubmit(payload)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}

      <div className="form-field">
        <label htmlFor="user-name">Name</label>
        <input id="user-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="form-field">
        <label htmlFor="user-email">Email</label>
        <input
          id="user-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="user-role">Role</label>
        <select id="user-role" value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {role === 'student' && (
        <>
          <div className="form-field">
            <label htmlFor="user-student-id">Student ID</label>
            <input
              id="user-student-id"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="user-advisor">Advisor</label>
            <select
              id="user-advisor"
              value={advisorId}
              onChange={(e) => setAdvisorId(e.target.value)}
            >
              <option value="">No advisor</option>
              {advisors.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="form-field">
        <label htmlFor="user-password">
          Password{isEdit ? ' (leave blank to keep the current one)' : ''}
        </label>
        <input
          id="user-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEdit}
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      {isEdit && (
        <div className="form-field form-field-inline">
          <input
            id="user-active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          <label htmlFor="user-active">Account is active</label>
        </div>
      )}

      <div className="button-row">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default UserForm