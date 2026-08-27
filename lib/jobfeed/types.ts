import type { AtsProvider } from '@prisma/client'

/** A posting normalized across providers. */
export interface NormalizedPosting {
  externalId: string
  title: string
  company: string
  location: string | null
  url: string
  isRemote: boolean
  postedAt: Date | null
  /** Present only when the provider returns it in the listing response. */
  descriptionText: string | null
}

export interface JobFeedProvider {
  id: AtsProvider
  /** Fetch the board listing. Descriptions may be omitted for payload size. */
  list(boardToken: string): Promise<NormalizedPosting[]>
  /** Fetch one posting's full text, for boards whose listing omits it. */
  fetchDescription(boardToken: string, externalId: string): Promise<string | null>
}

export class JobFeedError extends Error {}

/** Strip HTML to readable text — ATS descriptions are HTML fragments. */
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const FETCH_TIMEOUT_MS = 20_000

export async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'LaunchProof/1.0' },
      cache: 'no-store',
    })
    if (!response.ok) {
      throw new JobFeedError(`${response.status} from ${new URL(url).host}`)
    }
    return (await response.json()) as T
  } catch (e) {
    if (e instanceof JobFeedError) throw e
    const reason = e instanceof Error && e.name === 'AbortError' ? 'timed out' : 'network error'
    throw new JobFeedError(`Could not reach ${new URL(url).host} (${reason})`)
  } finally {
    clearTimeout(timeout)
  }
}
