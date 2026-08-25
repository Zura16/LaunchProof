import { prisma } from '@/lib/db/prisma'
import type { ManualJobInput } from '@/schemas/onboarding'

// Creates a JobPosting + SavedJob without structured requirements.
// Requirement extraction (skills, REQUIRED/PREFERRED/etc.) happens via the
// job analysis service — see the Target Jobs feature (Phase 3).
export async function createManualSavedJob(userId: string, input: ManualJobInput) {
  const posting = await prisma.jobPosting.create({
    data: {
      company: input.company,
      title: input.title,
      location: input.location || null,
      url: input.url || null,
      description: input.description,
    },
  })

  return prisma.savedJob.create({
    data: { userId, jobPostingId: posting.id },
    include: { jobPosting: true },
  })
}
