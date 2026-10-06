import { useCallback, useState } from 'react'
import AcademicRecord from './AcademicRecord'
import ConfirmDialog from './ConfirmDialog'
import DataSection from './DataSection'
import DataTable from './DataTable'
import EligibleCourses from './EligibleCourses'
import ErrorMessage from './ErrorMessage'
import ScheduleLines from './ScheduleLines'
import { useApiData } from '../hooks/useApiData'
import { CURRENT_TERM } from '../config'
import { roomsText } from '../utils/format'
import {
  createRegistration,
  deleteRegistration,
  getStudentEligible,
  getStudentRecord,
  getStudentRegistrations,
} from '../services/api'

const regLabel = (r) => `${r.offering?.course?.code ?? 'Course'} Section ${r.offering?.section ?? ''}`.trim()

// Everything the advisor needs for ONE selected student: current registrations,
// the rules engine's verdict on every course, and the academic record.
function StudentWorkspace({ student }) {
  const studentId = student._id

  // useCallback keeps these functions stable so useApiData does not refetch on every render
  const fetchRecord = useCallback(() => getStudentRecord(studentId), [studentId])
  const fetchRegistrations = useCallback(() => getStudentRegistrations(studentId), [studentId])
  const fetchEligible = useCallback(() => getStudentEligible(studentId, CURRENT_TERM), [studentId])

  const recordState = useApiData(fetchRecord)
  const registrationState = useApiData(fetchRegistrations)
  const eligibleState = useApiData(fetchEligible)

  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState(null) // offering currently being registered
  const [removeTarget, setRemoveTarget] = useState(null)

  // A registration changes seat counts and clashes, so refresh both lists
  function refreshLists() {
    registrationState.reload()
    eligibleState.reload()
  }

  async function handleRegister(o) {
    setNotice('')
    setActionError('')
    setBusyId(o.offeringId)
    try {
      await createRegistration({ student: studentId, offering: o.offeringId, term: CURRENT_TERM })
      setNotice(`Registered ${student.name} in ${o.courseCode} Section ${o.section}.`)
      refreshLists()
    } catch (err) {
      setActionError(err.message)
      eligibleState.reload() // the list may be out of date (e.g. the last seat just went)
    } finally {
      setBusyId(null)
    }
  }

  function askRemove(r) {
    setNotice('')
    setActionError('')
    setRemoveTarget(r)
  }

  // Errors thrown here are shown inside the confirm dialog
  async function handleRemove() {
    await deleteRegistration(removeTarget._id)
    setNotice(`Removed ${regLabel(removeTarget)} from ${student.name}'s registrations.`)
    setRemoveTarget(null)
    refreshLists()
  }

  const registrationColumns = [
    { header: 'Code', render: (r) => r.offering?.course?.code ?? '-' },
    { header: 'Title', render: (r) => r.offering?.course?.title ?? '-' },
    { header: 'Section', render: (r) => r.offering?.section ?? '-' },
    { header: 'Day / Time', render: (r) => <ScheduleLines schedule={r.offering?.schedule} /> },
    { header: 'Room', render: (r) => roomsText(r.offering?.schedule) },
    {
      header: 'Status',
      render: (r) => (r.status === 'registered' ? 'Registered' : 'Requested (pending approval)'),
    },
    {
      header: 'Action',
      render: (r) => (
        <button className="danger" onClick={() => askRemove(r)}>
          Remove
        </button>
      ),
    },
  ]

  return (
    <div>
      <h2>{student.name}</h2>
      <p className="form-hint">
        Student ID {student.studentId}
        {student.program ? ` | ${student.program}` : ''}
        {student.yearLevel ? ` | Year ${student.yearLevel}` : ''}
      </p>

      {notice && (
        <div className="success-message" role="status">
          {notice}
        </div>
      )}
      {actionError && <ErrorMessage message={actionError} />}

      <DataSection
        title={`Current registrations (${CURRENT_TERM})`}
        state={registrationState}
        loadingText="Loading registrations..."
        errorText="Unable to load registrations."
      >
        {(registrations) => (
          <DataTable
            columns={registrationColumns}
            rows={registrations.filter((r) => r.offering?.term === CURRENT_TERM)}
            getRowKey={(r) => r._id}
            emptyMessage="No registrations for this term yet."
          />
        )}
      </DataSection>

      <DataSection
        title={`Available courses (${CURRENT_TERM})`}
        state={eligibleState}
        loadingText="Loading eligible courses..."
        errorText="Unable to load eligible courses."
      >
        {(offerings) => (
          <>
            <p className="form-hint">
              Courses this student cannot take stay in the list, greyed out, with the reason.
            </p>
            <EligibleCourses offerings={offerings} busyId={busyId} onRegister={handleRegister} />
          </>
        )}
      </DataSection>

      <DataSection
        title="Academic record"
        state={recordState}
        loadingText="Loading academic record..."
        errorText="Unable to load the academic record."
      >
        {(record) => <AcademicRecord record={record} />}
      </DataSection>

      {removeTarget && (
        <ConfirmDialog
          title="Remove registration"
          message={`Remove ${regLabel(removeTarget)} from ${student.name}'s registrations?`}
          confirmLabel="Remove"
          onConfirm={handleRemove}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  )
}

export default StudentWorkspace