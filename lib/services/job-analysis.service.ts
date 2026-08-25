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

  for (const req of result.requirements) {
    const skill = await resolveCanonicalSkill({
      rawPhrase: req.rawPhrase,
      canonicalSkillGuess: req.canonicalSkillGuess,
      skillCategory: req.skillCategory,
    })

    await prisma.jobRequirement.create({
      data: {
        jobPostingId,
        skillId: skill.id,
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
