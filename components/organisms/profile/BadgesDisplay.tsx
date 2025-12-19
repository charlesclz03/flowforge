import { Card } from '@/components/atoms/Card'
// import { BadgeType } from '@/lib/gamification/badges'
import {
  Crown,
  Moon,
  Star,
  Flame,
  Zap,
  Crosshair,
  Headphones,
  Users,
  Coffee,
  PenTool,
  LucideIcon,
} from 'lucide-react'
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
  'Machine Gun': {
    icon: Zap,
    label: 'Machine Gun',
    description: 'Fast bars on hard mode.',
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  },
  Perfectionist: {
    icon: Crosshair,
    label: 'Perfectionist',
    description: 'Restarted 5+ times to get it right.',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  'The Listener': {
    icon: Headphones,
    label: 'The Listener',
    description: 'Listened to playbacks 10+ times.',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  'Cypher King': {
    icon: Users,
    label: 'Cypher King',
    description: 'Mastered the pass-the-mic flow.',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  'Early Bird': {
    icon: Coffee,
    label: 'Early Bird',
    description: 'Spitting bars before breakfast.',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  Lyricist: {
    icon: PenTool,
    label: 'Lyricist',
    description: 'Over 50 minutes of recorded material.',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
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
