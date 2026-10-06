import DataTable from './DataTable'
import ScheduleLines from './ScheduleLines'
import { roomsText } from '../utils/format'

// Retake-required courses first, then other eligible ones, then excluded ones.
// Excluded courses are never hidden: they stay in the list, greyed out, with the reason.
function rank(o) {
  if (o.eligible) return o.retakeRequired ? 0 : 1
  return o.retakeRequired ? 2 : 3
}

function EligibleCourses({ offerings, busyId, onRegister }) {
  const rows = [...offerings].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      a.courseCode.localeCompare(b.courseCode) ||
      a.section.localeCompare(b.section),
  )

  const columns = [
    { header: 'Code', render: (o) => o.courseCode },
    { header: 'Title', render: (o) => o.courseTitle },
    { header: 'Section', render: (o) => o.section },
    { header: 'Day / Time', render: (o) => <ScheduleLines schedule={o.schedule} /> },
    { header: 'Room', render: (o) => roomsText(o.schedule) },
    { header: 'Instructor', render: (o) => o.instructor?.name ?? '-' },
    { header: 'Credits', render: (o) => o.credits },
    { header: 'Seats left', render: (o) => o.seatsRemaining },
    {
      header: 'Status',
      render: (o) => (
        <>
          {o.retakeRequired && <span className="badge badge-retake">Retake Required</span>}{' '}
          {o.eligible ? (
            <span className="badge badge-ok">Eligible</span>
          ) : (
            <span className="reason">{o.reason}</span>
          )}
        </>
      ),
    },
    {
      header: 'Action',
      render: (o) => (
        <button
          onClick={() => onRegister(o)}
          disabled={!o.eligible || busyId !== null}
          title={o.eligible ? undefined : o.reason}
        >
          {busyId === o.offeringId ? 'Registering...' : 'Register'}
        </button>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(o) => o.offeringId}
      emptyMessage="No course offerings exist for this term."
      rowClassName={(o) => (!o.eligible ? 'row-excluded' : o.retakeRequired ? 'row-retake' : undefined)}
    />
  )
}

export default EligibleCourses