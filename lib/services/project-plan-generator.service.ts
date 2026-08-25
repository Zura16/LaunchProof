import { prisma } from '@/lib/db/prisma'
import type { Recommendation, SkillCategory } from '@prisma/client'

// Deterministic milestone templates keyed by skill category. AI-generated
// wording (Phase 7) can later enrich these tasks with project-specific
// detail; this keeps a real, working project plan available without an
// LLM call in the loop.
const TASK_TEMPLATES: Partial<Record<SkillCategory, string[]>> = {
  TESTING: ['Configure a test runner for the project', 'Write unit tests for core business logic', 'Add integration tests covering the main API routes'],
  DATABASE: ['Design a relational schema for the feature area', 'Write and run a migration', 'Seed representative development data'],
  CLOUD: ['Deploy the project to a cloud provider', 'Configure environment variables for the deployment', 'Verify a live health-check endpoint'],
  DEVOPS: ['Write a CI workflow that runs on every pull request', 'Add automated build and lint checks', 'Document the deployment process in the README'],
}

const DEFAULT_TASKS = ['Implement the feature end to end', 'Add tests covering the new behavior', 'Update the README with usage notes']

export async function generateProjectPlanFromRecommendation(recommendationId: string, userId: string) {
  const recommendation = await prisma.recommendation.findUnique({ where: { id: recommendationId } })
  if (!recommendation || recommendation.userId !== userId) {
    throw new Error('Recommendation not found')
  }

  const existing = await prisma.projectPlan.findUnique({ where: { recommendationId } })
  if (existing) return existing

  const skills = await prisma.skill.findMany({ where: { name: { in: recommendation.skillsAddressed } } })
  const skillByName = new Map(skills.map((s) => [s.name, s]))

  const milestones = recommendation.skillsAddressed.map((skillName, i) => {
    const category = skillByName.get(skillName)?.category
    const tasks = (category && TASK_TEMPLATES[category]) || DEFAULT_TASKS
    return {
      order: i + 1,
      title: `Add ${skillName}`,
      description: `Build real, checkable evidence for ${skillName}${recommendation.targetRepoName ? ` in ${recommendation.targetRepoName}` : ''}.`,
      tasks,
    }
  })

  return prisma.projectPlan.create({
    data: {
      userId,
      recommendationId,
      title: recommendation.title,
      objective: `Close the ${recommendation.skillsAddressed.join(', ') || 'targeted'} gap${recommendation.targetRepoName ? ` by upgrading ${recommendation.targetRepoName}` : ''}.`,
      whyItMatters: recommendation.reasoning,
      targetRepoName: recommendation.targetRepoName,
      skillsTargeted: recommendation.skillsAddressed,
      definitionOfDone: recommendation.skillsAddressed.map((s) => `${s}: evidence upgraded to at least MODERATE strength`),
      expectedEvidence: recommendation.skillsAddressed.map((s) => `${s}: real, checkable artifact in the repository`),
      milestones: { create: milestones },
    },
  })
}
