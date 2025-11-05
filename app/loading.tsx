export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="relative h-16 w-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-text-tertiary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-accent-orange border-t-transparent animate-spin"></div>
        </div>
        <p className="text-text-secondary text-sm">Loading...</p>
      </div>
    </div>
  )
}

