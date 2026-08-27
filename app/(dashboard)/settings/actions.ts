'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { signOut } from '@/lib/auth/auth'
import { studentInfoSchema } from '@/schemas/onboarding'
import { syncGitHubRepositories, clearGitHubEvidence, GitHubFetchError } from '@/lib/services/github-sync.service'
import type { ActionState } from '@/app/onboarding/actions'

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  const parsed = studentInfoSchema.safeParse({
    fullName: formData.get('fullName'),
    university: formData.get('university'),
    degree: formData.get('degree'),
    major: formData.get('major'),
    graduationDate: formData.get('graduationDate'),
    academicYear: formData.get('academicYear'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.studentProfile.update({ where: { userId: user.id }, data: parsed.data })
  revalidatePath('/settings')
  return undefined
}

export async function syncGitHubAction() {
  const user = await requireUser()

  try {
    await syncGitHubRepositories(user.id)
  } catch (e) {
    if (e instanceof GitHubFetchError) {
      redirect(`/settings?githubError=${encodeURIComponent(e.message)}`)
    }
    throw e
  }

  revalidatePath('/settings')
  revalidatePath('/evidence')
  revalidatePath('/dashboard')
  revalidatePath('/market-insights')
  redirect('/settings')
}

export async function disconnectGitHubAction() {
  const user = await requireUser()

  await clearGitHubEvidence(user.id)
  await prisma.gitHubAccount.deleteMany({ where: { userId: user.id } })
  await prisma.account.deleteMany({ where: { userId: user.id, provider: 'github' } })

  revalidatePath('/settings')
  revalidatePath('/evidence')
  revalidatePath('/dashboard')
  revalidatePath('/market-insights')
}

export async function deleteAccountAction() {
  const user = await requireUser()
  await prisma.user.delete({ where: { id: user.id } })
  await signOut({ redirectTo: '/' })
}
