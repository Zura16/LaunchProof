'use server'

import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth/require-user'
import { generateProjectPlanFromRecommendation } from '@/lib/services/project-plan-generator.service'

export async function createProjectPlanAction(recommendationId: string) {
  const user = await requireUser()
  const plan = await generateProjectPlanFromRecommendation(recommendationId, user.id)
  redirect(`/projects/${plan.id}`)
}
