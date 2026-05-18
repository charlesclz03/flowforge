import type { Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'

type TestSessionTier = 'free' | 'pro' | 'superadmin'

export type PlaywrightTestSession = {
  prisma: PrismaClient
  userId: string
  sessionToken: string
  cleanup: () => Promise<void>
}

function loadDatabaseUrlFromEnvFiles() {
  if (process.env.DATABASE_URL) return

  const envFiles = ['.env.local', '.env']
  for (const file of envFiles) {
    if (!existsSync(file)) continue

    const content = readFileSync(file, 'utf8')
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const delimiterIndex = trimmed.indexOf('=')
      if (delimiterIndex <= 0) continue

      const key = trimmed.slice(0, delimiterIndex).trim()
      if (!['DATABASE_URL', 'DIRECT_URL'].includes(key)) continue

      let value = trimmed.slice(delimiterIndex + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      if (value && !process.env[key]) process.env[key] = value
    }

    if (process.env.DATABASE_URL) return
  }
}

export async function createPlaywrightSession(
  page: Page,
  tier: TestSessionTier
): Promise<PlaywrightTestSession> {
  loadDatabaseUrlFromEnvFiles()
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for Playwright auth bootstrap')
  }

  const prisma = new PrismaClient()
  const userId = randomUUID()
  const sessionToken = `pw-session-${randomUUID()}`
  const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const isPro = tier === 'pro' || tier === 'superadmin'
  const role = tier === 'superadmin' ? 'SUPERADMIN' : 'USER'

  await prisma.$connect()
  await prisma.user.create({
    data: {
      id: userId,
      email: `pw-${tier}-${userId}@example.com`,
      name: `Playwright ${tier}`,
      username: `pw${tier}${userId.slice(0, 8)}`,
      profileSetupCompletedAt: new Date('2026-05-18T12:00:00.000Z'),
      role,
      subscriptionStatus: isPro ? 'active' : null,
    },
  })
  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires: sessionExpiresAt,
    },
  })

  await page.context().addCookies([
    {
      name: 'next-auth.session-token',
      value: sessionToken,
      url: 'http://localhost:3000',
      httpOnly: true,
      sameSite: 'Lax',
      expires: Math.floor(sessionExpiresAt.getTime() / 1000),
    },
  ])

  return {
    prisma,
    userId,
    sessionToken,
    cleanup: async () => {
      await prisma.session.deleteMany({ where: { sessionToken } })
      await prisma.user.deleteMany({ where: { id: userId } })
      await prisma.$disconnect()
    },
  }
}
