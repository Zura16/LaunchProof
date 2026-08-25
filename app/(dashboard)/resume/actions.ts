'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { saveResumeFile, deleteResumeFile, ResumeUploadError } from '@/lib/services/resume-storage.service'
import type { ActionState } from '@/app/onboarding/actions'

export async function uploadResumeGeneral(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { error: 'Choose a PDF file to upload.' }
  }

  try {
    const { fileUrl, fileName } = await saveResumeFile(user.id, file)
    await prisma.resume.create({
      data: { userId: user.id, fileName, fileUrl, rawText: '' },
    })
  } catch (e) {
    if (e instanceof ResumeUploadError) return { error: e.message }
    throw e
  }

  revalidatePath('/resume')
  return undefined
}

export async function deleteResumeAction(resumeId: string) {
  const user = await requireUser()
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } })
  if (!resume || resume.userId !== user.id) return

  await deleteResumeFile(resume.fileUrl)
  await prisma.resume.delete({ where: { id: resumeId } })
  revalidatePath('/resume')
}
