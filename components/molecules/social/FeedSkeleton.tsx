import { Skeleton } from '@/components/atoms/Skeleton'
import { Card } from '@/components/atoms/Card'

export function FeedSkeleton() {
  return (
    <Card className="mb-6 overflow-hidden !p-0">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Content */}
      <div className="aspect-video bg-white/5 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-16 h-16 rounded-full opacity-20" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4">
        <div className="flex gap-4">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
        </div>
        <Skeleton className="h-6 w-6" />
      </div>
    </Card>
  )
}
