import { prisma } from '@/lib/db/prisma'
import { analyzeResumeText } from '@/lib/ai/resume-analysis'
import { extractPdfText } from '@/lib/services/pdf-text.service'
import { resolveCanonicalSkill } from '@/lib/services/skill-normalization.service'
import { syncStudentSkills } from '@/lib/services/evidence-sync.service'
import { refreshDerivedInsights } from '@/lib/services/recommendation-engine.service'
import type { ResumeAnalysisResult } from '@/schemas/resume-analysis'
import type { EvidenceSourceType, EvidenceStrength } from '@prisma/client'

// A résumé is a self-report. Nothing in it can be verified by LaunchProof,
// so résumé-derived evidence is deliberately capped:
//   - a skill tied to a described project or role -> WEAK
//     (it is a claim about a real, named artifact, but unverified)
//   - a skill that only appears in a bare skills list -> SELF_REPORTED
// GitHub repository analysis can raise these to MODERATE/STRONG because
// there is actual inspectable code behind them.
const PROJECT_EVIDENCE_STRENGTH: EvidenceStrength = 'WEAK'
const LISTED_SKILL_EVIDENCE_STRENGTH: EvidenceStrength = 'SELF_REPORTED'

interface SkillClaim {
  name: string
  strength: EvidenceStrength
  sourceType: EvidenceSourceType
  description: string
  evidenceUrl?: string
  citation: string
}

/**
 * Turn a parsed résumé into Evidence rows. Shared by the live analysis
 * pipeline and the demo seed so both derive evidence identically.
 * Replaces any evidence previously derived from this résumé.
 */
export async function persistResumeEvidence(userId: string, resumeId: string, result: ResumeAnalysisResult) {
  const claims: SkillClaim[] = []

  for (const project of result.projects) {
    for (const tech of project.technologies) {
      claims.push({
        name: tech,
        strength: PROJECT_EVIDENCE_STRENGTH,
        sourceType: 'RESUME_PROJECT',
        description: `Listed as a technology used in the résumé project "${project.title}".`,
        evidenceUrl: project.repoUrl || project.liveUrl || undefined,
        citation: `Résumé project: ${project.title}`,
      })
    }
  }

  for (const exp of result.experiences) {
    for (const skill of exp.skillsUsed) {
      claims.push({
        name: skill,
        strength: PROJECT_EVIDENCE_STRENGTH,
        sourceType: 'WORK_EXPERIENCE',
        description: `Listed as a skill used as ${exp.role} at ${exp.company}.`,
        citation: `Résumé experience: ${exp.role}, ${exp.company}`,
      })
    }
  }

  for (const skill of result.listedSkills) {
    claims.push({
      name: skill,
      strength: LISTED_SKILL_EVIDENCE_STRENGTH,
      sourceType: 'MANUAL',
      description: 'Appears in the résumé skills list, but is not tied to any described project or role.',
      citation: 'Résumé skills section',
    })
  }

  await prisma.evidence.deleteMany({
    where: { userId, sourceId: resumeId, sourceType: { in: ['RESUME_PROJECT', 'WORK_EXPERIENCE', 'MANUAL'] } },
  })

  // One Evidence row per skill: keep the strongest claim, but record every
  // place in the résumé that mentioned it.
  const bySkillName = new Map<string, { claim: SkillClaim; citations: string[] }>()
  for (const claim of claims) {
    const key = claim.name.trim().toLowerCase()
    if (!key) continue
    const existing = bySkillName.get(key)
    if (!existing) {
      bySkillName.set(key, { claim, citations: [claim.citation] })
    } else {
      if (!existing.citations.includes(claim.citation)) existing.citations.push(claim.citation)
      if (claim.strength === PROJECT_EVIDENCE_STRENGTH) existing.claim = claim
    }
  }

  for (const { claim, citations } of bySkillName.values()) {
    const skill = await resolveCanonicalSkill({
      rawPhrase: claim.name,
      canonicalSkillGuess: claim.name,
      skillCategory: 'OTHER',
    })

    await prisma.evidence.create({
      data: {
        userId,
        skillId: skill.id,
        sourceType: claim.sourceType,
        sourceId: resumeId,
        strength: claim.strength,
        description: claim.description,
        evidenceUrl: claim.evidenceUrl,
        metadata: { citations },
      },
    })
  }
}

export async function analyzeResume(resumeId: string, userId: string) {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } })
  if (!resume || resume.userId !== userId) {
    throw new Error('Résumé not found')
  }

  const rawText = resume.rawText?.trim() ? resume.rawText : await extractPdfText(resume.fileUrl)
  const result = await analyzeResumeText(rawText)

  await prisma.$transaction([
    prisma.experience.deleteMany({ where: { resumeId } }),
    prisma.resumeProject.deleteMany({ where: { resumeId } }),
  ])

  await prisma.resume.update({
    where: { id: resumeId },
    data: {
      rawText,
      parsedContent: result,
      experiences: {
        create: result.experiences.map((e) => ({
          company: e.company,
          role: e.role,
          startDate: e.startDate || null,
          endDate: e.endDate || null,
          description: '',
          bullets: e.bullets,
          skillsUsed: e.skillsUsed,
        })),
      },
      projects: {
        create: result.projects.map((p) => ({
          title: p.title,
          role: p.role || null,
          description: p.description,
          bullets: p.bullets,
          technologies: p.technologies,
          repoUrl: p.repoUrl || null,
          liveUrl: p.liveUrl || null,
        })),
      },
    },
  })

  await persistResumeEvidence(userId, resumeId, result)

  await syncStudentSkills(userId)
  await refreshDerivedInsights(userId)

  return result
}

// Removing a résumé must also remove what it claimed, or the student keeps
// credit for evidence that no longer exists.
export async function clearResumeEvidence(resumeId: string, userId: string) {
  await prisma.evidence.deleteMany({
    where: { userId, sourceId: resumeId, sourceType: { in: ['RESUME_PROJECT', 'WORK_EXPERIENCE', 'MANUAL'] } },
  })
  await syncStudentSkills(userId)
  await refreshDerivedInsights(userId)
}
