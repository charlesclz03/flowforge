
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Starting migration...')
  const result = await prisma.beat.updateMany({
    where: {
      uploaderId: null, // Public beats
      OR: [
        { label: null },
        { label: '' }
      ]
    },
    data: {
      label: 'Freestyla'
    }
  })
  console.log(`Updated ${result.count} beats with label "Freestyla"`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
