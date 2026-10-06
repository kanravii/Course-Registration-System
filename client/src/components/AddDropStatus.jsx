import { formatDate, isAddDropOpen } from '../utils/format'

// Tells the student whether the add/drop window is open, based on the term's offerings.
// A section counts as "open" when its status is "open" (the advisor opens/closes it).
function AddDropStatus({ offerings }) {
  const open = offerings.filter((o) => isAddDropOpen(o))

  if (open.length === 0) {
    return (
      <div className="status-banner status-closed" role="status">
        Add/drop is currently closed.
      </div>
    )
  }

  // Sections can close on different dates, so show the range when they differ
  const dates = [...new Set(open.map((o) => o.registrationClosesAt?.slice(0, 10)).filter(Boolean))].sort()
  const closing =
    dates.length === 0
      ? 'closing date to be confirmed'
      : dates.length === 1
        ? `closes on ${formatDate(dates[0])}`
        : `closes between ${formatDate(dates[0])} and ${formatDate(dates[dates.length - 1])}`

  return (
    <div className="status-banner status-open" role="status">
      Add/drop is open for {open.length} course section{open.length === 1 ? '' : 's'} and {closing}.
    </div>
  )
}

export default AddDropStatus
