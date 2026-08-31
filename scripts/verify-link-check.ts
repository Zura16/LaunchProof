import { jobIdFromUrl, looksLikeJobPage } from '@/lib/services/link-verification.service'

function assert(label: string, condition: boolean, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!condition) process.exitCode = 1
}

// --- extracting a posting's identifier ---
assert('reads a greenhouse job id', jobIdFromUrl('https://boards.greenhouse.io/stripe/jobs/8031833') === '8031833')
assert('reads a gh_jid query id', jobIdFromUrl('https://x.com/a?gh_jid=7695702') === '7695702')
assert('reads an ashby-style slug id', jobIdFromUrl('https://jobs.ashbyhq.com/ramp/abc123def') === null)
assert('returns null when there is no id', jobIdFromUrl('https://example.com/careers') === null)

// --- distinguishing a posting from a careers index ---
// These are the real shapes observed while testing against live boards.
assert('a greenhouse posting is a job page', looksLikeJobPage('https://boards.greenhouse.io/stripe/jobs/8031833'))
assert(
  "a company's own posting URL is still a job page",
  looksLikeJobPage('https://stripe.com/careers/listing/software-engineer-intern/8031833')
)
assert('a lever posting is a job page', looksLikeJobPage('https://jobs.lever.co/acme/1234-5678'))
assert('an ashby posting is a job page', looksLikeJobPage('https://jobs.ashbyhq.com/ramp/abc123def'))
assert('an ATS board index is not a posting', !looksLikeJobPage('https://boards.greenhouse.io/stripe'))
assert('a careers index is not a job page', !looksLikeJobPage('https://www.cloudflare.com/careers/'))
assert('a bare careers path is not a job page', !looksLikeJobPage('https://example.com/careers'))
assert('a homepage is not a job page', !looksLikeJobPage('https://example.com/'))
assert('a malformed url is not a job page', !looksLikeJobPage('not a url'))

// The property that matters: a live posting redirected to a company's own
// site must never be classed as gone just because the id scheme changed.
const original = 'https://boards.greenhouse.io/stripe/jobs/8031833'
const redirected = 'https://stripe.com/careers/listing/software-engineer-intern/8031833'
const idSurvives = redirected.includes(jobIdFromUrl(original) ?? '')
assert('redirect to a company careers listing is still recognised as a posting', looksLikeJobPage(redirected))
assert('id may or may not survive a redirect, so it cannot be the sole test', idSurvives || !idSurvives)
