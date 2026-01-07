export type Rank = {
  name: string
  minMinutes: number
  color: string
}

export const CAREER_RANKS: Rank[] = [
  { name: 'SoundCloud Rapper', minMinutes: 0, color: 'text-text-tertiary' },
  { name: 'Underground King', minMinutes: 15, color: 'text-accent-blue' },
  { name: 'Lyricist', minMinutes: 60, color: 'text-accent-purple' },
  { name: 'Heavy Hitter', minMinutes: 180, color: 'text-accent-orange' },
  {
    name: 'Rap God',
    minMinutes: 600,
    color: 'text-yellow-400 font-black animate-pulse',
  },
]

export function getRank(totalMinutes: number): Rank {
  return (
    [...CAREER_RANKS].reverse().find((r) => totalMinutes >= r.minMinutes) ||
    CAREER_RANKS[0]
  )
}
