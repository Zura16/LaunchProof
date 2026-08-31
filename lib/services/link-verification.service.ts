import { prisma } from '@/lib/db/prisma'

/**
 * Verify that discovered postings still lead somewhere real.
 *
 * A filled or withdrawn role keeps appearing in a board's API for a while,
 * and sending a student to a dead link is the most common complaint about
 * job aggregators. This checks the apply URL directly.
 *
 * Status code alone is not enough: several ATS platforms return 200 with a
 * "this job is no longer available" page rather than a 404, so the body is
 * checked for those markers too.
 */

const CHECK_TIMEOUT_MS = 12_000
const CONCURRENCY = 10

/**
 * The posting's own identifier, taken from its URL.
 *
 * The most reliable signal that a job is gone is not a 404 — Greenhouse, for
 * one, answers a removed posting with a 302 to the company's general careers
 * page and a 200 there. So a live posting is one whose final URL still refers
 * to the same job; anything redirected away from it has been pulled.
 */
export function jobIdFromUrl(url: string): string | null {
  const path = url.match(/\/jobs?\/([A-Za-z0-9_-]{4,})/)
  if (path) return path[1]
  const query = url.match(/[?&](?:gh_jid|jobId|job_id|id)=([A-Za-z0-9_-]{4,})/)
  return query ? query[1] : null
}

/**
 * Does the final URL still look like a specific job posting?
 *
 * Companies routinely redirect an ATS URL to their own careers site under a
 * different id scheme — Stripe sends a Greenhouse job to
 * /careers/listing/<slug>/<id>. That job is still live, so requiring the
 * original id to survive the redirect wrongly buried real postings.
 *
 * The distinction that matters is landing on a *specific posting* versus
 * being bounced to a careers index. Errs toward "still a posting": hiding a
 * real job costs a student an opportunity, whereas keeping one stale link
 * costs them a single wasted click.
 */
export function looksLikeJobPage(url: string): boolean {
  try {
    const { pathname, hostname } = new URL(url)

    // A job-ish keyword followed by at least one identifying segment.
    if (
      /\/(jobs?|careers?|postings?|listings?|openings?|opportunit(?:y|ies)|vacanc(?:y|ies))\/[^/]+/i.test(pathname)
    ) {
      return true
    }

    // ATS hosts put the identifier straight in the path with no keyword —
    // Lever serves postings at jobs.lever.co/<company>/<id>. Two or more
    // segments on such a host is a posting; one segment is the board index.
    const isAtsHost =
      /(^|\.)(lever\.co|ashbyhq\.com|greenhouse\.io|workable\.com|smartrecruiters\.com|jobvite\.com|myworkdayjobs\.com)$/i.test(
        hostname
      ) || /^(jobs|careers|boards|apply|job-boards)\./i.test(hostname)

    const segments = pathname.split('/').filter(Boolean)
    return isAtsHost && segments.length >= 2
  } catch {
    return false
  }
}

/** Phrases an ATS shows on a 200 response for a posting that is gone. */
const GONE_MARKERS = [
  'no longer available',
  'no longer accepting',
  'position has been filled',
  'job is closed',
  'posting is closed',
  'this job is no longer',
  'not accepting applications',
  'req is closed',
]

export type LinkVerdict = 'alive' | 'gone' | 'unreachable'

export interface LinkCheck {
  verdict: LinkVerdict
  status: number | null
  reason: string | null
}

export async function checkApplyUrl(url: string): Promise<LinkCheck> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        // Some boards serve a bot-detection page to unknown agents, which
        // would otherwise read as a dead link.
        'User-Agent':
          'Mozilla/5.0 (compatible; LaunchProof/1.0; +https://github.com/Zura16/LaunchProof)',
        Accept: 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
    })

    if (response.status === 404 || response.status === 410) {
      return { verdict: 'gone', status: response.status, reason: `HTTP ${response.status}` }
    }

    // 4xx/5xx other than the above are more likely to be transient or
    // anti-bot responses than a genuinely removed posting, so they are not
    // treated as proof the job is gone.
    if (!response.ok) {
      return { verdict: 'unreachable', status: response.status, reason: `HTTP ${response.status}` }
    }

    // Redirected somewhere that is no longer a specific posting -> pulled.
    // A redirect to a *different* posting URL (a company's own careers site)
    // is still a live job and must not be treated as gone.
    const originalId = jobIdFromUrl(url)
    const finalUrl = response.url || url
    const movedAway = originalId && !finalUrl.includes(originalId)
    if (movedAway && !looksLikeJobPage(finalUrl)) {
      return {
        verdict: 'gone',
        status: response.status,
        reason: `redirected to a careers index (${new URL(finalUrl).pathname || '/'})`,
      }
    }

    // Secondary signal, for boards that serve an explicit "closed" page in
    // place of the posting while keeping the URL.
    const body = (await response.text()).toLowerCase().slice(0, 20_000)
    const marker = GONE_MARKERS.find((m) => body.includes(m))
    if (marker) {
      return { verdict: 'gone', status: response.status, reason: `page says "${marker}"` }
    }

    return { verdict: 'alive', status: response.status, reason: null }
  } catch (e) {
    const reason = e instanceof Error && e.name === 'AbortError' ? 'timed out' : 'network error'
    return { verdict: 'unreachable', status: null, reason }
  } finally {
    clearTimeout(timeout)
  }
}

export interface VerificationSummary {
  checked: number
  alive: number
  deactivated: number
  unreachable: number
  reactivated: number
}

/**
 * Check the postings whose links are stalest.
 *
 * Bounded so a run stays well inside a serverless time limit; the least
 * recently checked are always taken first, so coverage rotates.
 *
 * `unreachable` deliberately does not deactivate anything — a timeout or a
 * bot-check should never hide a real job.
 */
export async function verifyFeedLinks(limit = 60): Promise<VerificationSummary> {
  const jobs = await prisma.feedJob.findMany({
    where: { url: { not: '' } },
    orderBy: [{ lastCheckedAt: { sort: 'asc', nulls: 'first' } }, { firstSeenAt: 'desc' }],
    take: limit,
    select: { id: true, url: true, isActive: true },
  })

  const summary: VerificationSummary = { checked: 0, alive: 0, deactivated: 0, unreachable: 0, reactivated: 0 }
  const queue = [...jobs]

  async function worker() {
    for (;;) {
      const job = queue.shift()
      if (!job) return

      const result = await checkApplyUrl(job.url)
      summary.checked += 1

      if (result.verdict === 'gone') {
        if (job.isActive) summary.deactivated += 1
        await prisma.feedJob.update({
          where: { id: job.id },
          data: { isActive: false, lastCheckedAt: new Date(), deactivatedReason: result.reason },
        })
      } else if (result.verdict === 'alive') {
        summary.alive += 1
        // A posting can come back (re-opened, or a transient block cleared).
        if (!job.isActive) summary.reactivated += 1
        await prisma.feedJob.update({
          where: { id: job.id },
          data: { isActive: true, lastCheckedAt: new Date(), deactivatedReason: null },
        })
      } else {
        summary.unreachable += 1
        await prisma.feedJob.update({ where: { id: job.id }, data: { lastCheckedAt: new Date() } })
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker))
  return summary
}
