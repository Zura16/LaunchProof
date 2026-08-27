import type { AtsProvider } from '@prisma/client'
import { type JobFeedProvider, type NormalizedPosting, fetchJson, htmlToText } from '@/lib/jobfeed/types'

// --- Greenhouse -------------------------------------------------------------
// Listing without `content=true` is roughly an order of magnitude smaller, so
// descriptions are fetched per posting only for jobs that pass relevance.

interface GreenhouseJob {
  id: number
  title: string
  absolute_url: string
  company_name?: string
  location?: { name?: string }
  first_published?: string
  updated_at?: string
  content?: string
}

const greenhouse: JobFeedProvider = {
  id: 'GREENHOUSE',
  async list(boardToken) {
    const data = await fetchJson<{ jobs: GreenhouseJob[] }>(
      `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(boardToken)}/jobs`
    )
    return (data.jobs ?? []).map((j) => ({
      externalId: String(j.id),
      title: j.title,
      company: j.company_name ?? boardToken,
      location: j.location?.name ?? null,
      url: j.absolute_url,
      isRemote: /remote/i.test(j.location?.name ?? ''),
      postedAt: j.first_published ? new Date(j.first_published) : j.updated_at ? new Date(j.updated_at) : null,
      descriptionText: null,
    }))
  },
  async fetchDescription(boardToken, externalId) {
    const job = await fetchJson<GreenhouseJob>(
      `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(boardToken)}/jobs/${encodeURIComponent(externalId)}`
    )
    return job.content ? htmlToText(job.content) : null
  },
}

// --- Ashby ------------------------------------------------------------------
// Returns plain-text descriptions inline, so no second request is needed.

interface AshbyJob {
  id: string
  title: string
  location?: string
  isRemote?: boolean
  isListed?: boolean
  jobUrl?: string
  applyUrl?: string
  publishedAt?: string
  descriptionPlain?: string
  descriptionHtml?: string
}

const ashby: JobFeedProvider = {
  id: 'ASHBY',
  async list(boardToken) {
    const data = await fetchJson<{ jobs: AshbyJob[] }>(
      `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(boardToken)}`
    )
    return (data.jobs ?? [])
      .filter((j) => j.isListed !== false)
      .map((j) => ({
        externalId: j.id,
        title: j.title,
        company: boardToken,
        location: j.location ?? null,
        url: j.jobUrl ?? j.applyUrl ?? '',
        isRemote: !!j.isRemote || /remote/i.test(j.location ?? ''),
        postedAt: j.publishedAt ? new Date(j.publishedAt) : null,
        descriptionText:
          j.descriptionPlain?.trim() || (j.descriptionHtml ? htmlToText(j.descriptionHtml) : null),
      }))
  },
  async fetchDescription() {
    // Descriptions already arrive with the listing.
    return null
  },
}

// --- Lever ------------------------------------------------------------------
// Kept for boards that still expose the v0 postings endpoint. Several tokens
// tested returned 404, so treat availability as per-company.

interface LeverJob {
  id: string
  text: string
  hostedUrl?: string
  applyUrl?: string
  createdAt?: number
  categories?: { location?: string; commitment?: string }
  descriptionPlain?: string
  description?: string
}

const lever: JobFeedProvider = {
  id: 'LEVER',
  async list(boardToken) {
    const data = await fetchJson<LeverJob[]>(
      `https://api.lever.co/v0/postings/${encodeURIComponent(boardToken)}?mode=json`
    )
    return (Array.isArray(data) ? data : []).map((j) => ({
      externalId: j.id,
      title: j.text,
      company: boardToken,
      location: j.categories?.location ?? null,
      url: j.hostedUrl ?? j.applyUrl ?? '',
      isRemote: /remote/i.test(j.categories?.location ?? ''),
      postedAt: j.createdAt ? new Date(j.createdAt) : null,
      descriptionText: j.descriptionPlain?.trim() || (j.description ? htmlToText(j.description) : null),
    }))
  },
  async fetchDescription() {
    return null
  },
}

const PROVIDERS: Record<AtsProvider, JobFeedProvider> = {
  GREENHOUSE: greenhouse,
  ASHBY: ashby,
  LEVER: lever,
}

export function providerFor(id: AtsProvider): JobFeedProvider {
  return PROVIDERS[id]
}

export type { NormalizedPosting }
