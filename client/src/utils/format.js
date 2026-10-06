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