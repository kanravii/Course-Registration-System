import { useState } from 'react'
import ErrorMessage from './ErrorMessage'
import LoadingMessage from './LoadingMessage'
import { useApiData } from '../hooks/useApiData'
import { getCourses } from '../services/api'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STATUSES = ['draft', 'open', 'closed', 'cancelled']
const EMPTY_SLOT = { day: 'Mon', startTime: '', endTime: '', room: '' }

// Dates arrive as ISO strings; <input type="date"> wants YYYY-MM-DD
const toDateInput = (value) => (value ? value.slice(0, 10) : '')

// Loads the course catalog and shows it as a dropdown (only used when creating)
function CourseSelect({ value, onChange }) {
  const { data: courses, error, reload } = useApiData(getCourses)

  if (error) {
    return <ErrorMessage message={`Unable to load courses. ${error.message}`} onRetry={reload} />
  }
  if (!courses) return <LoadingMessage text="Loading courses..." />

  return (
    <select id="offering-course" value={value} onChange={(e) => onChange(e.target.value)} required>
      <option value="">Select a course</option>
      {courses.map((c) => (
        <option key={c._id} value={c._id}>
          {c.code} - {c.title}
        </option>
      ))}
    </select>
  )
}

// Used for both "Create offering" (offering = null) and "Edit offering".
// onSubmit must be an async function that throws if the save fails.
function OfferingForm({ offering, term, instructors, onSubmit, onCancel }) {
  const isEdit = Boolean(offering)
  const [course, setCourse] = useState('')
  const [section, setSection] = useState(offering?.section ?? '')
  const [instructor, setInstructor] = useState(offering?.instructor?._id ?? '')
  const [capacity, setCapacity] = useState(offering?.capacity ?? 30)
  const [status, setStatus] = useState(offering?.status ?? 'draft')
  const [opensAt, setOpensAt] = useState(toDateInput(offering?.registrationOpensAt))
  const [closesAt, setClosesAt] = useState(toDateInput(offering?.registrationClosesAt))
  const [schedule, setSchedule] = useState(
    offering?.schedule?.length ? offering.schedule.map((s) => ({ ...s })) : [{ ...EMPTY_SLOT }],
  )
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateSlot(index, field, value) {
    setSchedule((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  function addSlot() {
    setSchedule((prev) => [...prev, { ...EMPTY_SLOT }])
  }

  function removeSlot(index) {
    setSchedule((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!isEdit && !course) {
      setError('Please select a course. If the course list did not load, close this form and try again.')
      return
    }

    // "HH:MM" strings compare correctly as text
    for (let i = 0; i < schedule.length; i++) {
      if (schedule[i].endTime <= schedule[i].startTime) {
        setError(`Meeting ${i + 1}: end time must be after start time.`)
        return
      }
    }

    if (closesAt <= opensAt) {
      setError('Registration must close after it opens.')
      return
    }

    setSubmitting(true)
    const payload = {
      section: section.trim(),
      instructor,
      capacity: Number(capacity),
      status,
      registrationOpensAt: opensAt,
      registrationClosesAt: closesAt,
      schedule: schedule.map((s) => ({ ...s, room: s.room.trim() })),
    }
    if (!isEdit) {
      payload.course = course
      payload.term = term
    }

    try {
      await onSubmit(payload)
    } catch (err) {
      setError(
        err.status === 409
          ? 'That section already exists for this course in this term.'
          : err.message,
      )
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}

      <p className="form-hint">Term {term}</p>

      {isEdit ? (
        <p>
          Course: {offering.course?.code} - {offering.course?.title}
        </p>
      ) : (
        <div className="form-field">
          <label htmlFor="offering-course">Course</label>
          <CourseSelect value={course} onChange={setCourse} />
        </div>
      )}

      <div className="form-field">
        <label htmlFor="offering-section">Section</label>
        <input
          id="offering-section"
          value={section}
          maxLength={10}
          onChange={(e) => setSection(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="offering-instructor">Instructor</label>
        <select
          id="offering-instructor"
          value={instructor}
          onChange={(e) => setInstructor(e.target.value)}
          required
        >
          <option value="">Select an instructor</option>
          {instructors.map((i) => (
            <option key={i._id} value={i._id}>
              {i.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="offering-capacity">Seats (capacity)</label>
        <input
          id="offering-capacity"
          type="number"
          min={isEdit ? Math.max(1, offering.enrolledCount) : 1}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          required
        />
        {isEdit && <span className="form-hint">Seats already taken: {offering.enrolledCount}</span>}
      </div>

      <fieldset>
        <legend>Meeting times</legend>
        {schedule.map((slot, i) => (
          <div className="slot-row" key={i}>
            <select
              aria-label={`Meeting ${i + 1} day`}
              value={slot.day}
              onChange={(e) => updateSlot(i, 'day', e.target.value)}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              type="time"
              aria-label={`Meeting ${i + 1} start time`}
              value={slot.startTime}
              onChange={(e) => updateSlot(i, 'startTime', e.target.value)}
              required
            />
            <input
              type="time"
              aria-label={`Meeting ${i + 1} end time`}
              value={slot.endTime}
              onChange={(e) => updateSlot(i, 'endTime', e.target.value)}
              required
            />
            <input
              aria-label={`Meeting ${i + 1} room`}
              placeholder="Room"
              value={slot.room}
              onChange={(e) => updateSlot(i, 'room', e.target.value)}
              required
            />
            <button type="button" onClick={() => removeSlot(i)} disabled={schedule.length === 1}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addSlot}>
          Add another meeting time
        </button>
      </fieldset>

      <div className="form-field">
        <label htmlFor="offering-opens">Registration opens</label>
        <input
          id="offering-opens"
          type="date"
          value={opensAt}
          onChange={(e) => setOpensAt(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="offering-closes">Registration closes</label>
        <input
          id="offering-closes"
          type="date"
          value={closesAt}
          onChange={(e) => setClosesAt(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="offering-status">Status</label>
        <select id="offering-status" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="form-hint">Only "open" sections can be registered for.</span>
      </div>

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

export default OfferingForm