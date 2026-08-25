'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { manualJobSchema } from '@/schemas/onboarding'
import { createManualSavedJob } from '@/lib/services/saved-jobs.service'
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
  const saved = await prisma.savedJob.findUnique({ where: { id: savedJobId } })
  if (!saved || saved.userId !== user.id) return

  await prisma.savedJob.delete({ where: { id: savedJobId } })
  revalidatePath('/jobs')
  redirect('/jobs')
}

export async function markAppliedAction(savedJobId: string) {
  const user = await requireUser()
  const saved = await prisma.savedJob.findUnique({ where: { id: savedJobId }, include: { application: true } })
  if (!saved || saved.userId !== user.id) return

  if (saved.application) {
    await prisma.application.update({
      where: { id: saved.application.id },
      data: { status: 'APPLIED', appliedDate: new Date() },
    })
  } else {
    await prisma.application.create({
      data: { userId: user.id, savedJobId, status: 'APPLIED', appliedDate: new Date() },
    })
  }
  revalidatePath(`/jobs/${savedJobId}`)
  revalidatePath('/applications')
}
