import { z } from 'zod'

export const APPLICATION_STATUSES = [
  'SAVED',
  'PREPARING',
  'APPLIED',
  'ONLINE_ASSESSMENT',
  'RECRUITER_SCREEN',
  'TECHNICAL_INTERVIEW',
  'FINAL_INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
] as const

/** Statuses that end the process — used to stamp closedAt and to split "active" from "closed". */
export const TERMINAL_STATUSES = ['OFFER', 'REJECTED', 'WITHDRAWN'] as const

export const STATUS_LABEL: Record<(typeof APPLICATION_STATUSES)[number], string> = {
  SAVED: 'Saved',
  PREPARING: 'Preparing',
  APPLIED: 'Applied',
  ONLINE_ASSESSMENT: 'Online Assessment',
  RECRUITER_SCREEN: 'Recruiter Screen',
  TECHNICAL_INTERVIEW: 'Technical Interview',
  FINAL_INTERVIEW: 'Final Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? new Date(v) : null))
  .refine((d) => d === null || !Number.isNaN(d.getTime()), 'Enter a valid date')

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null))

export const updateApplicationSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
  appliedDate: optionalDate,
  nextInterviewDate: optionalDate,
  resumeId: optionalText(60),
  referralContact: optionalText(200),
  recruiterContact: optionalText(200),
  notes: optionalText(4000),
  outcomeNote: optionalText(2000),
  rejectionStage: optionalText(120),
})

export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>
