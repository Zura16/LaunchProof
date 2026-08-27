'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { generateProjectPlanFromRecommendation } from '@/lib/services/project-plan-generator.service'
import { regenerateRecommendations } from '@/lib/services/recommendation-engine.service'

export async function createProjectPlanAction(recommendationId: string) {
  const user = await requireUser()
  const plan = await generateProjectPlanFromRecommendation(recommendationId, user.id)

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
