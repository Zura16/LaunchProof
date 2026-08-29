import { prisma } from '@/lib/db/prisma'
import { providerFor } from '@/lib/jobfeed/providers'
import { JobFeedError, type NormalizedPosting } from '@/lib/jobfeed/types'
import type { AtsProvider } from '@prisma/client'

export { JobFeedError }

/**
 * Titles worth surfacing to a student. A single company board can carry
 * hundreds of postings — Stripe's had 580 — and almost none are relevant to
 * someone seeking an internship or new-grad engineering role. Filtering at
 * ingest keeps the feed readable and the table small.
 */
// `grad(uate)?` matters: without it a trailing word boundary after
// 'grad' rejects the very common 'New Graduate Software Engineer' and
// 'University Graduate' phrasings.
const RELEVANT_TITLE = /\b(intern|internship|new ?grad(uate)?|university ?grad(uate)?|campus|entry[- ]level|early career|apprentice|co-?op|graduate (engineer|program|developer))\b/i

const ENGINEERING_TITLE = /\b(engineer|engineering|developer|software|swe|programmer|data|machine learning|ml|ai|backend|frontend|full[- ]?stack|mobile|platform|infrastructure)\b/i

/** Postings that are clearly not entry-level engineering, even if matched above. */
const EXCLUDED_TITLE = /\b(senior|staff|principal|lead|manager|director|head of|vp|vice president|architect|sales|recruiter|marketing|counsel|accountant)\b/i

export function isRelevantPosting(title: string): boolean {
  if (EXCLUDED_TITLE.test(title)) return false
  // Must read as early-career AND as engineering. Either alone is too broad:
  // "Marketing Intern" and "Senior Engineer" both fail, correctly.
  return RELEVANT_TITLE.test(title) && ENGINEERING_TITLE.test(title)
}

export interface IngestResult {
  sourceId: string
  company: string
  scanned: number
  relevant: number
  added: number
  error?: string
}

async function ingestSource(source: {
  id: string
  companyName: string
  provider: AtsProvider
  boardToken: string
}): Promise<IngestResult> {
  const result: IngestResult = {
    sourceId: source.id,
    company: source.companyName,
    scanned: 0,
    relevant: 0,
    added: 0,
  }

  let postings: NormalizedPosting[]
  try {
    postings = await providerFor(source.provider).list(source.boardToken)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    await prisma.jobSource.update({
      where: { id: source.id },
      data: { lastFetchedAt: new Date(), lastError: message },
    })
    return { ...result, error: message }
  }

  result.scanned = postings.length
  const relevant = postings.filter((p) => isRelevantPosting(p.title) && p.url)
  result.relevant = relevant.length

  for (const posting of relevant) {
    // Upsert on the ATS's own id so repeated polls never duplicate a posting,
    // and firstSeenAt is preserved for anything already known.
    const existing = await prisma.feedJob.findUnique({
      where: { provider_externalId: { provider: source.provider, externalId: posting.externalId } },
      select: { id: true },
    })

    if (existing) {
      await prisma.feedJob.update({
        where: { id: existing.id },
        data: {
          title: posting.title,
          location: posting.location,
          url: posting.url,
          isRemote: posting.isRemote,
          postedAt: posting.postedAt,
        },
      })
      continue
    }

    await prisma.feedJob.create({
      data: {
        sourceId: source.id,
        provider: source.provider,
        externalId: posting.externalId,
        company: posting.company || source.companyName,
        title: posting.title,
        location: posting.location,
        url: posting.url,
        isRemote: posting.isRemote,
        postedAt: posting.postedAt,
        descriptionText: posting.descriptionText,
      },
    })
    result.added += 1
  }

  await prisma.jobSource.update({
    where: { id: source.id },
    data: { lastFetchedAt: new Date(), lastError: null },
  })

  return result
}

/** Poll every active source. Sources are independent: one failure never stops the rest. */
export async function refreshJobFeed(): Promise<IngestResult[]> {
  const sources = await prisma.jobSource.findMany({ where: { isActive: true } })
  const results: IngestResult[] = []

  for (const source of sources) {
    results.push(
      await ingestSource({
        id: source.id,
        companyName: source.companyName,
        provider: source.provider,
        boardToken: source.boardToken,
      })
    )
  }

  return results
}

/**
 * Ensure a feed job has its full description, fetching it on demand.
 * Greenhouse omits descriptions from listings, so this is where they arrive.
 */
export async function hydrateFeedJob(feedJobId: string): Promise<string | null> {
  const job = await prisma.feedJob.findUnique({ where: { id: feedJobId }, include: { source: true } })
  if (!job) return null
  if (job.descriptionText?.trim()) return job.descriptionText

  const text = await providerFor(job.provider)
    .fetchDescription(job.source.boardToken, job.externalId)
    .catch(() => null)

  if (!text) return null

  await prisma.feedJob.update({ where: { id: feedJobId }, data: { descriptionText: text } })
  return text
}
