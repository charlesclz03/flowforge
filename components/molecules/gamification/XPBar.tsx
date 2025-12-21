'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function XPBar() {
  const [progress, setProgress] = useState(0)
  const [level, setLevel] = useState(1)
  const [totalPoints, setTotalPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchXP() {
      try {
        const res = await fetch('/api/user/achievements')
        if (res.ok) {
          const data = await res.json()
          // Calculate XP for level
          // Simple logic: 100 XP per level for now, or just show total points?
          // Request said "Battle pass design of achievements point XP bar"

          let points = 0
          if (data.userAchievements && data.allAchievements) {
            const unlockedMap = new Set(data.userAchievements.map((ua: any) => ua.achievementId))
            data.allAchievements.forEach((ach: any) => {
              if (unlockedMap.has(ach.id)) points += ach.points
            })
          }

          setTotalPoints(points)

          const pointsPerLevel = 500
          const currentLevel = Math.floor(points / pointsPerLevel) + 1
          const levelProgress = ((points % pointsPerLevel) / pointsPerLevel) * 100

          setLevel(currentLevel)
          setProgress(levelProgress)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchXP()
  }, [])

  if (isLoading) return <div className="h-16 w-full animate-pulse bg-white/5 rounded-xl" />

  return (
    <div className="w-full bg-gradient-to-r from-violet-900/50 to-fuchsia-900/50 rounded-xl p-4 border border-white/10 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/20 blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10 flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent-purple flex items-center justify-center font-black text-xl text-white shadow-lg shadow-accent-purple/20 transform rotate-3">
            {level}
          </div>
          <div>
            <div className="text-xs font-bold text-accent-purple uppercase tracking-wider">
              Battle Pass
            </div>
            <div className="text-sm font-bold text-white">Season 1: Origins</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-text-tertiary uppercase tracking-wider mb-0.5">Total XP</div>
          <div className="font-mono font-bold text-accent-cyan">{totalPoints} PTS</div>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden relative border border-white/5">
        {/* Fill */}
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-purple to-accent-cyan"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Stripe Pattern Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />

        {/* Glow effect at tip */}
        <motion.div
          className="absolute top-0 bottom-0 w-2 bg-white/50 blur-sm"
          initial={{ left: 0 }}
          animate={{ left: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      <div className="flex justify-between mt-1.5 text-[10px] font-medium text-text-tertiary uppercase">
        <span>Level {level}</span>
        <span>
          {Math.round(totalPoints % 500)} / 500 XP to Level {level + 1}
        </span>
      </div>
    </div>
  )
}
