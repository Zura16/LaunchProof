import { prisma } from '@/lib/db/prisma'
import { isAIConfigured } from '@/lib/ai/client'
import { draftProjectPlan, type ProjectPlanDraft } from '@/lib/ai/project-plan'
import type { SkillCategory } from '@prisma/client'

// Deterministic milestone templates. These are the fallback when AI is
// unavailable or its output fails validation — a student should always be
// able to turn a recommendation into a real, actionable plan, with or
// without an API key.
const TASK_TEMPLATES: Partial<Record<SkillCategory, { title: string; tasks: string[] }>> = {
  TESTING: {
    title: 'Add an automated test suite',
    tasks: [
      'Configure a test runner for the project',
      'Write unit tests covering the core business logic',
      'Add integration tests for the main API routes',
      'Record the passing test run in the README',
    ],
  },
  DATABASE: {
    title: 'Add a real database implementation',
    tasks: [
      'Design a relational schema for the feature area',
      'Write and run an initial migration',
      'Seed representative development data',
      'Add at least one non-trivial query with an index',
    ],
  },
  CLOUD: {
    title: 'Deploy the project',
    tasks: [
      'Choose a cloud provider and create the deployment target',
      'Configure environment variables and secrets for the deployment',
      'Deploy the application and verify a live health-check endpoint',
      'Add the live URL to the repository README',
    ],
  },
  DEVOPS: {
    title: 'Automate build and delivery',
    tasks: [
      'Add a CI workflow that runs on every pull request',
      'Run the test suite and linter in CI',
      'Document the pipeline in the README',
    ],
  },
}

const DEFAULT_MILESTONE = {
  title: 'Implement and demonstrate the skill',
  tasks: [
    'Implement the capability end to end',
    'Add tests covering the new behavior',
    'Document what was built and why in the README',
  ],
}

function buildFallbackDraft(skills: string[], categories: Map<string, SkillCategory>, repoName: string | null, reasoning: string): ProjectPlanDraft {
  const seen = new Set<SkillCategory>()
  const milestones: ProjectPlanDraft['milestones'] = []

  for (const skill of skills) {
    const category = categories.get(skill)
    const template = category ? TASK_TEMPLATES[category] : undefined
    if (template && !seen.has(category!)) {
      seen.add(category!)
      milestones.push({
        title: template.title,
        description: `Build checkable evidence for ${skill}${repoName ? ` in ${repoName}` : ''}.`,
        tasks: template.tasks,
      })
    }
  }

  if (milestones.length === 0) {
    milestones.push({
      title: DEFAULT_MILESTONE.title,
      description: `Build checkable evidence for ${skills.join(', ') || 'the targeted skills'}.`,
      tasks: DEFAULT_MILESTONE.tasks,
    })
  }

  return {
    objective: `Close the ${skills.join(', ') || 'targeted'} gap${repoName ? ` by upgrading ${repoName}` : ' with a new project'}.`,
    whyItMatters: reasoning,
    technicalRequirements: [],
    milestones: milestones.slice(0, 4),
    definitionOfDone: skills.map((s) => `${s}: a reviewer can find the artifact proving it in the repository`),
    expectedEvidence: skills.map((s) => `${s}: real, checkable artifact committed to the repository`),
  }
}

export async function generateProjectPlanFromRecommendation(recommendationId: string, userId: string) {
  const recommendation = await prisma.recommendation.findUnique({ where: { id: recommendationId } })
  if (!recommendation || recommendation.userId !== userId) {
    throw new Error('Recommendation not found')
  }

  const existing = await prisma.projectPlan.findUnique({ where: { recommendationId } })
  if (existing) return existing

  const skills = recommendation.skillsAddressed
  const skillRows = await prisma.skill.findMany({ where: { name: { in: skills } } })
  const categories = new Map(skillRows.map((s) => [s.name, s.category]))

  let draft: ProjectPlanDraft
  if (isAIConfigured()) {
    try {
      draft = await draftProjectPlan({
        skills,
        targetRepoName: recommendation.targetRepoName,
        reasoning: recommendation.reasoning,
      })
    } catch {
      // A failed or malformed AI draft must not block the student.
      draft = buildFallbackDraft(skills, categories, recommendation.targetRepoName, recommendation.reasoning)
    }
  } else {
    draft = buildFallbackDraft(skills, categories, recommendation.targetRepoName, recommendation.reasoning)
  }

  return prisma.projectPlan.create({
    data: {
      userId,
      recommendationId,
      title: recommendation.title,
      objective: draft.objective,
      whyItMatters: draft.whyItMatters,
      targetRepoName: recommendation.targetRepoName,
      skillsTargeted: skills,
      definitionOfDone: draft.definitionOfDone,
      expectedEvidence: draft.expectedEvidence,
      milestones: {
        create: draft.milestones.map((m, i) => ({
          order: i + 1,
          title: m.title,
          description: m.description,
          tasks: {
            create: m.tasks.map((t, ti) => ({ title: t, order: ti + 1 })),
          },
        })),
      },
    },
  })
}
