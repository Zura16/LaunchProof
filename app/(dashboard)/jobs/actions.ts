'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { assertNotDemoAccount, DemoAccountError } from '@/lib/auth/demo-guard'
import { prisma } from '@/lib/db/prisma'
import { manualJobSchema } from '@/schemas/onboarding'
import { createManualSavedJob } from '@/lib/services/saved-jobs.service'
import { analyzeJobPosting } from '@/lib/services/job-analysis.service'
import { refreshDerivedInsights } from '@/lib/services/recommendation-engine.service'
import { AIAnalysisError } from '@/lib/ai/generate-structured'
import { consumeAiQuota, refundAiQuota, RateLimitError } from '@/lib/ai/rate-limit'
import type { ActionState } from '@/app/onboarding/actions'

export async function addJobAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
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
  revalidatePath('/jobs')
  redirect('/jobs')
}

export async function deleteSavedJobAction(savedJobId: string) {
  const user = await requireUser()
  try {
    await assertNotDemoAccount(user.id)
  } catch (e) {
    if (e instanceof DemoAccountError) redirect(`/jobs/${savedJobId}?analysisError=${encodeURIComponent(e.message)}`)
    throw e
  }
  const saved = await prisma.savedJob.findUnique({ where: { id: savedJobId } })
  if (!saved || saved.userId !== user.id) return

  await prisma.savedJob.delete({ where: { id: savedJobId } })
  await refreshDerivedInsights(user.id)

  revalidatePath('/jobs')
  revalidatePath('/dashboard')
  revalidatePath('/market-insights')
  revalidatePath('/evidence')
  redirect('/jobs')
}

export async function markAppliedAction(savedJobId: string) {
  const user = await requireUser()
  const saved = await prisma.savedJob.findUnique({ where: { id: savedJobId }, include: { application: true } })
  if (!saved || saved.userId !== user.id) return

  if (saved.application) {
    await prisma.application.update({
      where: { id: saved.application.id },
      data: {
        status: 'APPLIED',
        appliedDate: saved.application.appliedDate ?? new Date(),
        closedAt: null,
      },
    })
  } else {
    await prisma.application.create({
      data: { userId: user.id, savedJobId, status: 'APPLIED', appliedDate: new Date() },
    })
  }
  revalidatePath(`/jobs/${savedJobId}`)
  revalidatePath('/applications')
}

export async function analyzeJobAction(savedJobId: string) {
  const user = await requireUser()
  const saved = await prisma.savedJob.findUnique({ where: { id: savedJobId } })
  if (!saved || saved.userId !== user.id) return

  let quotaId: string
  try {
    quotaId = await consumeAiQuota(user.id, 'JOB_ANALYSIS')
  } catch (e) {
    if (e instanceof RateLimitError) {
      redirect(`/jobs/${savedJobId}?analysisError=${encodeURIComponent(e.message)}`)
    }
    throw e
  }

  try {
    await analyzeJobPosting(saved.jobPostingId)
  } catch (e) {
    // The user shouldn't lose quota because the model or network failed.
    await refundAiQuota(quotaId)
    if (e instanceof AIAnalysisError) {
      redirect(`/jobs/${savedJobId}?analysisError=${encodeURIComponent(e.message)}`)
    }
    throw e
  }

  // New requirements change the demand side of every gap.
  await refreshDerivedInsights(user.id)

  revalidatePath(`/jobs/${savedJobId}`)
  revalidatePath('/jobs')
  revalidatePath('/dashboard')
  revalidatePath('/market-insights')
  revalidatePath('/evidence')
  redirect(`/jobs/${savedJobId}`)
}
