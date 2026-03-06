interface PracticeErrorBannerProps {
  error?: string | null
  onRetrySave?: () => void
}

export function PracticeErrorBanner({
  error,
  onRetrySave,
}: PracticeErrorBannerProps) {
  if (!error) return null

  return (
    <div className="mb-4 flex flex-col items-center gap-2 text-red-400 text-sm text-center bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20 pointer-events-auto z-50">
      <span>{error}</span>
      {onRetrySave && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRetrySave()
          }}
          className="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold text-[10px] uppercase tracking-widest transition-colors shadow-lg shadow-red-500/10"
        >
          Retry Save
        </button>
      )}
    </div>
  )
}
