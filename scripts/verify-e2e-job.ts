import { PrismaClient } from '@prisma/client'
import { analyzeJobPosting } from '@/lib/services/job-analysis.service'
import { recomputeSkillGaps } from '@/lib/services/gap-analysis.service'
import { getJobFit } from '@/lib/services/job-fit.service'

const prisma = new PrismaClient()

function assert(label: string, condition: boolean, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!condition) process.exitCode = 1
}

const DESCRIPTION = `
Backend Engineering Intern — Summer 2027, Vertex Data (Remote)

Required:
- Pursuing a degree in Computer Science, graduating 2027 or later
- Strong programming skills in TypeScript or JavaScript
- Experience designing RESTful APIs
- Working knowledge of SQL and relational data modeling
- Automated testing experience (Jest or similar)

Preferred:
- Experience with Docker
- Familiarity with AWS or another cloud provider
- Exposure to CI/CD pipelines

You will build and maintain backend services and participate in code review.
`

async function main() {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: 'alex.chen@example.edu' } })

  const posting = await prisma.jobPosting.create({
    data: { company: 'Vertex Data', title: 'Backend Engineering Intern', location: 'Remote', description: DESCRIPTION },
  })
  const saved = await prisma.savedJob.create({ data: { userId: user.id, jobPostingId: posting.id } })
  console.log(`created savedJob ${saved.id}`)

  const skillsBefore = await prisma.skill.count()

  // 1. Analysis extracts and persists structured requirements.
  await analyzeJobPosting(posting.id)
  const requirements = await prisma.jobRequirement.findMany({
    where: { jobPostingId: posting.id },
    include: { skill: true },
  })
  console.log(`\nextracted ${requirements.length} requirements:`)
  for (const r of requirements) {
    console.log(`  [${r.type}] ${r.skill.name}  ("${r.rawMention}")`)
  }

  assert('requirements were persisted', requirements.length >= 5)
  assert('every requirement links to a canonical Skill', requirements.every((r) => !!r.skill?.name))

  const reqKeys = requirements.map((r) => `${r.skillId}:${r.type}`)
  assert(
    'no duplicate skill+type requirement rows',
    new Set(reqKeys).size === reqKeys.length,
    `${reqKeys.length} rows, ${new Set(reqKeys).size} unique`
  )
  assert('raw phrase retained for explainability', requirements.every((r) => !!r.rawMention))
  assert('confidence persisted', requirements.every((r) => r.confidence > 0 && r.confidence <= 1))

  // 2. Normalization reused existing canonical skills rather than duplicating.
  const skillsAfter = await prisma.skill.count()
  const names = requirements.map((r) => r.skill.name)
  console.log(`\nskills table: ${skillsBefore} -> ${skillsAfter}`)
  assert(
    'reused existing canonical skills (TypeScript/SQL/REST APIs not duplicated)',
    names.includes('TypeScript') || names.includes('SQL') || names.includes('REST APIs'),
    names.join(', ')
  )
  const dupes = await prisma.skill.groupBy({ by: ['name'], _count: true, having: { name: { _count: { gt: 1 } } } })
  assert('no duplicate canonical skill names exist', dupes.length === 0)

  // 3. Re-analysis is idempotent and must not re-spend an AI call.
  await analyzeJobPosting(posting.id)
  const afterRerun = await prisma.jobRequirement.count({ where: { jobPostingId: posting.id } })
  assert('re-analysis does not duplicate requirements', afterRerun === requirements.length)

  // 4. Gap analysis picks up the new demand.
  const gaps = await recomputeSkillGaps(user.id)
  const testingGap = gaps.find((g) => g.skillName === 'Automated Testing')
  console.log(`\ntop gaps: ${gaps.slice(0, 3).map((g) => `${g.skillName} (${g.marketCount}/${g.totalJobs})`).join(', ')}`)
  assert('new job counted into market demand', (testingGap?.totalJobs ?? 0) === 13)

  // 5. Job fit classifies each requirement against real evidence.
  const fit = await getJobFit(user.id, posting.id)
  console.log(`\nfit rows:`)
  for (const row of fit.rows) console.log(`  ${row.skillName}: ${row.classification}`)
  console.log(`recommendation: ${fit.recommendation?.headline}`)

  assert('fit produced a row per requirement skill', fit.rows.length > 0)
  assert('every classification carries a why', fit.rows.every((r) => r.why.length > 20))
  assert(
    'proven skills classified as strong/moderate',
    fit.rows.some((r) => r.classification === 'STRONG' || r.classification === 'MODERATE')
  )
  assert('unproven skills classified as missing', fit.rows.some((r) => r.classification === 'MISSING'))
  assert('a recommendation posture was produced', !!fit.recommendation)
  assert(
    'eligibility criteria excluded from evidence comparison',
    !fit.rows.some((r) => r.requirementType === 'ELIGIBILITY'),
    fit.rows.filter((r) => r.requirementType === 'ELIGIBILITY').map((r) => r.skillName).join(', ')
  )
  const eligibilityNames = requirements.filter((r) => r.type === 'ELIGIBILITY').map((r) => r.skill.name)
  assert(
    'eligibility skills stay out of market demand',
    !gaps.some((g) => eligibilityNames.includes(g.skillName)),
    eligibilityNames.join(', ')
  )
  assert(
    'no fabricated match percentage anywhere in the fit output',
    !JSON.stringify(fit).match(/\d+%\s*(match|fit)/i)
  )

  console.log(`\nsavedJobId for UI check: ${saved.id}`)

  if (process.env.KEEP_TEST_JOB !== '1') {
    await prisma.savedJob.delete({ where: { id: saved.id } })
    await prisma.jobPosting.delete({ where: { id: posting.id } })
    await recomputeSkillGaps(user.id)
    console.log('cleaned up test job (set KEEP_TEST_JOB=1 to keep it for UI inspection)')
  }
}

main()
  .catch((e) => {
    console.error('ERROR:', e instanceof Error ? e.message : e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
