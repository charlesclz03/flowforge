import { prisma } from '@/lib/prisma'
import { isSameDay, subDays, startOfDay } from 'date-fns'

export class StreakSystem {
  static async checkAndUpdate(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true, lastPracticeDate: true },
    })

    if (!user) return null

    const now = new Date()
    const lastPractice = user.lastPracticeDate
    let newStreak = user.currentStreak

    if (!lastPractice) {
      // First ever session
      newStreak = 1
    } else {
      const today = startOfDay(now)
      const last = startOfDay(lastPractice)

      if (isSameDay(today, last)) {
        // Already practiced today, don't increment but update timestamp
        await prisma.user.update({
          where: { id: userId },
          data: { lastPracticeDate: now },
        })
        return { currentStreak: newStreak, longestStreak: user.longestStreak, isNewRecord: false, kept: true }
      }

      const yesterday = subDays(today, 1)
      if (isSameDay(yesterday, last)) {
        // Consecutive day
        newStreak += 1
      } else {
        // Streak broken
        newStreak = 1
      }
    }

    const newLongest = Math.max(newStreak, user.longestStreak)

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastPracticeDate: now,
      },
    })

    return {
      currentStreak: newStreak,
      longestStreak: newLongest,
      isNewRecord: newStreak > user.longestStreak,
      kept: false
    }
  }
}
