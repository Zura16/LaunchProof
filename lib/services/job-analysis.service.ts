import { prisma } from '@/lib/db/prisma'
import { analyzeJobDescription } from '@/lib/ai/job-analysis'
import { resolveCanonicalSkill } from '@/lib/services/skill-normalization.service'

export async function analyzeJobPosting(jobPostingId: string) {
  const jobPosting = await prisma.jobPosting.findUniqueOrThrow({
    where: { id: jobPostingId },
    include: { requirements: true },
  })

  // Persisted structured analysis already exists — never re-spend an AI
  // call on a job that's already been analyzed.
  if (jobPosting.requirements.length > 0) {
    return jobPosting
  }

  const result = await analyzeJobDescription(jobPosting.description)

  // Distinct extracted phrases routinely normalize to the same canonical
  // skill — a posting saying "automated testing experience (Jest or
  // similar)" yields both "Jest" and "automated testing", which are one
  // requirement, not two. Storing both would double-count the skill in the
  // requirements list and overstate how often the market asks for it.
  const bySkillAndType = new Map<string, { skillId: string; req: (typeof result.requirements)[number] }>()

  for (const req of result.requirements) {
    const skill = await resolveCanonicalSkill({
      rawPhrase: req.rawPhrase,
      canonicalSkillGuess: req.canonicalSkillGuess,
      skillCategory: req.skillCategory,
    })

    const key = `${skill.id}:${req.requirementType}`
    const existing = bySkillAndType.get(key)
    // Keep the highest-confidence phrasing for the same skill+type pair.
    if (!existing || req.confidence > existing.req.confidence) {
      bySkillAndType.set(key, { skillId: skill.id, req })
    }
  }

  for (const { skillId, req } of bySkillAndType.values()) {
    await prisma.jobRequirement.create({
      data: {
        jobPostingId,
        skillId,
        type: req.requirementType,
        importance: req.importance,
        rawMention: req.rawPhrase,
        confidence: req.confidence,
      },
    })
  }

  return prisma.jobPosting.update({
    where: { id: jobPostingId },
    data: { rawRequirements: result },
    include: { requirements: { include: { skill: true } } },
  })
}
