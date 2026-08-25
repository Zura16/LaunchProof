'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'

export async function toggleMilestoneAction(milestoneId: string, projectPlanId: string) {
  const user = await requireUser()
  const milestone = await prisma.projectMilestone.findUnique({
    where: { id: milestoneId },
    include: { projectPlan: true },
  })
  if (!milestone || milestone.projectPlan.userId !== user.id) return

  await prisma.projectMilestone.update({
    where: { id: milestoneId },
    data: { isCompleted: !milestone.isCompleted },
  })

  const milestones = await prisma.projectMilestone.findMany({ where: { projectPlanId } })
  const allDone = milestones.every((m) => (m.id === milestoneId ? !milestone.isCompleted : m.isCompleted))
  await prisma.projectPlan.update({
    where: { id: projectPlanId },
    data: { status: allDone ? 'COMPLETED' : 'IN_PROGRESS' },
  })

  revalidatePath(`/projects/${projectPlanId}`)
  revalidatePath('/projects')
}
