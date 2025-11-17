'use client'

import Link from 'next/link'
import { Card } from '@/components/atoms/Card'

export function QuickActions() {
  return (
    <Card title="Quick Actions">
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/practice">
          <button className="w-full rounded-lg bg-gradient-pulse px-6 py-4 text-left font-medium text-black shadow-neon transition-all hover:shadow-glow active:scale-95">
            <div className="text-lg">Start New Session</div>
            <div className="mt-1 text-sm opacity-80">Practice your freestyle skills</div>
          </button>
        </Link>
        <Link href="/recordings">
          <button className="w-full rounded-lg border border-stroke-subtle/40 bg-background-elevated/50 px-6 py-4 text-left font-medium text-white transition-all hover:bg-background-elevated active:scale-95">
            <div className="text-lg">View Recordings</div>
            <div className="mt-1 text-sm text-text-secondary">Browse your library</div>
          </button>
        </Link>
      </div>
    </Card>
  )
}
