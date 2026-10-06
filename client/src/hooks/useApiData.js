import { useEffect, useState } from 'react'

// Loads data from the API and tracks loading / error state for a screen.
// `fetcher` must be a stable function (an imported api function, or one wrapped in useCallback),
// otherwise the effect would re-run on every render.
export function useApiData(fetcher) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let cancelled = false // ignore a response that arrives after the component is gone

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled) setState((prev) => ({ ...prev, loading: false, error: err }))
      })

    return () => {
      cancelled = true
    }
  }, [fetcher, reloadCount])

  // Re-fetch (used by the "Try Again" button and after create/edit/delete).
  // The old data stays on screen while loading, so the table doesn't flash.
  function reload() {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    setReloadCount((count) => count + 1)
  }

  return { ...state, reload }
}