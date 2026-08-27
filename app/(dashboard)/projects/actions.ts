'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'

export async function toggleTaskAction(taskId: string, projectPlanId: string) {
  const user = await requireUser()

  const task = await prisma.projectTask.findUnique({
    where: { id: taskId },
    include: { milestone: { include: { projectPlan: true } } },
  })
  if (!task || task.milestone.projectPlan.userId !== user.id) return

  await prisma.projectTask.update({
    where: { id: taskId },
    data: { isCompleted: !task.isCompleted },
  })

  // Plan status is derived from task completion, so it can never disagree
  // with the checkboxes the student actually ticked.
  const tasks = await prisma.projectTask.findMany({
    where: { milestone: { projectPlanId } },
    select: { isCompleted: true },
  })
  const done = tasks.filter((t) => t.isCompleted).length
  const status = done === 0 ? 'PLANNED' : done === tasks.length ? 'COMPLETED' : 'IN_PROGRESS'

  await prisma.projectPlan.update({ where: { id: projectPlanId }, data: { status } })

  revalidatePath(`/projects/${projectPlanId}`)
  revalidatePath('/projects')
}
