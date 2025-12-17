import { Skeleton } from '@/components/atoms/Skeleton'
import { Card } from '@/components/atoms/Card'

export default function Loading() {
  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen">
      <h1 className="text-2xl font-bold mb-6 pl-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-pink">
        Community Flows
      </h1>

      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="mb-6 overflow-hidden !p-0 border-white/5">
            {/* Header Skeleton */}
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>

            {/* Video/Visualizer Skeleton */}
            <div className="aspect-video bg-black/40 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="w-16 h-16 rounded-full opacity-20" />
              </div>
            </div>

            {/* Actions Skeleton */}
            <div className="p-4 flex justify-between">
              <div className="flex gap-6">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-6 w-6" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
