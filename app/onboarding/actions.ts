'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { studentInfoSchema, careerGoalsSchema } from '@/schemas/onboarding'
import { saveResumeFile, deleteResumeFile, ResumeUploadError } from '@/lib/services/resume-storage.service'
import { extractPdfTextFromBuffer, PdfExtractionError } from '@/lib/services/pdf-text.service'

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
    const { fileUrl, fileName, buffer } = await saveResumeFile(user.id, file)
    storedUrl = fileUrl
    const rawText = await extractPdfTextFromBuffer(buffer)

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

/**
 * Final onboarding step: which companies the student is aiming at.
 *
 * This replaced a step that required pasting three full job descriptions
 * before the app could be used at all. Now that Discover polls company job
 * boards directly, naming companies is both less work and more useful —
 * the feed can surface their roles instead of the student transcribing them.
 */
export async function saveTargetCompanies(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()

  const companies = Array.from(
    new Set(
      formData
        .getAll('companies')
        .map((c) => String(c).trim())
        .filter((c) => c.length > 0 && c.length <= 120)
    )
  ).slice(0, 100)

  await prisma.studentProfile.update({
    where: { userId: user.id },
    data: { targetCompanies: companies, onboardingCompletedAt: new Date() },
  })

  revalidatePath('/discover')
  revalidatePath('/dashboard')
  redirect('/discover')
}
