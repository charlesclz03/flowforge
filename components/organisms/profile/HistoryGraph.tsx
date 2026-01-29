'use client'

import { Card } from '@/components/atoms/Card'

interface HistoryGraphProps {
  data: { date: string; count: number; label: string }[]
}

export function HistoryGraph({ data }: HistoryGraphProps) {
  // Find max value for normalization
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <Card title="Activity History" className="h-full">
      <div className="flex items-end justify-between h-40 gap-2 px-2 pt-4">
        {data.map((item) => {
          // Calculate height percentage (min 10% for visibility)
          const height =
            item.count === 0 ? 5 : Math.max(15, (item.count / max) * 100)

          return (
            <div
              key={item.date}
              className="flex flex-col items-center justify-end h-full gap-2 flex-1 group"
            >
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] absolute -mt-6 bg-black border border-white/20 px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                {item.count} sessions
              </div>

              {/* Bar */}
              <div
                className={`w-full max-w-[12px] rounded-t-sm transition-all duration-500 ease-out ${
                  item.count > 0
                    ? 'bg-accent-purple hover:bg-accent-pink shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'bg-white/5'
                }`}
                style={{ height: `${height}%` }}
              />

              {/* Label */}
              <span className="text-[10px] text-text-tertiary uppercase">
                {item.label}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
