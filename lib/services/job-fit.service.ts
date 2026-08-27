import { prisma } from '@/lib/db/prisma'
import type { EvidenceStrength, RequirementType } from '@prisma/client'

// "Unknown" is deliberately distinct from "Missing": if the student has
// connected nothing for us to inspect, we genuinely do not know whether
// they have the skill, and claiming it is missing would be a fabrication.
export type FitClassification = EvidenceStrength | 'UNKNOWN'

export interface FitRow {
  skillId: string
  skillName: string
  requirementType: RequirementType
  classification: FitClassification
  why: string
  supportingArtifacts: string[]
}

export interface JobFit {
  rows: FitRow[]
  hasEvidenceCorpus: boolean
  recommendation: { headline: string; reasoning: string } | null
}

const REQUIREMENT_PHRASE: Record<RequirementType, string> = {
  REQUIRED: 'a required qualification',
  PREFERRED: 'a preferred qualification',
  RESPONSIBILITY: 'a responsibility of the role',
  ELIGIBILITY: 'an eligibility criterion',
}

function buildWhy(input: {
  skillName: string
  requirementType: RequirementType
  classification: FitClassification
  artifacts: string[]
  hasEvidenceCorpus: boolean
}): string {
  const { skillName, requirementType, classification, artifacts, hasEvidenceCorpus } = input
  const appears = `This skill appears in the job description as ${REQUIREMENT_PHRASE[requirementType]}.`

  if (classification === 'UNKNOWN') {
    return `${appears} You have not connected a résumé or GitHub account yet, so LaunchProof cannot tell whether you have evidence for ${skillName}.`
  }

  if (classification === 'MISSING') {
    return hasEvidenceCorpus
      ? `${appears} No supporting evidence for ${skillName} was found in your analyzed repositories or résumé.`
      : `${appears} Nothing has been analyzed yet that could supply evidence for ${skillName}.`
  }

  const sources = artifacts.length > 0 ? ` Supporting evidence: ${artifacts.join('; ')}.` : ''

  switch (classification) {
    case 'STRONG':
      return `${appears} You have strong, checkable evidence for ${skillName}.${sources}`
    case 'MODERATE':
      return `${appears} You have real evidence for ${skillName}, but it does not yet demonstrate depth.${sources}`
    case 'WEAK':
      return `${appears} The evidence found for ${skillName} is thin.${sources}`
    case 'SELF_REPORTED':
      return `${appears} ${skillName} currently appears only as a self-reported claim, with no artifact backing it.${sources}`
  }
}

// Deliberately never produces a match percentage or a probability of being
// hired — only a plain-language posture and the reasoning behind it.
function buildRecommendation(rows: FitRow[]): JobFit['recommendation'] {
  const ranked = rows.filter((r) => r.requirementType === 'REQUIRED' || r.requirementType === 'PREFERRED')
  if (ranked.length === 0) return null

  const required = ranked.filter((r) => r.requirementType === 'REQUIRED')
  const unknownCount = ranked.filter((r) => r.classification === 'UNKNOWN').length

  if (unknownCount === ranked.length) {
    return {
      headline: 'Connect your work to assess this role',
      reasoning:
        'LaunchProof has nothing to compare this posting against yet. Upload your résumé or connect GitHub so it can tell which of these requirements you already have evidence for.',
    }
  }

  const proven = (r: FitRow) => r.classification === 'STRONG' || r.classification === 'MODERATE'
  const provenRequired = required.filter(proven).length
  const gapRequired = required.filter((r) => r.classification === 'MISSING').length

  if (required.length > 0 && provenRequired === required.length) {
    return {
      headline: 'Apply now',
      reasoning:
        'You have supporting evidence for every required qualification listed in this posting. Remaining gaps are in preferred qualifications, which are not stated as mandatory.',
    }
  }

  if (gapRequired > 0 && provenRequired >= gapRequired) {
    return {
      headline: 'Apply now while improving',
      reasoning: `You have evidence for most of this role's core requirements, but ${gapRequired} required qualification${
        gapRequired === 1 ? ' currently lacks' : 's currently lack'
      } supporting evidence. Those gaps are worth closing in parallel rather than waiting to apply.`,
    }
  }

  return {
    headline: 'Build evidence before applying',
    reasoning: `${gapRequired} of this role's ${required.length} required qualification${
      required.length === 1 ? '' : 's'
    } currently ${gapRequired === 1 ? 'has' : 'have'} no supporting evidence in your projects or résumé. Closing the highest-priority of those first will make this application materially stronger.`,
  }
}

export async function getJobFit(userId: string, jobPostingId: string): Promise<JobFit> {
  const [requirements, studentSkills, evidences] = await Promise.all([
    prisma.jobRequirement.findMany({
      where: { jobPostingId },
      include: { skill: true },
    }),
    prisma.studentSkill.findMany({ where: { userId } }),
    prisma.evidence.findMany({ where: { userId } }),
  ])

  const hasEvidenceCorpus = evidences.length > 0
  const strengthBySkillId = new Map(studentSkills.map((s) => [s.skillId, s.highestStrength]))

  const artifactsBySkillId = new Map<string, string[]>()
  for (const e of evidences) {
    const list = artifactsBySkillId.get(e.skillId) ?? []
    list.push(e.description)
    artifactsBySkillId.set(e.skillId, list)
  }

  // Eligibility criteria (degree field, graduation window, work
  // authorization) are not skills a student builds evidence for. Showing
  // "Computer Science — Missing" to a CS student would be nonsense, so
  // they are surfaced in the Requirements section only.
  const comparable = requirements.filter((r) => r.type !== 'ELIGIBILITY')

  // One row per skill — a posting that mentions a skill twice shouldn't
  // list it twice. REQUIRED wins over PREFERRED when both appear.
  const bySkill = new Map<string, (typeof requirements)[number]>()
  for (const req of comparable) {
    const existing = bySkill.get(req.skillId)
    if (!existing || (existing.type !== 'REQUIRED' && req.type === 'REQUIRED')) {
      bySkill.set(req.skillId, req)
    }
  }

  const rows: FitRow[] = Array.from(bySkill.values()).map((req) => {
    const stored = strengthBySkillId.get(req.skillId)
    const classification: FitClassification = stored ?? (hasEvidenceCorpus ? 'MISSING' : 'UNKNOWN')
    const artifacts = artifactsBySkillId.get(req.skillId) ?? []

    return {
      skillId: req.skillId,
      skillName: req.skill.name,
      requirementType: req.type,
      classification,
      supportingArtifacts: artifacts,
      why: buildWhy({
        skillName: req.skill.name,
        requirementType: req.type,
        classification,
        artifacts,
        hasEvidenceCorpus,
      }),
    }
  })

  const ORDER: Record<FitClassification, number> = {
    STRONG: 0,
    MODERATE: 1,
    WEAK: 2,
    SELF_REPORTED: 3,
    MISSING: 4,
    UNKNOWN: 5,
  }
  rows.sort((a, b) => ORDER[a.classification] - ORDER[b.classification] || a.skillName.localeCompare(b.skillName))

  return { rows, hasEvidenceCorpus, recommendation: buildRecommendation(rows) }
}
