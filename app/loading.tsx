import { LoadingWave } from '@/components/atoms/feedback/LoadingWave'

export default function Loading() {
  return (
    <div className="w-full h-[50vh] flex flex-col items-center justify-center gap-4">
      <LoadingWave />
      <p className="text-text-secondary text-sm animate-pulse">Loading...</p>
    </div>
  )
}
