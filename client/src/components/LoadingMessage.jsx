function LoadingMessage({ text = 'Loading...' }) {
  return (
    <p className="loading-message" role="status">
      {text}
    </p>
  )
}

export default LoadingMessage