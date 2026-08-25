'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import type { ApplicationStatus } from '@prisma/client'

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
  const user = await requireUser()
  const application = await prisma.application.findUnique({ where: { id: applicationId } })
  if (!application || application.userId !== user.id) return

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status,
      appliedDate: status === 'APPLIED' && !application.appliedDate ? new Date() : application.appliedDate,
    },
  })
  revalidatePath('/applications')
}
