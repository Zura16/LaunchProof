import { z } from 'zod'

export const ACADEMIC_YEARS = ['FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR', 'GRADUATE'] as const
export const JOB_TYPES = ['INTERNSHIP', 'NEW_GRAD', 'FULL_TIME'] as const
export const REMOTE_PREFERENCES = ['IN_PERSON', 'HYBRID', 'REMOTE', 'ANY'] as const
export const WORK_AUTHORIZATIONS = ['US_CITIZEN', 'GREEN_CARD', 'F1_OPT', 'CPT', 'OTHER'] as const
export const ROLE_CATEGORIES = ['SWE', 'BACKEND', 'FRONTEND', 'FULLSTACK', 'MOBILE', 'DATA'] as const

export const studentInfoSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(120),
  university: z.string().trim().min(1, 'University is required').max(160),
  degree: z.string().trim().min(1, 'Degree is required').max(120),
  major: z.string().trim().min(1, 'Major is required').max(120),
  graduationDate: z.coerce.date(),
  academicYear: z.enum(ACADEMIC_YEARS),
})

export const careerGoalsSchema = z.object({
  targetRoleCategories: z.array(z.enum(ROLE_CATEGORIES)).min(1, 'Select at least one role category'),
  preferredJobTypes: z.array(z.enum(JOB_TYPES)).min(1, 'Select at least one'),
  preferredLocations: z.array(z.string().trim().min(1)).default([]),
  remotePreference: z.enum(REMOTE_PREFERENCES),
  workAuthorization: z.enum(WORK_AUTHORIZATIONS),
  sponsorshipRequired: z.coerce.boolean().default(false),
})

export const manualJobSchema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(160),
  title: z.string().trim().min(1, 'Job title is required').max(160),
  location: z.string().trim().max(160).optional().or(z.literal('')),
  url: z.string().trim().url().optional().or(z.literal('')),
  description: z.string().trim().min(20, 'Paste the full job description (at least 20 characters)'),
})

export type StudentInfoInput = z.infer<typeof studentInfoSchema>
export type CareerGoalsInput = z.infer<typeof careerGoalsSchema>
export type ManualJobInput = z.infer<typeof manualJobSchema>
