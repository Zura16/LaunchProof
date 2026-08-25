import { z } from 'zod'

export const SKILL_CATEGORIES = [
  'LANGUAGE',
  'FRAMEWORK',
  'DATABASE',
  'CLOUD',
  'DEVOPS',
  'TESTING',
  'CONCEPT',
  'TOOL',
  'OTHER',
] as const

export const REQUIREMENT_TYPES = ['REQUIRED', 'PREFERRED', 'RESPONSIBILITY', 'ELIGIBILITY'] as const
export const REQUIREMENT_IMPORTANCE = ['HIGH', 'MEDIUM', 'LOW'] as const

export const extractedRequirementSchema = z.object({
  rawPhrase: z.string().min(1).max(200).describe('The exact phrase as it appeared in the posting'),
  canonicalSkillGuess: z
    .string()
    .min(1)
    .max(80)
    .describe('The standard industry name for this technology/skill, e.g. "PostgreSQL" not "Postgres"'),
  skillCategory: z.enum(SKILL_CATEGORIES),
  requirementType: z.enum(REQUIREMENT_TYPES),
  importance: z.enum(REQUIREMENT_IMPORTANCE),
  confidence: z.number().min(0).max(1),
})

export const jobAnalysisResultSchema = z.object({
  requirements: z.array(extractedRequirementSchema).max(40),
})

export type ExtractedRequirement = z.infer<typeof extractedRequirementSchema>
export type JobAnalysisResult = z.infer<typeof jobAnalysisResultSchema>
