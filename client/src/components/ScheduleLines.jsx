// One line per weekly meeting, e.g. "Mon 09:00-10:30"
function ScheduleLines({ schedule }) {
  if (!schedule?.length) return <span>-</span>

  return schedule.map((s, i) => (
    <div key={i}>
      {s.day} {s.startTime}-{s.endTime}
    </div>
  ))
}

export default ScheduleLines