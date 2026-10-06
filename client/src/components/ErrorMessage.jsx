// Shows an error. Pass onRetry to get a "Try Again" button.
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message" role="alert">
      <p>{message}</p>
      {onRetry && (<button type="button" onClick={onRetry}>Try Again</button>)}
    </div>
  )
}

export default ErrorMessage