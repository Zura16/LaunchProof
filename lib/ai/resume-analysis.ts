import { generateStructured } from '@/lib/ai/generate-structured'
import { resumeAnalysisResultSchema, type ResumeAnalysisResult } from '@/schemas/resume-analysis'

const SYSTEM_PROMPT = `You extract structured information from a student's résumé. The text you receive was machine-extracted from a PDF, so spacing and line breaks may be imperfect.

Extract only what is genuinely present in the text:
- education: institutions, degree, field of study, graduation date, GPA — only if stated
- experiences: internships and jobs, with the company, role, dates, and the bullet points as written
- projects: personal or academic projects, with their description, bullets, and linked URLs if present
- listedSkills: technologies that appear ONLY in a standalone skills section and are not tied to any specific project or role
- certifications: named certifications, if any

Critical rules for this task:
- Copy bullet points essentially as written. Do not rewrite, embellish, or add accomplishments.
- Never invent metrics, percentages, dates, company names, or technologies that do not appear in the text.
- For skillsUsed and technologies, list only technologies the résumé explicitly ties to that specific role or project. If a technology only appears in a general skills list, put it in listedSkills instead — do not attach it to a project.
- If a field is not present, return an empty string or empty array. Do not guess.
- Do not infer seniority, quality, or any personal characteristic.

Respond with a JSON object matching the requested shape.`

export async function analyzeResumeText(rawText: string): Promise<ResumeAnalysisResult> {
  return generateStructured({
    system: SYSTEM_PROMPT,
    // Guard against a pathologically long PDF blowing up the request.
    user: rawText.slice(0, 24000),
    schema: resumeAnalysisResultSchema,
  })
}
