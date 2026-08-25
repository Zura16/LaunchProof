import { generateStructured } from '@/lib/ai/generate-structured'
import { jobAnalysisResultSchema, type JobAnalysisResult } from '@/schemas/job-analysis'

const SYSTEM_PROMPT = `You are a technical recruiter's assistant. You extract structured skill requirements from a single software engineering job posting.

For each distinct technical skill, language, framework, database, cloud/DevOps tool, testing technology, or engineering concept mentioned, output one entry with:
- rawPhrase: the exact wording used in the posting
- canonicalSkillGuess: the standard industry name (e.g. "Postgres" -> "PostgreSQL", "JS" -> "JavaScript", "Node" -> "Node.js", "RESTful APIs" -> "REST APIs"). Do not merge genuinely distinct technologies into one.
- skillCategory: one of LANGUAGE, FRAMEWORK, DATABASE, CLOUD, DEVOPS, TESTING, CONCEPT, TOOL, OTHER
- requirementType: REQUIRED (explicitly required/must-have), PREFERRED (nice-to-have/preferred/bonus), RESPONSIBILITY (mentioned as part of what the role will do, not stated as a requirement), or ELIGIBILITY (work authorization, degree, GPA, class standing, or similar eligibility criteria)
- importance: HIGH, MEDIUM, or LOW, based on how central the skill is to the role
- confidence: 0 to 1, how confident you are in this classification

Only extract genuine technical skills and eligibility criteria — do not extract generic words like "communication" or "teamwork" unless they are the actual subject of a requirement. Do not extract every technology-sounding word; only extract what is actually being asked for.

Respond with a JSON object of the shape { "requirements": [ ... ] }.`

export async function analyzeJobDescription(description: string): Promise<JobAnalysisResult> {
  return generateStructured({
    system: SYSTEM_PROMPT,
    user: description,
    schema: jobAnalysisResultSchema,
  })
}
