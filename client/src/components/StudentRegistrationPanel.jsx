import { useState } from 'react'
import ErrorMessage from './ErrorMessage'
import LoadingMessage from './LoadingMessage'
import StudentWorkspace from './StudentWorkspace'
import { useApiData } from '../hooks/useApiData'
import { getStudents } from '../services/api'

function StudentRegistrationPanel() {
  const { data: students, error, reload } = useApiData(getStudents)
  const [selectedId, setSelectedId] = useState('')

  if (error) {
    return <ErrorMessage message={`Unable to load students. ${error.message}`} onRetry={reload} />
  }
  if (!students) return <LoadingMessage text="Loading students..." />

  const activeStudents = students.filter((s) => s.active !== false)
  const selected = activeStudents.find((s) => s._id === selectedId)

  return (
    <>
      <div className="form-field student-picker">
        <label htmlFor="student-select">Select a student</label>
        <select id="student-select" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">Choose a student...</option>
          {activeStudents.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.studentId})
            </option>
          ))}
        </select>
      </div>

      {selected ? (
        <StudentWorkspace key={selected._id} student={selected} />
      ) : (
        <p className="empty-message">
          Select a student to see their academic record and the courses they can register for.
        </p>
      )}
    </>
  )
}

export default StudentRegistrationPanel