import ErrorMessage from './ErrorMessage'
import LoadingMessage from './LoadingMessage'
import { formatDate, isAddDropOpen } from '../utils/format'

function StudentAddDropPanel({ offeringsState, registrationState, term, onRequest }) {
  if (offeringsState.error) {
    return (
      <ErrorMessage
        message={`Unable to load add/drop windows. ${offeringsState.error.message}`}
        onRetry={offeringsState.reload}
      />
    )
  }

  if (registrationState.error) {
    return (
      <ErrorMessage
        message={`Unable to load your registered courses. ${registrationState.error.message}`}
        onRetry={registrationState.reload}
      />
    )
  }

  if (!offeringsState.data || !registrationState.data) {
    return <LoadingMessage text="Loading add/drop options..." />
  }

  const currentRegistrations = registrationState.data.filter(
    (registration) =>
      registration.status === 'registered' && registration.offering?.term === term,
  )

  return (
    <div className="add-drop-panel">
      <p>
        Add/drop requests are submitted as paperwork. Choose a registered course with an open
        window, download the form, and email it to your advisor.
      </p>

      {currentRegistrations.length === 0 ? (
        <p className="empty-message">
          You have no registered courses in {term}. Add/drop requests are only available for your
          current-term registrations.
        </p>
      ) : (
        <div className="add-drop-list">
          {currentRegistrations.map((registration) => {
            const offering = registration.offering
            const open = isAddDropOpen(offering)
            const course = offering?.course
            return (
              <article className="add-drop-course" key={registration._id}>
                <div>
                  <strong>
                    {course?.code ?? 'Course'} Section {offering?.section ?? '-'}
                  </strong>
                  <div className="form-hint">{course?.title ?? 'Course details unavailable'}</div>
                  <div className={open ? 'add-drop-open' : 'add-drop-closed'}>
                    {open
                      ? `Open until ${formatDate(offering.registrationClosesAt)}`
                      : 'Add/drop closed'}
                  </div>
                </div>
                <button type="button" onClick={() => onRequest(registration)} disabled={!open}>
                  Request add/drop
                </button>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default StudentAddDropPanel
