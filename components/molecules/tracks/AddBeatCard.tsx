import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddBeatCardProps {
  onClick: () => void
}

export function AddBeatCard({ onClick }: AddBeatCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/5 transition-all duration-300 hover:border-accent-purple hover:bg-accent-purple/10 hover:-translate-y-1',
        'aspect-[3/4]' // Aspect ratio matching typical grid card height if needed, but BeatGridCard is flex height.
        // BeatGridCard has "aspect-square" cover + info. Let's try to match that height generally or just be responsive.
        // Actually BeatGridCard has `aspect-square` cover. Let's make this card overall aspect ratio similar or just fill height.
        // Let's stick to flex layout inside but ensure min-height.
      )}
    >
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-purple/20 text-accent-purple transition-transform group-hover:scale-110">
          <Upload size={32} />
        </div>
        <div>
          <h3 className="font-semibold text-white group-hover:text-accent-purple transition-colors">
            Upload Beat
          </h3>
          <p className="text-xs text-text-secondary mt-1 max-w-[120px]">
            add your own tracks to the library
          </p>
        </div>
      </div>
    </button>
  )
}
