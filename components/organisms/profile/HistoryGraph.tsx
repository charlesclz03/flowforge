'use client'

import { useMemo } from 'react'
import { Card } from '@/components/atoms/Card'

interface HistoryGraphProps {
  recordings: { createdAt: string | Date | number }[]
}

export function HistoryGraph({ recordings }: HistoryGraphProps) {
  // Calculate activity for the last 14 days
  const activityData = useMemo(() => {
    const days = 14
    const data = new Array(days).fill(0)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalize to start of day

    recordings.forEach((rec) => {
      const date = new Date(rec.createdAt)
      date.setHours(0, 0, 0, 0)

      const diffTime = Math.abs(today.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < days) {
        // diffDays is 0 for today, 1 for yesterday...
        // We want to fill the array from right (today) to left (13 days ago)
        // Array index 13 is today, 0 is 13 days ago
        const index = days - 1 - diffDays
        if (index >= 0) data[index]++
      }
    })

    // Find max value for normalization
    const max = Math.max(...data, 1) // Avoid divide by zero

    // Create label array (e.g. M, T, W...)
    const labels = new Array(days).fill('').map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (days - 1 - i))
      return d.toLocaleDateString('en-US', { weekday: 'narrow' })
    })

    return { data, max, labels }
  }, [recordings])

  return (
    <Card title="Activity History" className="h-full">
      <div className="flex items-end justify-between h-40 gap-2 px-2 pt-4">
        {activityData.data.map((count, i) => {
          // Calculate height percentage (min 10% for visibility)
          const height =
            count === 0 ? 5 : Math.max(15, (count / activityData.max) * 100)

          return (
            <div
              key={i}
              className="flex flex-col items-center justify-end h-full gap-2 flex-1 group"
            >
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] absolute -mt-6 bg-black border border-white/20 px-2 py-1 rounded pointer-events-none">
                {count} sessions
              </div>

              {/* Bar */}
              <div
                className={`w-full max-w-[12px] rounded-t-sm transition-all duration-500 ease-out ${
                  count > 0
                    ? 'bg-accent-purple hover:bg-accent-pink shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'bg-white/5'
                }`}
                style={{ height: `${height}%` }}
              />

              {/* Label */}
              <span className="text-[10px] text-text-tertiary uppercase">
                {activityData.labels[i]}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
