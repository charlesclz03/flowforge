(async () => {
  const { PrismaClient } = require('@prisma/client')
  const p = new PrismaClient()
  try {
    const beatCount = await p.beat.count()
    const wordCount = await p.word.count()
    const sessionCount = await p.freestyleSession.count()
    console.log(JSON.stringify({ beatCount, wordCount, sessionCount }, null, 2))
  } catch (e) {
    console.error('Verification error:', e)
    process.exit(1)
  } finally {
    await p.$disconnect()
  }
})()
