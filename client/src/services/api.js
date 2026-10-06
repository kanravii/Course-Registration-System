// Central place for ALL communication with the Express backend.
// Components never call fetch() directly; they import functions from here.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const TOKEN_KEY = 'crs_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// Error type that carries the HTTP status so screens can react to 401/403/404...
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    // fetch only throws when the network request itself fails
    throw new ApiError('Unable to reach the server. Is the backend running?', 0)
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // empty or non-JSON body
  }

  if (!response.ok) {
    // Expired/invalid token on a normal call: drop it and tell the app to log out
    if (response.status === 401 && path !== '/auth/login') {
      clearToken()
      window.dispatchEvent(new Event('auth:expired'))
    }
    throw new ApiError(data?.message || `Request failed (${response.status})`, response.status)
  }

  return data
}

// ---- Auth ----
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: { email, password } })

// ---- Users (admin) ----
export const getUsers = (role) =>
  request(`/users${role ? `?role=${encodeURIComponent(role)}` : ''}`)
export const createUser = (data) => request('/users', { method: 'POST', body: data })
export const updateUser = (id, data) => request(`/users/${id}`, { method: 'PATCH', body: data })
export const deleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' })

// ---- Offerings ----
export const getOfferings = (term) =>
  request(`/offerings${term ? `?term=${encodeURIComponent(term)}` : ''}`)
export const createOffering = (data) => request('/offerings', { method: 'POST', body: data })
export const updateOffering = (id, data) =>
  request(`/offerings/${id}`, { method: 'PATCH', body: data })
export const deleteOffering = (id) => request(`/offerings/${id}`, { method: 'DELETE' })

// ---- Courses (advisor, admin) ----
export const getCourses = () => request('/courses')

// ---- Instructors (advisor, admin) ----
export const getInstructors = () => request('/instructors')

// ---- Students (advisor) ----
export const getStudents = () => request('/students')
export const getStudentRegistrations = (id) => request(`/students/${id}/registrations`)
export const getStudentRecord = (id) => request(`/students/${id}/record`)
export const getStudentEligible = (id, term) =>
  request(`/students/${id}/eligible?term=${encodeURIComponent(term)}`)

// ---- Registrations (advisor) ----
export const createRegistration = (data) =>
  request('/registrations', { method: 'POST', body: data })
export const deleteRegistration = (id) => request(`/registrations/${id}`, { method: 'DELETE' })

// ---- Logged-in student ----
export const getMyRegistrations = () => request('/me/registrations')
export const getMyRecord = () => request('/me/record')