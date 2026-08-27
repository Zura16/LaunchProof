import { prisma } from '@/lib/db/prisma'
import type { EvidenceStrength } from '@prisma/client'

// How far a skill is from "proven". STRONG is 0 — no gap, no action needed.
const EVIDENCE_GAP_WEIGHT: Record<EvidenceStrength, number> = {
  MISSING: 1,
  WEAK: 0.7,
  SELF_REPORTED: 0.5,
  MODERATE: 0.3,
  STRONG: 0,
}

// A skill demanded as REQUIRED matters more than the same skill listed as
// PREFERRED. RESPONSIBILITY/ELIGIBILITY mentions are context, not a demand
// signal we rank on, so they carry no weight here.
const REQUIREMENT_WEIGHT = { REQUIRED: 1, PREFERRED: 0.5 } as const

export interface ComputedGap {
  skillId: string
  skillName: string
  marketCount: number
  totalJobs: number
  marketPercent: number
  requiredCount: number
  preferredCount: number
  currentEvidence: EvidenceStrength
  priorityScore: number
  explanation: string
}

export function priorityLabel(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 0.4) return 'High'
  if (score >= 0.15) return 'Medium'
  return 'Low'
}

function buildExplanation(input: {
  skillName: string
  marketCount: number
  totalJobs: number
  requiredCount: number
  currentEvidence: EvidenceStrength
  priority: 'High' | 'Medium' | 'Low'
  hasEvidenceCorpus: boolean
}): string {
  const { skillName, marketCount, totalJobs, requiredCount, currentEvidence, priority, hasEvidenceCorpus } = input

  const demand = `it appears in ${marketCount} of your ${totalJobs} target jobs`
  const required =
    requiredCount > 0
      ? `, including ${requiredCount} required qualification${requiredCount === 1 ? '' : 's'}`
      : ', all as preferred qualifications rather than requirements'

  let evidenceClause: string
  switch (currentEvidence) {
    case 'MISSING':
      evidenceClause = hasEvidenceCorpus
        ? 'and no supporting evidence was detected in your analyzed projects or résumé'
        : 'and you have not yet connected any work for LaunchProof to check for evidence'
      break
    case 'WEAK':
      evidenceClause = 'and the supporting evidence found so far is thin'
      break
    case 'SELF_REPORTED':
      evidenceClause = 'and it currently appears only as a self-reported claim, with no artifact backing it'
      break
    case 'MODERATE':
      evidenceClause = 'and while you have real supporting evidence, it does not yet demonstrate depth'
      break
    case 'STRONG':
      return `${skillName} is well covered: ${demand}${required}, and you already have strong supporting evidence for it.`
  }

  const lead =
    priority === 'High'
      ? `${skillName} is one of your highest-priority gaps because`
      : priority === 'Medium'
        ? `${skillName} is a moderate-priority gap because`
        : `${skillName} is a lower-priority gap because`

  return `${lead} ${demand}${required}, ${evidenceClause}.`
}

// Deterministic gap computation. Runs entirely on data already in the
// database (saved jobs, their extracted requirements, and the student's
// evidence) — no AI call, so this is cheap enough to recompute whenever
// its inputs change rather than risking a stale snapshot.
//
// Note: the product spec's conceptual formula also includes an "action
// efficiency" term. That belongs to *recommendation* ranking (upgrading an
// existing repo is cheaper than a new project), not to how large a gap is,
// so it is applied in the recommendation layer instead of here.
export async function computeSkillGaps(userId: string): Promise<ComputedGap[]> {
  const [savedJobs, studentSkills, evidenceCount] = await Promise.all([
    prisma.savedJob.findMany({
      where: { userId },
      include: { jobPosting: { include: { requirements: { include: { skill: true } } } } },
    }),
    prisma.studentSkill.findMany({ where: { userId } }),
    prisma.evidence.count({ where: { userId } }),
  ])

  const totalJobs = savedJobs.length
  if (totalJobs === 0) return []

  const hasEvidenceCorpus = evidenceCount > 0
  const strengthBySkillId = new Map(studentSkills.map((s) => [s.skillId, s.highestStrength]))

  const bySkill = new Map<
    string,
    { name: string; jobIds: Set<string>; required: number; preferred: number; weightSum: number }
  >()

  for (const saved of savedJobs) {
    // A skill can be listed more than once in one posting; count each job once.
    const seenInThisJob = new Set<string>()
    for (const req of saved.jobPosting.requirements) {
      // Eligibility criteria are not skill demand — a degree field or work
      // authorization requirement should never appear as a market skill.
      if (req.type === 'ELIGIBILITY') continue
      const entry = bySkill.get(req.skillId) ?? {
        name: req.skill.name,
        jobIds: new Set<string>(),
        required: 0,
        preferred: 0,
        weightSum: 0,
      }
      entry.jobIds.add(saved.jobPostingId)

      if (req.type === 'REQUIRED' && !seenInThisJob.has(`${req.skillId}:REQUIRED`)) {
        entry.required += 1
        entry.weightSum += REQUIREMENT_WEIGHT.REQUIRED
        seenInThisJob.add(`${req.skillId}:REQUIRED`)
      } else if (req.type === 'PREFERRED' && !seenInThisJob.has(`${req.skillId}:PREFERRED`)) {
        entry.preferred += 1
        entry.weightSum += REQUIREMENT_WEIGHT.PREFERRED
        seenInThisJob.add(`${req.skillId}:PREFERRED`)
      }

      bySkill.set(req.skillId, entry)
    }
  }

  const gaps: ComputedGap[] = []

  for (const [skillId, data] of bySkill.entries()) {
    const marketCount = data.jobIds.size
    const marketPercent = Math.round((marketCount / totalJobs) * 100)
    const currentEvidence = strengthBySkillId.get(skillId) ?? 'MISSING'

    // Average demand weight across the jobs that mention it: a skill that is
    // required everywhere scores higher than one that is merely preferred.
    const importanceFactor = data.weightSum / marketCount
    const priorityScore = (marketCount / totalJobs) * importanceFactor * EVIDENCE_GAP_WEIGHT[currentEvidence]

    gaps.push({
      skillId,
      skillName: data.name,
      marketCount,
      totalJobs,
      marketPercent,
      requiredCount: data.required,
      preferredCount: data.preferred,
      currentEvidence,
      priorityScore,
      explanation: buildExplanation({
        skillName: data.name,
        marketCount,
        totalJobs,
        requiredCount: data.required,
        currentEvidence,
        priority: priorityLabel(priorityScore),
        hasEvidenceCorpus,
      }),
    })
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore)
}

// Refresh the persisted SkillGap snapshot. Called after any mutation that
// changes the inputs (a job analyzed, a job removed, evidence changed) so
// the stored rows never drift from what the data actually says.
export async function recomputeSkillGaps(userId: string): Promise<ComputedGap[]> {
  const gaps = await computeSkillGaps(userId)

  await prisma.$transaction([
    prisma.skillGap.deleteMany({ where: { userId } }),
    prisma.skillGap.createMany({
      data: gaps.map((g) => ({
        userId,
        skillId: g.skillId,
        marketCount: g.marketCount,
        marketPercent: g.marketPercent,
        currentEvidence: g.currentEvidence,
        priorityScore: g.priorityScore,
        explanation: g.explanation,
      })),
    }),
  ])

  return gaps
}
