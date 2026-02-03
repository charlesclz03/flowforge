import { prisma } from '../lib/prisma'

function parseEmailList(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

async function main() {
  const emails = parseEmailList(process.env.SUPERADMIN_EMAILS)

  if (emails.length === 0) {
    console.log(
      'No SUPERADMIN_EMAILS provided. Set SUPERADMIN_EMAILS as a comma-separated list.'
    )
    process.exit(0)
  }

  const result = await prisma.user.updateMany({
    where: { email: { in: emails } },
    data: { role: 'SUPERADMIN' },
  })

  console.log(`Updated ${result.count} user(s) to role=SUPERADMIN.`)
}

main()
  .catch((err) => {
    console.error('Backfill failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
