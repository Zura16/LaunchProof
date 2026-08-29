'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth/require-user'
import { assertNotDemoAccount, DemoAccountError } from '@/lib/auth/demo-guard'
import { prisma } from '@/lib/db/prisma'
import { saveResumeFile, deleteResumeFile, ResumeUploadError } from '@/lib/services/resume-storage.service'
import { extractPdfTextFromBuffer, PdfExtractionError } from '@/lib/services/pdf-text.service'
import { analyzeResume, clearResumeEvidence } from '@/lib/services/resume-analysis.service'
import { AIAnalysisError } from '@/lib/ai/generate-structured'
import { consumeAiQuota, refundAiQuota, RateLimitError } from '@/lib/ai/rate-limit'
import type { ActionState } from '@/app/onboarding/actions'

export async function uploadResumeGeneral(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { error: 'Choose a PDF file to upload.' }
  }

  let fileUrl: string | undefined
  try {
    const saved = await saveResumeFile(user.id, file)
    fileUrl = saved.fileUrl

    // Extract text up front from the bytes we already hold: a scanned or
    // corrupt PDF can never be analyzed, so it is better to say so now than
    // to store a dead file. Parsing the buffer also avoids reading the file
    // back out of storage.
    const rawText = await extractPdfTextFromBuffer(saved.buffer)

    await prisma.resume.create({
      data: { userId: user.id, fileName: saved.fileName, fileUrl: saved.fileUrl, rawText },
    })
  } catch (e) {
    if (fileUrl) await deleteResumeFile(fileUrl)
    if (e instanceof ResumeUploadError || e instanceof PdfExtractionError) return { error: e.message }
    throw e
  }

  revalidatePath('/resume')
  revalidatePath('/dashboard')
  return undefined
}

export async function analyzeResumeAction(resumeId: string) {
  const user = await requireUser()

  let quotaId: string
  try {
    quotaId = await consumeAiQuota(user.id, 'RESUME_ANALYSIS')
  } catch (e) {
    if (e instanceof RateLimitError) {
      redirect(`/resume?analysisError=${encodeURIComponent(e.message)}`)
    }
    throw e
  }

  try {
    await analyzeResume(resumeId, user.id)
  } catch (e) {
    await refundAiQuota(quotaId)
    if (e instanceof AIAnalysisError || e instanceof PdfExtractionError) {
      redirect(`/resume?analysisError=${encodeURIComponent(e.message)}`)
    }
    throw e
  }

  revalidatePath('/resume')
  revalidatePath('/evidence')
  revalidatePath('/dashboard')
  revalidatePath('/market-insights')
  redirect('/resume')
}

export async function deleteResumeAction(resumeId: string) {
  const user = await requireUser()
  try {
    await assertNotDemoAccount(user.id)
  } catch (e) {
    if (e instanceof DemoAccountError) redirect(`/resume?analysisError=${encodeURIComponent(e.message)}`)
    throw e
  }
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } })
  if (!resume || resume.userId !== user.id) return

  await clearResumeEvidence(resumeId, user.id)
  await deleteResumeFile(resume.fileUrl)
  await prisma.resume.delete({ where: { id: resumeId } })

  revalidatePath('/resume')
  revalidatePath('/evidence')
  revalidatePath('/dashboard')
  revalidatePath('/market-insights')
}
