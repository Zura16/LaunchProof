import { PrismaClient } from '@prisma/client'
import { updateApplicationSchema, TERMINAL_STATUSES } from '@/schemas/application'
import type { ApplicationStatus } from '@prisma/client'

const prisma = new PrismaClient()

function assert(label: string, condition: boolean, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!condition) process.exitCode = 1
}

const isTerminal = (s: ApplicationStatus) => (TERMINAL_STATUSES as readonly string[]).includes(s)

// Mirrors the transition rules in updateApplicationStatus so they can be
// exercised without a request context.
async function applyStatus(id: string, status: ApplicationStatus) {
  const app = await prisma.application.findUniqueOrThrow({ where: { id } })
  return prisma.application.update({
    where: { id },
    data: {
      status,
      appliedDate: status === 'APPLIED' && !app.appliedDate ? new Date() : app.appliedDate,
      closedAt: isTerminal(status) ? (app.closedAt ?? new Date()) : null,
    },
  })
}

async function main() {
  const alex = await prisma.user.findUniqueOrThrow({ where: { email: 'alex.chen@example.edu' } })

  // --- Schema coercion ---
  const parsed = updateApplicationSchema.safeParse({
    status: 'APPLIED',
    appliedDate: '',
    nextInterviewDate: '2026-09-02',
    resumeId: '',
    referralContact: '  ',
    recruiterContact: 'a@b.com',
    notes: '',
    outcomeNote: '',
    rejectionStage: '',
  })
  assert('schema parses a partially empty form', parsed.success)
  if (parsed.success) {
    assert('blank dates become null', parsed.data.appliedDate === null)
    assert('real dates are parsed', parsed.data.nextInterviewDate instanceof Date)
    assert('whitespace-only text becomes null', parsed.data.referralContact === null)
    assert('provided text is kept', parsed.data.recruiterContact === 'a@b.com')
  }
  assert(
    'invalid status is rejected',
    !updateApplicationSchema.safeParse({ status: 'NOT_A_STATUS' }).success
  )
  assert(
    'malformed date is rejected',
    !updateApplicationSchema.safeParse({ status: 'APPLIED', nextInterviewDate: 'not-a-date' }).success
  )

  // --- Status transition rules on a scratch application ---
  const savedJob = await prisma.savedJob.findFirstOrThrow({ where: { userId: alex.id, application: null } })
  const app = await prisma.application.create({
    data: { userId: alex.id, savedJobId: savedJob.id, status: 'PREPARING' },
  })

  assert('new application has no applied date', app.appliedDate === null)
  assert('new application is not closed', app.closedAt === null)

  const applied = await applyStatus(app.id, 'APPLIED')
  assert('moving to APPLIED stamps the applied date', applied.appliedDate !== null)

  const firstAppliedAt = applied.appliedDate!
  const interviewing = await applyStatus(app.id, 'TECHNICAL_INTERVIEW')
  assert(
    'advancing past APPLIED preserves the original applied date',
    interviewing.appliedDate?.getTime() === firstAppliedAt.getTime()
  )
  assert('a non-terminal status leaves the application open', interviewing.closedAt === null)

  const rejected = await applyStatus(app.id, 'REJECTED')
  assert('a terminal status stamps closedAt', rejected.closedAt !== null)

  const closedAtFirst = rejected.closedAt!
  const stillRejected = await applyStatus(app.id, 'WITHDRAWN')
  assert(
    'moving between terminal statuses keeps the original close date',
    stillRejected.closedAt?.getTime() === closedAtFirst.getTime()
  )

  const reopened = await applyStatus(app.id, 'RECRUITER_SCREEN')
  assert('reopening an application clears closedAt', reopened.closedAt === null)
  assert('reopening preserves the applied date', reopened.appliedDate !== null)

  await prisma.application.delete({ where: { id: app.id } })

  // --- Authorization: a résumé belonging to another user must be refused ---
  const intruder = await prisma.user.create({
    data: { email: `app-intruder-${Date.now()}@example.test`, name: 'Intruder' },
  })
  const foreignResume = await prisma.resume.create({
    data: { userId: intruder.id, fileName: 'not-yours.pdf', fileUrl: '/uploads/resumes/x.pdf', rawText: 'x' },
  })
  const ownResume = await prisma.resume.findFirstOrThrow({ where: { userId: alex.id } })

  const resolve = async (candidateId: string, ownerId: string) => {
    const r = await prisma.resume.findUnique({ where: { id: candidateId } })
    return r && r.userId === ownerId ? r.id : null
  }
  assert('own résumé resolves', (await resolve(ownResume.id, alex.id)) === ownResume.id)
  assert("another user's résumé is refused", (await resolve(foreignResume.id, alex.id)) === null)

  await prisma.user.delete({ where: { id: intruder.id } })
  console.log('\ncleanup ok')
}

main()
  .catch((e) => {
    console.error('FAILED:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
