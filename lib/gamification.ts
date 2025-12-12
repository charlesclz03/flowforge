import { prisma } from '@/lib/prisma'

interface SessionData {
  userId: string
  durationSeconds: number
  difficulty: number
  frequency: number
  beatId: string
  createdAt?: Date
}

export async function checkBadges(session: SessionData) {
  const newBadges: string[] = []
  const now = new Date()
  const currentHour = now.getHours()

  // 1. Night Shift: Session between 02:00–05:00
  if (currentHour >= 2 && currentHour < 5) {
    newBadges.push('Night Shift')
  }

  // 2. Machine Gun: Hard Mode (3) + 4 Bar Frequency
  // Note: frequency is bars per prompt? Or prompt every X bars?
  // Usually "Machine Gun" implies fast.
  // If frequency = 4 (every 4 bars) that's standard?
  // Wait, if "High Frequency" of words means LESS bars between words.
  // Let's assume input frequency is "Bars between words".
  // So 4 is faster than 8.
  if (session.difficulty === 3 && session.frequency <= 4) {
    newBadges.push('Machine Gun')
  }

  // 3. Founder: Sign up + Record in first 7 days
  // We need user creation date.
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { createdAt: true, badges: true },
  })

  if (!user) return []

  const daysSinceSignup = (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceSignup <= 7) {
    newBadges.push('Founder')
  }

  // 4. Beat Mastery: 5 Sessions on one Beat
  // This requires a count query
  const sessionCountOnBeat = await prisma.freestyleSession.count({
    where: {
      userId: session.userId,
      beatId: session.beatId,
    },
  })

  // We are checking AFTER saving the current one? Or assuming this is called before?
  // If called after, count includes current. If before, count + 1.
  // Let's assume this is called AFTER save for accurate count.
  // Actually, we usually call this during the API call.
  // If count is >= 5 (including this one), award.
  if (sessionCountOnBeat >= 5) {
    newBadges.push('Beat Mastery')
  }

  // Filter out already earned badges
  // badges is a String[] in schema
  // We need to parse it if it's JSON or it's a scalar list?
  // Schema says `badges String[]` (scalar list).
  const currentBadges = user.badges || []
  const badgesToAward = newBadges.filter((b) => !currentBadges.includes(b))

  if (badgesToAward.length > 0) {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        badges: {
          push: badgesToAward,
        },
      },
    })
  }

  return badgesToAward
}
