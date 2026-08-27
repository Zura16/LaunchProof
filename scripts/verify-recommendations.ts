import { PrismaClient } from '@prisma/client'
import {
  generateRecommendations,
  regenerateRecommendations,
} from '@/lib/services/recommendation-engine.service'

const prisma = new PrismaClient()

function assert(label: string, condition: boolean, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!condition) process.exitCode = 1
}

async function main() {
  const alex = await prisma.user.findUniqueOrThrow({ where: { email: 'alex.chen@example.edu' } })

  const generated = await generateRecommendations(alex.id)
  console.log(`generated ${generated.length}: ${generated.map((r) => r.title).join(' | ')}\n`)

  assert('produced recommendations from real gaps', generated.length > 0)
  assert(
    'ranked by priority descending',
    generated.every((r, i) => i === 0 || generated[i - 1].priorityScore >= r.priorityScore)
  )
  assert(
    'top recommendation improves an existing project rather than starting a new one',
    generated[0].type === 'IMPROVE_EXISTING_PROJECT',
    generated[0].type
  )
  assert(
    'flagship bundles multiple gaps into one piece of work',
    generated[0].skillsAddressed.length >= 2,
    `${generated[0].skillsAddressed.length} skills`
  )
  assert(
    'flagship targets a real repository',
    !!generated[0].targetRepoName,
    generated[0].targetRepoName ?? 'none'
  )

  // No skill should be claimed by two recommendations — that would tell the
  // student to do the same work twice.
  const allSkills = generated.flatMap((r) => r.skillsAddressed)
  assert(
    'no skill is claimed by more than one recommendation',
    new Set(allSkills).size === allSkills.length,
    allSkills.join(', ')
  )

  assert(
    'never recommends building a new project while a repo exists to improve',
    !generated.some((r) => r.type === 'BUILD_NEW_PROJECT')
  )
  assert(
    'reasoning is specific, not boilerplate',
    generated.every((r) => r.reasoning.length > 60 && /\d/.test(r.reasoning))
  )
  assert(
    'no fabricated hiring guarantees in reasoning',
    !generated.some((r) => /guarantee|will get you|ensures you land|certain to/i.test(r.reasoning))
  )

  // --- Lifecycle: dismissals and in-progress plans survive a regenerate ---
  const before = await prisma.recommendation.findMany({ where: { userId: alex.id } })
  const withPlan = before.find((r) => r.title === 'Upgrade CampusConnect')
  const toDismiss = before.find((r) => r.id !== withPlan?.id)

  assert('seed produced a recommendation with a project plan', !!withPlan)
  if (toDismiss) {
    await prisma.recommendation.update({ where: { id: toDismiss.id }, data: { status: 'DISMISSED' } })
  }

  await regenerateRecommendations(alex.id)

  const after = await prisma.recommendation.findMany({ where: { userId: alex.id }, include: { projectPlan: true } })
  const survivingPlan = after.find((r) => r.id === withPlan?.id)
  const dismissedStill = after.find((r) => r.id === toDismiss?.id)

  assert('recommendation with a project plan survives regeneration', !!survivingPlan?.projectPlan)
  assert('dismissed recommendation is not resurrected', dismissedStill?.status === 'DISMISSED')
  assert(
    'no duplicate recommendation titles after regenerating',
    new Set(after.map((r) => r.title)).size === after.length,
    after.map((r) => r.title).join(' | ')
  )

  // Restore so repeated runs stay clean.
  if (toDismiss) {
    await prisma.recommendation.update({ where: { id: toDismiss.id }, data: { status: 'ACTIVE' } })
  }

  // --- A user with no jobs has nothing to recommend ---
  const empty = await prisma.user.create({
    data: { email: `rec-empty-${Date.now()}@example.test`, name: 'Empty' },
  })
  const none = await generateRecommendations(empty.id)
  assert('no target jobs -> no recommendations invented', none.length === 0)
  await prisma.user.delete({ where: { id: empty.id } })

  console.log('\ncleanup ok')
}

main()
  .catch((e) => {
    console.error('FAILED:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
