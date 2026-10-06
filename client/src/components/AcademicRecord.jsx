import DataTable from './DataTable'
import { compareTerms } from '../utils/format'

// A student's completed courses grouped by term, with F grades and retakes highlighted.
// `record` is the response of GET /api/students/:id/record (or /api/me/record).
function AcademicRecord({ record }) {
  const records = record.records

  if (records.length === 0) {
    return <p className="empty-message">No completed courses on record yet.</p>
  }

  // The newest attempt of each course decides whether an F still needs a retake
  const latestAttempt = {}
  for (const r of records) {
    const code = r.course?.code
    const current = latestAttempt[code]
    if (
      !current ||
      r.attempt > current.attempt ||
      (r.attempt === current.attempt && compareTerms(r.term, current.term) > 0)
    ) {
      latestAttempt[code] = r
    }
  }

  const retakeCodes = Object.values(latestAttempt)
    .filter((r) => r.grade === 'F')
    .map((r) => r.course?.code)

  const terms = [...new Set(records.map((r) => r.term))].sort(compareTerms)

  const columns = [
    { header: 'Code', render: (r) => r.course?.code ?? '-' },
    { header: 'Title', render: (r) => r.course?.title ?? '-' },
    { header: 'Credits', render: (r) => r.credits },
    { header: 'Grade', render: (r) => (r.grade === 'F' ? <span className="grade-f">F</span> : r.grade) },
    {
      header: 'Notes',
      render: (r) => {
        if (r.grade === 'F') {
          return latestAttempt[r.course?.code]?._id === r._id ? (
            <span className="badge badge-retake">Retake Required</span>
          ) : (
            'Failed (later retaken)'
          )
        }
        if (r.grade === 'W') return 'Withdrawn'
        return r.attempt > 1 ? `Attempt ${r.attempt}` : ''
      },
    },
  ]

  return (
    <>
      <p className="summary-line">Total credits earned: {record.totalCreditsEarned}</p>
      {retakeCodes.length > 0 && (
        <p className="grade-f">Retake required: {retakeCodes.join(', ')}</p>
      )}
      {terms.map((term) => (
        <div key={term}>
          <h4>Term {term}</h4>
          <DataTable
            columns={columns}
            rows={records.filter((r) => r.term === term)}
            getRowKey={(r) => r._id}
            rowClassName={(r) => (r.grade === 'F' ? 'row-failed' : undefined)}
          />
        </div>
      ))}
    </>
  )
}

export default AcademicRecord