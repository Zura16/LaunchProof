'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { generateProjectPlanFromRecommendation } from '@/lib/services/project-plan-generator.service'
import { regenerateRecommendations } from '@/lib/services/recommendation-engine.service'
import { consumeAiQuota, refundAiQuota, RateLimitError } from '@/lib/ai/rate-limit'

export async function createProjectPlanAction(recommendationId: string) {
  const user = await requireUser()

  // Plan drafting falls back to deterministic templates when AI is
  // unavailable, but the AI path is the default and costs money, so it is
  // metered like the others.
  let quotaId: string
  try {
    quotaId = await consumeAiQuota(user.id, 'PROJECT_PLAN')
  } catch (e) {
    if (e instanceof RateLimitError) {
      redirect(`/recommendations?planError=${encodeURIComponent(e.message)}`)
    }
    throw e
  }

  let plan
  try {
    plan = await generateProjectPlanFromRecommendation(recommendationId, user.id)
  } catch (e) {
    await refundAiQuota(quotaId)
    throw e
  }

  revalidatePath('/projects')
  revalidatePath('/recommendations')
  redirect(`/projects/${plan.id}`)
}

export async function regenerateRecommendationsAction() {
  const user = await requireUser()
  await regenerateRecommendations(user.id)

  revalidatePath('/recommendations')
  revalidatePath('/dashboard')
  redirect('/recommendations')
}

export async function dismissRecommendationAction(recommendationId: string) {
  const user = await requireUser()
  const rec = await prisma.recommendation.findUnique({ where: { id: recommendationId } })
  if (!rec || rec.userId !== user.id) return

  await prisma.recommendation.update({ where: { id: recommendationId }, data: { status: 'DISMISSED' } })
  revalidatePath('/recommendations')
  revalidatePath('/dashboard')
}
