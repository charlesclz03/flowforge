export default function TracksLoading() {
  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="h-5 w-64 animate-pulse rounded bg-white/5" />
      </div>

      {/* Filter/Search Bar Skeleton */}
      <div className="flex gap-2">
        <div className="h-12 w-full animate-pulse rounded-xl bg-white/10" />
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-white/10" />
      </div>

      {/* Track List Skeleton */}
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex h-20 w-full items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-white/10" />
              <div className="flex flex-col gap-2">
                <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
              </div>
            </div>
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  )
}
