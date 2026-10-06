import Navbar from '../components/Navbar'
import AcademicRecord from '../components/AcademicRecord'
import AddDropStatus from '../components/AddDropStatus'
import DataSection from '../components/DataSection'
import DataTable from '../components/DataTable'
import ScheduleLines from '../components/ScheduleLines'
import { useAuth } from '../context/AuthContext'
import { useApiData } from '../hooks/useApiData'
import { CURRENT_TERM } from '../config'
import { formatDate, roomsText } from '../utils/format'
import { getMe, getMyRecord, getMyRegistrations, getOfferings } from '../services/api'

// Declared outside the component so useApiData gets the same function every render
const fetchTermOfferings = () => getOfferings(CURRENT_TERM)

function StudentDashboard() {
  const { user } = useAuth()
  const profileState = useApiData(getMe)
  const registrationState = useApiData(getMyRegistrations)
  const offeringsState = useApiData(fetchTermOfferings)
  const recordState = useApiData(getMyRecord)

  // The registrations endpoint does not include the instructor's name,
  // so look it up from the term's offerings list.
  const instructorByOffering = {}
  for (const o of offeringsState.data ?? []) {
    instructorByOffering[o._id] = o.instructor?.name
  }

  const advisor = profileState.data?.advisorId

  const columns = [
    { header: 'Code', render: (r) => r.offering?.course?.code ?? '-' },
    { header: 'Title', render: (r) => r.offering?.course?.title ?? '-' },
    { header: 'Section', render: (r) => r.offering?.section ?? '-' },
    { header: 'Day / Time', render: (r) => <ScheduleLines schedule={r.offering?.schedule} /> },
    { header: 'Room', render: (r) => roomsText(r.offering?.schedule) },
    { header: 'Instructor', render: (r) => instructorByOffering[r.offering?._id] ?? '-' },
    { header: 'Credits', render: (r) => r.offering?.course?.credits ?? '-' },
    {
      header: 'Status',
      render: (r) => (r.status === 'registered' ? 'Registered' : 'Requested (pending approval)'),
    },
    {
      header: 'Add/Drop',
      render: (r) =>
        r.offering?.status === 'open'
          ? `Open until ${formatDate(r.offering.registrationClosesAt)}`
          : 'Closed',
    },
  ]

  return (
    <>
      <Navbar title="Student Dashboard" />
      <main className="page page-wide">
        <h1>Welcome, {user.name}</h1>
        <p className="form-hint">
          Student ID {user.studentId ?? '-'}
          {advisor ? ` | Advisor: ${advisor.name}` : ''}
        </p>

        <DataSection
          title="Add/drop status"
          state={offeringsState}
          loadingText="Loading add/drop status..."
          errorText="Unable to load the add/drop status."
        >
          {(offerings) => <AddDropStatus offerings={offerings} />}
        </DataSection>

        <DataSection
          title={`My courses (${CURRENT_TERM})`}
          state={registrationState}
          loadingText="Loading your courses..."
          errorText="Unable to load your courses."
        >
          {(registrations) => (
            <DataTable
              columns={columns}
              rows={registrations.filter((r) => r.offering?.term === CURRENT_TERM)}
              getRowKey={(r) => r._id}
              emptyMessage="You are not registered for any courses this term yet."
            />
          )}
        </DataSection>

        <DataSection
          title="Academic record"
          state={recordState}
          loadingText="Loading your academic record..."
          errorText="Unable to load your academic record."
        >
          {(record) => <AcademicRecord record={record} />}
        </DataSection>
      </main>
    </>
  )
}

export default StudentDashboard