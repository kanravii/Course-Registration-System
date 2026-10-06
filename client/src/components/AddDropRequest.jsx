import Modal from './Modal'
import { ADD_DROP_FORM_URL } from '../config'

// Shows the paperwork steps for an add/drop request (the professor's instruction text, Section 7).
// `advisor` is { name, email } or null when the student has no advisor assigned.
function AddDropRequest({ studentId, courseCode, section, advisor, onClose }) {
  const subject = `Add/Drop Request - ${studentId} - ${courseCode}`
  const mailto = advisor?.email
    ? `mailto:${advisor.email}?subject=${encodeURIComponent(subject)}`
    : null

  return (
    <Modal title={`Request add/drop: ${courseCode} Section ${section}`}>
      <p>
        <a href={ADD_DROP_FORM_URL} download>
          Download the Add/Drop Request form
        </a>
      </p>

      <ol className="instructions">
        <li>Download and open the Add/Drop Request form.</li>
        <li>
          Fill in your student ID, name, term, and the course code and section you wish to add or
          drop.
        </li>
        <li>State the reason for the request and sign the form.</li>
        <li>
          Email the completed form as an attachment to your advisor at{' '}
          <strong>{advisor?.email ?? '(no advisor assigned)'}</strong>, using the subject line:
          <div className="subject-line">{subject}</div>
        </li>
        <li>Your advisor will confirm by email once the change is made.</li>
      </ol>

      {advisor ? (
        <p>
          Advisor: {advisor.name} ({advisor.email}) |{' '}
          <a href={mailto}>Open in my email app</a>
        </p>
      ) : (
        <p className="form-hint">
          No advisor is assigned to your account, so there is no email address to show. Please
          contact the administrator.
        </p>
      )}

      <div className="button-row">
        <button onClick={onClose}>Close</button>
      </div>
    </Modal>
  )
}

export default AddDropRequest