import ErrorMessage from './ErrorMessage'
import LoadingMessage from './LoadingMessage'

// One block of a page that loads its own data.
// `state` is what useApiData returns; `children` is a function that receives the loaded data.
function DataSection({ title, state, loadingText, errorText, children }) {
  let body
  if (state.error) {
    body = <ErrorMessage message={`${errorText} ${state.error.message}`} onRetry={state.reload} />
  } else if (!state.data) {
    body = <LoadingMessage text={loadingText} />
  } else {
    body = children(state.data)
  }

  return (
    <section className="panel-section">
      <h3>{title}</h3>
      {body}
    </section>
  )
}

export default DataSection