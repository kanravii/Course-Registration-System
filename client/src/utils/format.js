// Dates come from the API as ISO strings (e.g. 2026-10-15T00:00:00.000Z).
// timeZone: 'UTC' stops the day shifting depending on the viewer's time zone.
export function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// Treat an open window whose closing date has passed as closed in the UI.
// The API stores dates at midnight, so the closing date remains valid through
// the end of that calendar day.
export function isAddDropOpen(offering, now = new Date()) {
  if (offering?.status !== 'open' || !offering.registrationClosesAt) return false

  const dateText = String(offering.registrationClosesAt).slice(0, 10)
  const [year, month, day] = dateText.split('-').map(Number)
  const closesAt = Date.UTC(year, month - 1, day, 23, 59, 59, 999)
  return Number.isFinite(closesAt) && closesAt >= now.getTime()
}

export function roomsText(schedule) {
  const rooms = [...new Set((schedule ?? []).map((s) => s.room).filter(Boolean))]
  return rooms.length ? rooms.join(', ') : '-'
}

// Sorts terms like "1/2026" or "2026-1" from oldest to newest
function termKey(term) {
  let m = /^(\d)\/(\d{4})$/.exec(term)
  if (m) return Number(m[2]) * 10 + Number(m[1])
  m = /^(\d{4})-(\d)$/.exec(term)
  if (m) return Number(m[1]) * 10 + Number(m[2])
  return null
}

export function compareTerms(a, b) {
  const ka = termKey(a)
  const kb = termKey(b)
  if (ka !== null && kb !== null) return ka - kb
  return a.localeCompare(b)
}
