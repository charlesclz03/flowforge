export const XP_CONFIG = {
  XP_PER_SECOND: 1, // Reduced from 2
  XP_PER_WORD: 10,  // Increased from 5
  XP_PER_SESSION_BASE: 10, // Adjusted for short session balance
  LEVEL_base_XP: 1000,
  LEVEL_MULTIPLIER: 1.2, // Level 2 requires 1000 * 1.2 = 1200 XP
}

/**
 * Calculates the level info based on total XP
 */
export function getLevelInfo(totalXP: number) {
  let level = 1
  let xpForNextLevel = XP_CONFIG.LEVEL_base_XP
  let remainingXP = totalXP
  // Level 1: 0 - 1000
  // Level 2: 1000 - 2200 (1000 + 1200)
  // Level 3: 2200 - 3640 (2200 + 1440)
  while (remainingXP >= xpForNextLevel) {
    remainingXP -= xpForNextLevel
    level++
    xpForNextLevel = Math.floor(xpForNextLevel * XP_CONFIG.LEVEL_MULTIPLIER)
  }

  return {
    level,
    currentXP: remainingXP, // XP progress into current level
    maxXP: xpForNextLevel, // XP needed to complete current level
    totalXP,
    progress: Math.min((remainingXP / xpForNextLevel) * 100, 100),
  }
}

/**
 * Calculates XP earned from a session
 */
export function calculateSessionXP(data: {
  durationSeconds: number
  wordCount: number
  achievementsUnlocked: number
}) {
  const durationXP = Math.floor(data.durationSeconds * XP_CONFIG.XP_PER_SECOND)
  const wordXP = data.wordCount * XP_CONFIG.XP_PER_WORD
  const achievementXP = data.achievementsUnlocked * 100 // Bonus for unlocking achievements
  const baseXP = XP_CONFIG.XP_PER_SESSION_BASE

  const totalEarned = baseXP + durationXP + wordXP + achievementXP

  return {
    total: totalEarned,
    breakdown: {
      base: baseXP,
      duration: durationXP,
      words: wordXP,
      achievements: achievementXP,
    },
  }
}
