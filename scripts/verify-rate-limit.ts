import { PrismaClient } from '@prisma/client'
import { consumeAiQuota, refundAiQuota, getUsage, RateLimitError } from '@/lib/ai/rate-limit'

const prisma = new PrismaClient()

function assert(label: string, condition: boolean, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!condition) process.exitCode = 1
}

async function main() {
  const user = await prisma.user.create({
    data: { email: `ratelimit-${Date.now()}@example.test`, name: 'Rate Limit Test' },
  })

  const start = await getUsage(user.id, 'JOB_ANALYSIS')
  assert('new user starts with a full allowance', start.used === 0 && start.remaining === start.limit, `limit ${start.limit}`)

  const first = await consumeAiQuota(user.id, 'JOB_ANALYSIS')
  const afterOne = await getUsage(user.id, 'JOB_ANALYSIS')
  assert('consuming decrements the allowance', afterOne.used === 1 && afterOne.remaining === start.limit - 1)

  await refundAiQuota(first)
  const afterRefund = await getUsage(user.id, 'JOB_ANALYSIS')
  assert('refunding restores the allowance', afterRefund.used === 0)

  // Operations are metered independently.
  await consumeAiQuota(user.id, 'RESUME_ANALYSIS')
  const jobs = await getUsage(user.id, 'JOB_ANALYSIS')
  const resumes = await getUsage(user.id, 'RESUME_ANALYSIS')
  assert('operations have independent budgets', jobs.used === 0 && resumes.used === 1)

  // Exhaust one operation and confirm it blocks.
  const limit = jobs.limit
  for (let i = 0; i < limit; i++) await consumeAiQuota(user.id, 'JOB_ANALYSIS')

  const exhausted = await getUsage(user.id, 'JOB_ANALYSIS')
  assert('allowance reaches zero', exhausted.remaining === 0, `${exhausted.used}/${exhausted.limit}`)

  let blocked: RateLimitError | null = null
  try {
    await consumeAiQuota(user.id, 'JOB_ANALYSIS')
  } catch (e) {
    if (e instanceof RateLimitError) blocked = e
  }
  assert('further calls are refused', blocked !== null)
  assert('refusal explains when it resets', !!blocked && /resets/.test(blocked.message), blocked?.message ?? '')
  assert('refusal carries a retry time in the future', !!blocked && blocked.retryAt.getTime() > Date.now())

  // A different operation is unaffected by the exhausted one.
  const stillAllowed = await consumeAiQuota(user.id, 'PROJECT_PLAN').then(() => true).catch(() => false)
  assert('exhausting one operation does not block another', stillAllowed)

  // Usage outside the 24h window must not count.
  await prisma.aiUsageEvent.updateMany({
    where: { userId: user.id, operation: 'JOB_ANALYSIS' },
    data: { createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000) },
  })
  const rolledOff = await getUsage(user.id, 'JOB_ANALYSIS')
  assert('usage older than the window rolls off', rolledOff.used === 0 && rolledOff.remaining === limit)

  const allowedAgain = await consumeAiQuota(user.id, 'JOB_ANALYSIS').then(() => true).catch(() => false)
  assert('calls are allowed again once the window passes', allowedAgain)

  await prisma.user.delete({ where: { id: user.id } })
  const orphaned = await prisma.aiUsageEvent.count({ where: { userId: user.id } })
  assert('usage rows are removed with the user', orphaned === 0)

  console.log('\ncleanup ok')
}

main()
  .catch((e) => {
    console.error('FAILED:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
