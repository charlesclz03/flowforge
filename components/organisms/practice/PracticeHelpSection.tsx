'use client'

import { Card } from '@/components/atoms/Card'

export function PracticeHelpSection() {
  return (
    <Card title="How it Works">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue/10">
            <span className="text-lg font-semibold text-accent-blue">1</span>
          </div>
          <h4 className="font-medium text-white">Choose Your Beat</h4>
          <p className="text-sm text-text-secondary">
            Select from our library of professionally curated beats across multiple genres and
            tempos.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple/10">
            <span className="text-lg font-semibold text-accent-purple">2</span>
          </div>
          <h4 className="font-medium text-white">Configure Session</h4>
          <p className="text-sm text-text-secondary">
            Set word frequency (how often prompts appear) and difficulty level to match your skill.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-violet/10">
            <span className="text-lg font-semibold text-accent-violet">3</span>
          </div>
          <h4 className="font-medium text-white">Practice & Record</h4>
          <p className="text-sm text-text-secondary">
            Hit play to start! Words will appear on-beat. Freestyle for 2 minutes and review your
            session.
          </p>
        </div>
      </div>
    </Card>
  )
}
