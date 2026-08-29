'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { assertNotDemoAccount, DemoAccountError } from '@/lib/auth/demo-guard'
import { prisma } from '@/lib/db/prisma'
import { updateApplicationSchema, TERMINAL_STATUSES } from '@/schemas/application'
import type { ApplicationStatus } from '@prisma/client'
import type { ActionState } from '@/app/onboarding/actions'

function isTerminal(status: ApplicationStatus) {
  return (TERMINAL_STATUSES as readonly string[]).includes(status)
}

/** Quick inline status change from the tracker table. */
export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
  const user = await requireUser()
  const application = await prisma.application.findUnique({ where: { id: applicationId } })
  if (!application || application.userId !== user.id) return

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status,
      // Stamp the milestone dates the student would otherwise have to fill
      // in by hand, without overwriting anything they already set.
      appliedDate: status === 'APPLIED' && !application.appliedDate ? new Date() : application.appliedDate,
      closedAt: isTerminal(status) ? (application.closedAt ?? new Date()) : null,
    },
  })

  revalidatePath('/applications')
  revalidatePath('/dashboard')
}

/** Start tracking a saved job that has no application row yet. */
export async function trackApplicationAction(savedJobId: string) {
  const user = await requireUser()
  const saved = await prisma.savedJob.findUnique({ where: { id: savedJobId }, include: { application: true } })
  if (!saved || saved.userId !== user.id || saved.application) return

  const created = await prisma.application.create({
    data: { userId: user.id, savedJobId, status: 'PREPARING' },
  })

  revalidatePath('/applications')
  revalidatePath('/dashboard')
  redirect(`/applications/${created.id}`)
}

export async function updateApplicationAction(
  applicationId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser()
  const application = await prisma.application.findUnique({ where: { id: applicationId } })
  if (!application || application.userId !== user.id) return { error: 'Application not found.' }

  const parsed = updateApplicationSchema.safeParse({
    status: formData.get('status'),
    appliedDate: formData.get('appliedDate'),
    nextInterviewDate: formData.get('nextInterviewDate'),
    resumeId: formData.get('resumeId'),
    referralContact: formData.get('referralContact'),
    recruiterContact: formData.get('recruiterContact'),
    notes: formData.get('notes'),
    outcomeNote: formData.get('outcomeNote'),
    rejectionStage: formData.get('rejectionStage'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const data = parsed.data

  // Only accept a résumé the user actually owns.
  let resumeId: string | null = null
  if (data.resumeId) {
    const resume = await prisma.resume.findUnique({ where: { id: data.resumeId } })
    resumeId = resume && resume.userId === user.id ? resume.id : null
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: data.status,
      appliedDate: data.appliedDate ?? (data.status === 'APPLIED' ? (application.appliedDate ?? new Date()) : application.appliedDate),
      nextInterviewDate: data.nextInterviewDate,
      resumeId,
      referralContact: data.referralContact,
      recruiterContact: data.recruiterContact,
      notes: data.notes,
      outcomeNote: data.outcomeNote,
      rejectionStage: data.rejectionStage,
      closedAt: isTerminal(data.status) ? (application.closedAt ?? new Date()) : null,
    },
  })

  revalidatePath('/applications')
  revalidatePath(`/applications/${applicationId}`)
  revalidatePath('/dashboard')
  return undefined
}

export async function deleteApplicationAction(applicationId: string) {
  const user = await requireUser()
  try {
    await assertNotDemoAccount(user.id)
  } catch (e) {
    if (e instanceof DemoAccountError) redirect('/applications')
    throw e
  }
  const application = await prisma.application.findUnique({ where: { id: applicationId } })
  if (!application || application.userId !== user.id) return

  await prisma.application.delete({ where: { id: applicationId } })

  revalidatePath('/applications')
  revalidatePath('/dashboard')
  redirect('/applications')
}
