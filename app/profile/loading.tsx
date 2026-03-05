export default function ProfileLoading() {
  return (
    <div className="flex h-full w-full flex-col gap-6 p-4">
      {/* Profile Header Skeleton */}
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="h-24 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
          <div className="h-5 w-32 animate-pulse rounded-full bg-white/5" />
        </div>
        
        {/* Stats Row Skeleton */}
        <div className="mt-4 flex gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-8 w-12 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex w-full gap-2 border-b border-white/10 pb-2">
        <div className="h-10 w-24 animate-pulse rounded-lg bg-white/10" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-white/5" />
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-col gap-4 pt-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 w-full animate-pulse rounded-xl bg-white/5"
          />
        ))}
      </div>
    </div>
  )
}
