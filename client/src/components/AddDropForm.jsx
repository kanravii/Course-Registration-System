import { useState } from 'react'
import ErrorMessage from './ErrorMessage'

// Opens the add/drop window for one offering. The closing date is shown to students.
// onSubmit(closeDate) must be async and throw on failure.
function AddDropForm({ offering, onSubmit, onCancel }) {
  const [closeDate, setCloseDate] = useState(
  offering.registrationClosesAt ? offering.registrationClosesAt.slice(0, 10) : '',
  )
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await onSubmit(closeDate)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}
       <p>
        {offering.course?.code} Section {offering.section} will be set to Open and shown to
        students as open until the closing date.
      </p>
      <div className="form-field">
        <label htmlFor="close-date">Closing date</label>
        <input
          id="close-date"
          type="date"
          min={today}
          value={closeDate}
          onChange={(e) => setCloseDate(e.target.value)}
          required
        />
      </div>
      <div className="button-row">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Open window'}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default AddDropForm