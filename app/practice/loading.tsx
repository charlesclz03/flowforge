import { Spinner } from '@/components/atoms/Spinner'

export default function PracticeLoading() {
  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <Spinner size="lg" className="text-accent-purple" />
        <p className="text-sm font-medium text-text-secondary animate-pulse">
          Loading Practice Engine...
        </p>
      </div>
    </div>
  )
}
