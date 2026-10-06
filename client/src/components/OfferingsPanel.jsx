import { useState } from 'react'
import DataTable from './DataTable'
import LoadingMessage from './LoadingMessage'
import ErrorMessage from './ErrorMessage'
import ConfirmDialog from './ConfirmDialog'
import Modal from './Modal'
import OfferingForm from './OfferingForm'
import AddDropForm from './AddDropForm'
import { useApiData } from '../hooks/useApiData'
import {
  getOfferings,
  createOffering,
  updateOffering,
  deleteOffering,
  getInstructors,
} from '../services/api'
import { CURRENT_TERM } from '../config'
import { formatDate, isAddDropOpen } from '../utils/format'

// Defined outside the component so it is the same function on every render
// (useApiData needs a stable function).
const fetchOfferings = () => getOfferings(CURRENT_TERM)

const labelOf = (o) => `${o.course?.code ?? 'Course'} Section ${o.section}`

function statusText(o) {
  if (isAddDropOpen(o)) return `Open until ${formatDate(o.registrationClosesAt)}`
  if (o.status === 'open') return `Closed (ended ${formatDate(o.registrationClosesAt)})`
  return o.status.charAt(0).toUpperCase() + o.status.slice(1)
}

function OfferingsPanel() {
  const {
    data: instructorList,
    error: instructorError,
    reload: reloadInstructors,
  } = useApiData(getInstructors)
  const { data: offerings, error, reload } = useApiData(fetchOfferings)

  const [notice, setNotice] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingOffering, setEditingOffering] = useState(null) // null while creating
  const [addDropTarget, setAddDropTarget] = useState(null) // offering whose window is being opened
  const [closeTarget, setCloseTarget] = useState(null) // offering whose window is being closed
  const [deleteTarget, setDeleteTarget] = useState(null)

  function openCreate() {
    setNotice('')
    setEditingOffering(null)
    setShowForm(true)
  }

  function openEdit(o) {
    setNotice('')
    setEditingOffering(o)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingOffering(null)
  }

  function askOpenAddDrop(o) {
    setNotice('')
    setAddDropTarget(o)
  }

  function askCloseAddDrop(o) {
    setNotice('')
    setCloseTarget(o)
  }

  function askDelete(o) {
    setNotice('')
    setDeleteTarget(o)
  }

  // The handlers below throw on failure; the form/dialog shows the message.
  async function handleSave(payload) {
    if (editingOffering) {
      await updateOffering(editingOffering._id, payload)
      setNotice(`Updated ${labelOf(editingOffering)}.`)
    } else {
      const created = await createOffering(payload)
      setNotice(`Created ${labelOf(created)}.`)
    }
    closeForm()
    reload()
  }

  async function handleOpenAddDrop(closeDate) {
    await updateOffering(addDropTarget._id, { status: 'open', registrationClosesAt: closeDate })
    setNotice(`Add/drop is now open for ${labelOf(addDropTarget)}.`)
    setAddDropTarget(null)
    reload()
  }

  async function handleCloseAddDrop() {
    await updateOffering(closeTarget._id, { status: 'closed' })
    setNotice(`Add/drop is now closed for ${labelOf(closeTarget)}.`)
    setCloseTarget(null)
    reload()
  }

  async function handleDelete() {
    await deleteOffering(deleteTarget._id)
    setNotice(`Deleted ${labelOf(deleteTarget)}.`)
    setDeleteTarget(null)
    reload()
  }

  // Instructor choices come from the backend (GET /api/instructors)
  const instructors = instructorList ?? []

  const rows = offerings
    ? [...offerings].sort(
        (a, b) =>
          (a.course?.code ?? '').localeCompare(b.course?.code ?? '') ||
          a.section.localeCompare(b.section),
      )
    : []

  const columns = [
    { header: 'Code', render: (o) => o.course?.code ?? '-' },
    { header: 'Title', render: (o) => o.course?.title ?? '-' },
    { header: 'Section', render: (o) => o.section },
    {
      header: 'Day / Time',
      render: (o) =>
        (o.schedule ?? []).map((s, i) => (
          <div key={i}>
            {s.day} {s.startTime}-{s.endTime}
          </div>
        )),
    },
    {
      header: 'Room',
      render: (o) => [...new Set((o.schedule ?? []).map((s) => s.room))].join(', ') || '-',
    },
    { header: 'Instructor', render: (o) => o.instructor?.name ?? '-' },
    { header: 'Seats', render: (o) => o.capacity },
    { header: 'Taken', render: (o) => o.enrolledCount },
    {
      header: 'Remaining',
      render: (o) => {
        const remaining = o.capacity - o.enrolledCount
        return remaining <= 0 ? '0 (Full)' : remaining
      },
    },
    { header: 'Add/Drop', render: (o) => statusText(o) },
    {
      header: 'Actions',
      render: (o) => (
        <>
          <button onClick={() => openEdit(o)}>Edit</button>
          {isAddDropOpen(o) ? (
            <button onClick={() => askCloseAddDrop(o)}>Close add/drop</button>
          ) : (
            <button onClick={() => askOpenAddDrop(o)}>Open add/drop</button>
          )}
          <button
            className="danger"
            onClick={() => askDelete(o)}
            disabled={o.enrolledCount > 0}
            title={o.enrolledCount > 0 ? 'Remove the registrations for this section first' : undefined}
          >
            Delete
          </button>
        </>
      ),
    },
  ]

  let content
  if (error) {
    content = (
      <ErrorMessage
        message={`Unable to load course offerings. ${error.message}`}
        onRetry={reload}
      />
    )
  } else if (!offerings) {
    content = <LoadingMessage text="Loading course offerings..." />
  } else {
    content = (
      <>
        <div className="toolbar">
          <p>Term {CURRENT_TERM}</p>
          <button onClick={openCreate}>Create offering</button>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(o) => o._id}
          emptyMessage="No course offerings for this term yet."
        />
      </>
    )
  }

  return (
    <>
      {notice && (
        <div className="success-message" role="status">
          {notice}
        </div>
      )}

      {content}

      {showForm && (
        <Modal title={editingOffering ? 'Edit offering' : 'Create offering'}>
          {instructorError ? (
            <ErrorMessage
              message={`Unable to load instructor accounts. ${instructorError.message}`}
              onRetry={reloadInstructors}
            />
          ) : !instructorList ? (
            <LoadingMessage text="Loading instructor accounts..." />
          ) : instructors.length === 0 ? (
            <>
              <p className="empty-message">
                No instructor accounts are available. An administrator must create or activate an
                account with the Advisor role before an instructor can be assigned.
              </p>
              <div className="button-row">
                <button type="button" onClick={closeForm}>Close</button>
              </div>
            </>
          ) : (
            <OfferingForm
              offering={editingOffering}
              term={CURRENT_TERM}
              instructors={instructors}
              onSubmit={handleSave}
              onCancel={closeForm}
            />
          )}
        </Modal>
      )}

      {addDropTarget && (
        <Modal title={`Open add/drop: ${labelOf(addDropTarget)}`}>
          <AddDropForm
            offering={addDropTarget}
            onSubmit={handleOpenAddDrop}
            onCancel={() => setAddDropTarget(null)}
          />
        </Modal>
      )}

      {closeTarget && (
        <ConfirmDialog
          title="Close add/drop window"
          message={`Close the add/drop window for ${labelOf(closeTarget)}? The section will no longer be open for registration.`}
          confirmLabel="Close window"
          onConfirm={handleCloseAddDrop}
          onCancel={() => setCloseTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete offering"
          message={`Delete ${labelOf(deleteTarget)}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}

export default OfferingsPanel
