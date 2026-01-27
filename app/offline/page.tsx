export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
      <h1 className="text-3xl font-bold text-white tracking-widest uppercase">
        Offline
      </h1>
      <p className="text-text-secondary max-w-xs">
        The beat dropped... and so did your connection.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors uppercase tracking-wider"
      >
        Retry
      </button>

      <div className="text-xs text-text-tertiary">
        Check your internet connection
      </div>
    </div>
  )
}
