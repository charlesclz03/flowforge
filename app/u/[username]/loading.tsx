import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { Card } from '@/components/atoms/Card'
import { Container } from '@/components/atoms/Container'
import { Skeleton } from '@/components/atoms/Skeleton'

export default function Loading() {
  return (
    <Container className="py-8 space-y-8">
      <AppHeader showBackButton={true} />
      {/* Profile Header Skeleton */}
      <Card padding="lg" className="relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          {/* Avatar Skeleton */}
          <Skeleton className="w-[88px] h-[88px] sm:w-[128px] sm:h-[128px] rounded-full border-4 border-background-elevated" />

          <div className="flex-1 text-center md:text-left space-y-4 w-full">
            {/* Name */}
            <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
            {/* Username */}
            <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
            {/* Stats */}
            <Skeleton className="h-12 w-24 mx-auto md:mx-0 mt-4" />
          </div>
        </div>
      </Card>

      {/* Tabs Skeleton */}
      <div className="w-full space-y-6">
        <Skeleton className="h-10 w-full lg:w-[400px]" />
        {/* Tab Content Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="p-4 flex items-center justify-between h-20"
            >
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Container>
  )
}
