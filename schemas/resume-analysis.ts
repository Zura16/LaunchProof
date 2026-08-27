import { z } from 'zod'

export const resumeEducationSchema = z.object({
  institution: z.string().min(1).max(200),
  degree: z.string().max(200).optional().default(''),
  field: z.string().max(200).optional().default(''),
  graduationDate: z.string().max(60).optional().default(''),
  gpa: z.string().max(20).optional().default(''),
})

export const resumeExperienceSchema = z.object({
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  startDate: z.string().max(60).optional().default(''),
  endDate: z.string().max(60).optional().default(''),
  bullets: z.array(z.string().max(600)).max(15).default([]),
  // Only technologies the résumé actually ties to THIS role.
  skillsUsed: z.array(z.string().max(80)).max(30).default([]),
})

export const resumeProjectSchema = z.object({
  title: z.string().min(1).max(200),
  role: z.string().max(200).optional().default(''),
  description: z.string().max(1200).optional().default(''),
  bullets: z.array(z.string().max(600)).max(15).default([]),
  technologies: z.array(z.string().max(80)).max(30).default([]),
  repoUrl: z.string().max(500).optional().default(''),
  liveUrl: z.string().max(500).optional().default(''),
})

export const resumeAnalysisResultSchema = z.object({
  education: z.array(resumeEducationSchema).max(10).default([]),
  experiences: z.array(resumeExperienceSchema).max(20).default([]),
  projects: z.array(resumeProjectSchema).max(20).default([]),
  // Skills listed in a dedicated skills section, NOT attached to any
  // project or role. Tracked separately because a bare list is a weaker
  // claim than a skill tied to something the student actually built.
  listedSkills: z.array(z.string().max(80)).max(100).default([]),
  certifications: z.array(z.string().max(200)).max(20).default([]),
})

export type ResumeEducation = z.infer<typeof resumeEducationSchema>
export type ResumeAnalysisResult = z.infer<typeof resumeAnalysisResultSchema>
