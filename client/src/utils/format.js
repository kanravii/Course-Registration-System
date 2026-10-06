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