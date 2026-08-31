'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { refreshJobFeed, hydrateFeedJob, hydrateMissingDescriptions } from '@/lib/services/job-feed.service'
import { verifyFeedLinks } from '@/lib/services/link-verification.service'
import { createManualSavedJob } from '@/lib/services/saved-jobs.service'

export async function refreshFeedAction() {
  await requireUser()

  const results = await refreshJobFeed()
  const added = results.reduce((sum, r) => sum + r.added, 0)

  // Check a slice of the stalest links so a manual refresh also prunes
  // postings that have since been filled.
  await verifyFeedLinks(40)
  await hydrateMissingDescriptions(30)
  const failed = results.filter((r) => r.error)

  revalidatePath('/discover')

  if (failed.length > 0 && added === 0) {
    const detail = `${failed.length} source${failed.length === 1 ? '' : 's'} could not be reached`
    redirect(`/discover?feedError=${encodeURIComponent(detail)}`)
  }
  redirect(`/discover?added=${added}`)
}

/**
 * Move a discovered posting into the student's target jobs.
 *
 * The description is hydrated first: without it the job cannot be analyzed,
 * and a target job with no description is useless to the rest of the app.
 */
export async function saveFeedJobAction(feedJobId: string) {
  const user = await requireUser()

  const feedJob = await prisma.feedJob.findUnique({ where: { id: feedJobId } })
  if (!feedJob) return

  const description = (await hydrateFeedJob(feedJobId)) ?? feedJob.descriptionText

  if (!description || description.trim().length < 20) {
    redirect(
      `/discover?feedError=${encodeURIComponent(
        'That posting’s description could not be retrieved. Open it on the company site and paste it in via Add Job.'
      )}`
    )
  }

  const existing = await prisma.jobPosting.findFirst({
    where: { url: feedJob.url, savedJobs: { some: { userId: user.id } } },
    include: { savedJobs: { where: { userId: user.id } } },
  })
  if (existing?.savedJobs[0]) {
    redirect(`/jobs/${existing.savedJobs[0].id}`)
  }

  const saved = await createManualSavedJob(user.id, {
    company: feedJob.company,
    title: feedJob.title,
    location: feedJob.location ?? '',
    url: feedJob.url,
    description,
  })

  revalidatePath('/jobs')
  revalidatePath('/discover')
  redirect(`/jobs/${saved.id}`)
}
