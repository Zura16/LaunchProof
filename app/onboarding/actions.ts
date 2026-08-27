'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { studentInfoSchema, careerGoalsSchema, manualJobSchema } from '@/schemas/onboarding'
import { saveResumeFile, deleteResumeFile, ResumeUploadError } from '@/lib/services/resume-storage.service'
import { extractPdfText, PdfExtractionError } from '@/lib/services/pdf-text.service'
import { createManualSavedJob } from '@/lib/services/saved-jobs.service'

export type ActionState = { error?: string } | undefined

export async function saveStudentInfo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  const parsed = studentInfoSchema.safeParse({
    fullName: formData.get('fullName'),
    university: formData.get('university'),
    degree: formData.get('degree'),
    major: formData.get('major'),
    graduationDate: formData.get('graduationDate'),
    academicYear: formData.get('academicYear'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.studentProfile.upsert({
    where: { userId: user.id },
    update: parsed.data,
    create: {
      userId: user.id,
      ...parsed.data,
      preferredJobTypes: [],
      preferredLocations: [],
      remotePreference: '',
      workAuthorization: '',
      targetRoleCategories: [],
    },
  })

  revalidatePath('/onboarding')
  redirect('/onboarding?step=2')
}

export async function saveCareerGoals(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  const parsed = careerGoalsSchema.safeParse({
    targetRoleCategories: formData.getAll('targetRoleCategories'),
    preferredJobTypes: formData.getAll('preferredJobTypes'),
    preferredLocations: (formData.get('preferredLocations') as string)
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    remotePreference: formData.get('remotePreference'),
    workAuthorization: formData.get('workAuthorization'),
    sponsorshipRequired: formData.get('sponsorshipRequired') === 'on',
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.studentProfile.update({
    where: { userId: user.id },
    data: parsed.data,
  })

  revalidatePath('/onboarding')
  redirect('/onboarding?step=3')
}

export async function uploadResumeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { error: 'Choose a PDF file to upload.' }
  }

  let storedUrl: string | undefined
  try {
    const { fileUrl, fileName } = await saveResumeFile(user.id, file)
    storedUrl = fileUrl
    const rawText = await extractPdfText(fileUrl)

    await prisma.resume.create({
      data: { userId: user.id, fileName, fileUrl, rawText },
    })
  } catch (e) {
    if (storedUrl) await deleteResumeFile(storedUrl)
    if (e instanceof ResumeUploadError || e instanceof PdfExtractionError) return { error: e.message }
    throw e
  }

  revalidatePath('/onboarding')
  redirect('/onboarding?step=4')
}

export async function saveOnboardingJob(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  const parsed = manualJobSchema.safeParse({
    company: formData.get('company'),
    title: formData.get('title'),
    location: formData.get('location'),
    url: formData.get('url'),
    description: formData.get('description'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  await createManualSavedJob(user.id, parsed.data)
  revalidatePath('/onboarding')
  return undefined
}

export async function completeOnboarding(_prev: ActionState, _formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  const savedJobCount = await prisma.savedJob.count({ where: { userId: user.id } })
  if (savedJobCount < 3) {
    return { error: 'Save at least 3 target jobs before finishing setup.' }
  }

  await prisma.studentProfile.update({
    where: { userId: user.id },
    data: { onboardingCompletedAt: new Date() },
  })

  redirect('/dashboard')
}
