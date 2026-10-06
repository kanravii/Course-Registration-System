import { useState } from 'react'
import Modal from './Modal'
import ErrorMessage from './ErrorMessage'

// onConfirm must be an async function that throws if the action fails;
// the error message is then shown inside the dialog.
function ConfirmDialog({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setError('')
    setBusy(true)
    try {
      await onConfirm()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title={title}>
      <p>{message}</p>
      {error && <ErrorMessage message={error} />}
      <div className="button-row">
        <button className="danger" onClick={handleConfirm} disabled={busy}>
          {busy ? 'Working...' : confirmLabel}
        </button>
        <button onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog