import { z } from 'zod'
import { generateStructured } from '@/lib/ai/generate-structured'

export const projectPlanDraftSchema = z.object({
  objective: z.string().min(1).max(600),
  whyItMatters: z.string().min(1).max(800),
  technicalRequirements: z.array(z.string().max(200)).max(10).default([]),
  milestones: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        description: z.string().max(400).default(''),
        tasks: z.array(z.string().min(1).max(200)).min(1).max(8),
      })
    )
    .min(1)
    .max(6),
  definitionOfDone: z.array(z.string().max(200)).min(1).max(10),
  expectedEvidence: z.array(z.string().max(200)).min(1).max(10),
})

export type ProjectPlanDraft = z.infer<typeof projectPlanDraftSchema>

const SYSTEM_PROMPT = `You write concrete engineering project plans for a student improving a portfolio project so it demonstrates specific skills.

You are given: the skills to demonstrate, the target repository (if any), and why those skills matter. Produce a plan that a student can actually execute.

Rules:
- Every task must be a concrete, checkable engineering action ("Configure Jest with ts-jest", "Write integration tests for the /events endpoints"). Never vague advice like "learn testing" or "improve code quality".
- Order milestones so each builds on the last.
- expectedEvidence must describe the artifact that will exist afterwards and prove the skill (a test suite in the repo, a CI workflow file, a live deployment URL) — not a feeling of confidence.
- Do not invent details about the student's existing codebase beyond what you are told. Refer to the repository generically where you are unsure.
- Do not promise employment outcomes, interview success, or that this guarantees anything.
- Keep it to at most 4 milestones.

Respond with a JSON object in exactly this shape, with every key present:

{
  "objective": "string",
  "whyItMatters": "string",
  "technicalRequirements": ["string"],
  "milestones": [ { "title": "string", "description": "string", "tasks": ["string"] } ],
  "definitionOfDone": ["string"],
  "expectedEvidence": ["string"]
}`

export async function draftProjectPlan(input: {
  skills: string[]
  targetRepoName: string | null
  reasoning: string
}): Promise<ProjectPlanDraft> {
  const user = [
    `Skills to demonstrate: ${input.skills.join(', ') || 'general software engineering'}`,
    input.targetRepoName
      ? `Target repository: ${input.targetRepoName} (an existing project the student built)`
      : 'No existing repository — this will be a new project.',
    `Why these skills matter: ${input.reasoning}`,
  ].join('\n')

  return generateStructured({ system: SYSTEM_PROMPT, user, schema: projectPlanDraftSchema })
}
