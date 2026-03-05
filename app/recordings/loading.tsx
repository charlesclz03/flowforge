import { Loader2 } from 'lucide-react'

export default function RecordingsLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase text-white tracking-widest leading-none">
            THE VAULT
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            LOADING SESSIONS...
          </p>
        </div>
        <div className="flex h-[38px] w-[130px] animate-pulse rounded-lg bg-white/5" />
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-white/5 bg-black/40 p-4"
          >
            <div className="flex w-full items-start justify-between">
              <div className="flex flex-col gap-2">
                <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
              </div>
              <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
            </div>
            
            <div className="mt-6 flex h-[48px] w-full items-center justify-center rounded-lg bg-white/5">
              <Loader2 className="animate-spin text-white/20" size={20} />
            </div>

            <div className="mt-4 flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded-full bg-white/5" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-primary-500/10" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
