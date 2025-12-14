import { Card } from '@/components/atoms/Card'
// import { BadgeType } from '@/lib/gamification/badges'
import { Crown, Moon, Star, Flame, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BadgesDisplayProps {
  badges: string[]
}

const BADGE_CONFIG: Record<
  string,
  { icon: LucideIcon; label: string; description: string; color: string }
> = {
  Founder: {
    icon: Crown,
    label: 'Founder',
    description: 'Joined in the first week.',
    color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  },
  'Night Shift': {
    icon: Moon,
    label: 'Night Shift',
    description: 'Recorded focused sessions late at night.',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  'Beat Mastery': {
    icon: Star,
    label: 'Beat Mastery',
    description: 'Recorded 5+ sessions on a single beat.',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  Dedication: {
    icon: Flame,
    label: 'Dedication',
    description: 'Recorded 10+ sessions total.',
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  },
}

export function BadgesDisplay({ badges }: BadgesDisplayProps) {
  if (!badges || badges.length === 0) {
    return (
      <Card title="Badges">
        <div className="text-text-tertiary text-sm py-4 text-center">
          No badges earned yet. Keep flowing!
        </div>
      </Card>
    )
  }

  return (
    <Card title="Badges">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {badges.map((badge) => {
          const config = BADGE_CONFIG[badge]
          if (!config) return null

          const Icon = config.icon

          return (
            <div
              key={badge}
              className={cn(
                'flex flex-col items-center p-3 rounded-lg border text-center gap-2',
                config.color
              )}
            >
              <div className="p-2 rounded-full bg-inherit brightness-125">
                <Icon size={24} />
              </div>
              <div>
                <div className="font-bold text-sm">{config.label}</div>
                <div className="text-[10px] opacity-70 leading-tight mt-1">
                  {config.description}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
