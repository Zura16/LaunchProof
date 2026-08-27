import { PrismaClient } from '@prisma/client'
import { JOB_SOURCES } from '@/lib/jobfeed/sources'

/**
 * Apply the job-source list to an existing database without touching any
 * other data. Safe to run against production; the seed script resets things
 * this one deliberately does not.
 */
const prisma = new PrismaClient()

async function main() {
  let created = 0
  let updated = 0

  for (const src of JOB_SOURCES) {
    const existing = await prisma.jobSource.findUnique({
      where: { provider_boardToken: { provider: src.provider, boardToken: src.boardToken } },
    })
    await prisma.jobSource.upsert({
      where: { provider_boardToken: { provider: src.provider, boardToken: src.boardToken } },
      update: { companyName: src.companyName, isActive: true },
      create: src,
    })
    existing ? updated++ : created++
  }

  const total = await prisma.jobSource.count({ where: { isActive: true } })
  console.log(`created ${created}, updated ${updated} — ${total} active sources`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
