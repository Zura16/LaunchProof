import { prisma } from '@/lib/db/prisma'
import type { EvidenceStrength } from '@prisma/client'

const STRENGTH_RANK: Record<EvidenceStrength, number> = {
  MISSING: 0,
  SELF_REPORTED: 1,
  WEAK: 2,
  MODERATE: 3,
  STRONG: 4,
}

export function strongestOf(strengths: EvidenceStrength[]): EvidenceStrength {
  return strengths.reduce<EvidenceStrength>(
    (best, s) => (STRENGTH_RANK[s] > STRENGTH_RANK[best] ? s : best),
    'MISSING'
  )
}

// StudentSkill.highestStrength is a rollup, not an independent fact: it is
// always the strongest evidence the student has for that skill across every
// source. Rebuilding it from Evidence rows (rather than patching it in place)
// means removing a résumé or disconnecting GitHub correctly downgrades a
// skill instead of leaving a stale strength behind.
export async function syncStudentSkills(userId: string): Promise<void> {
  const evidences = await prisma.evidence.findMany({
    where: { userId },
    select: { skillId: true, strength: true },
  })

  const strongestBySkill = new Map<string, EvidenceStrength>()
  for (const e of evidences) {
    const current = strongestBySkill.get(e.skillId)
    strongestBySkill.set(e.skillId, current ? strongestOf([current, e.strength]) : e.strength)
  }

  const existing = await prisma.studentSkill.findMany({ where: { userId } })
  const existingBySkillId = new Map(existing.map((s) => [s.skillId, s]))

  const operations = []

  for (const [skillId, strength] of strongestBySkill.entries()) {
    const row = existingBySkillId.get(skillId)
    if (!row) {
      operations.push(prisma.studentSkill.create({ data: { userId, skillId, highestStrength: strength } }))
    } else if (row.highestStrength !== strength) {
      operations.push(prisma.studentSkill.update({ where: { id: row.id }, data: { highestStrength: strength } }))
    }
  }

  // A skill whose last piece of evidence disappeared is no longer a skill
  // the student can claim.
  const orphaned = existing.filter((s) => !strongestBySkill.has(s.skillId)).map((s) => s.id)
  if (orphaned.length > 0) {
    operations.push(prisma.studentSkill.deleteMany({ where: { id: { in: orphaned } } }))
  }

  if (operations.length > 0) {
    await prisma.$transaction(operations)
  }
}
