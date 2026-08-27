import { PrismaClient } from '@prisma/client'
import { syncStudentSkills, strongestOf } from '@/lib/services/evidence-sync.service'
import { clearResumeEvidence } from '@/lib/services/resume-analysis.service'

const prisma = new PrismaClient()

function assert(label: string, condition: boolean) {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}`)
  if (!condition) process.exitCode = 1
}

async function main() {
  assert('strongestOf picks STRONG over WEAK', strongestOf(['WEAK', 'STRONG', 'SELF_REPORTED']) === 'STRONG')
  assert('strongestOf picks WEAK over SELF_REPORTED', strongestOf(['SELF_REPORTED', 'WEAK']) === 'WEAK')
  assert('strongestOf of empty is MISSING', strongestOf([]) === 'MISSING')

  const user = await prisma.user.create({
    data: { email: `sync-test-${Date.now()}@example.test`, name: 'Sync Test' },
  })
  const skill = await prisma.skill.create({
    data: { name: `SyncSkill-${Date.now()}`, slug: `syncskill-${Date.now()}`, category: 'OTHER' },
  })
  const FAKE_RESUME_ID = `fake-resume-${Date.now()}`

  // Two résumé-derived claims of differing strength for the same skill.
  await prisma.evidence.createMany({
    data: [
      {
        userId: user.id,
        skillId: skill.id,
        sourceType: 'MANUAL',
        sourceId: FAKE_RESUME_ID,
        strength: 'SELF_REPORTED',
        description: 'listed only',
      },
      {
        userId: user.id,
        skillId: skill.id,
        sourceType: 'RESUME_PROJECT',
        sourceId: FAKE_RESUME_ID,
        strength: 'WEAK',
        description: 'used in a project',
      },
    ],
  })

  await syncStudentSkills(user.id)
  const rolled = await prisma.studentSkill.findFirst({ where: { userId: user.id, skillId: skill.id } })
  assert('rollup takes the strongest claim (WEAK, not SELF_REPORTED)', rolled?.highestStrength === 'WEAK')

  // A stronger, non-résumé source should win.
  await prisma.evidence.create({
    data: {
      userId: user.id,
      skillId: skill.id,
      sourceType: 'GITHUB_REPOSITORY',
      strength: 'STRONG',
      description: 'real code',
    },
  })
  await syncStudentSkills(user.id)
  const upgraded = await prisma.studentSkill.findFirst({ where: { userId: user.id, skillId: skill.id } })
  assert('rollup upgrades to STRONG when a repo proves it', upgraded?.highestStrength === 'STRONG')

  // Removing the résumé must drop only résumé-derived claims.
  await clearResumeEvidence(FAKE_RESUME_ID, user.id)
  const afterResumeDelete = await prisma.studentSkill.findFirst({ where: { userId: user.id, skillId: skill.id } })
  const remaining = await prisma.evidence.count({ where: { userId: user.id, skillId: skill.id } })
  assert('résumé deletion leaves the GitHub evidence intact', remaining === 1)
  assert('skill survives at STRONG after résumé removal', afterResumeDelete?.highestStrength === 'STRONG')

  // Removing the last evidence must orphan-clean the StudentSkill.
  await prisma.evidence.deleteMany({ where: { userId: user.id, skillId: skill.id } })
  await syncStudentSkills(user.id)
  const orphaned = await prisma.studentSkill.findFirst({ where: { userId: user.id, skillId: skill.id } })
  assert('skill with no remaining evidence is removed', orphaned === null)

  await prisma.user.delete({ where: { id: user.id } })
  await prisma.skill.delete({ where: { id: skill.id } })
  console.log('cleanup ok')
}

main()
  .catch((e) => {
    console.error('FAILED:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
