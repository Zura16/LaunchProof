/**
 * Eligibility signals read from a posting's own words.
 *
 * A student who needs visa sponsorship can spend hours on roles that will
 * never accept them, and the posting usually says so plainly. LaunchProof
 * already collects `workAuthorization` and `sponsorshipRequired` during
 * onboarding but never used them; this is what makes them matter.
 *
 * These are *flags*, never automatic exclusions. Wording is inconsistent and
 * often ambiguous, and quietly hiding jobs on a guess would be worse than
 * showing them with a caveat. The student decides.
 */

/**
 * Phrases that are unambiguously about immigration sponsorship on their own.
 */
const NO_SPONSORSHIP_EXPLICIT = [
  'no visa sponsorship',
  'not provide visa',
  'cannot provide visa',
  'unable to provide visa',
  'not offer visa sponsorship',
  'does not offer visa sponsorship',
  'not able to sponsor',
  'unable to sponsor',
  'ineligible for sponsorship',
  'do not provide sponsorship',
  'does not provide sponsorship',
  'not offer sponsorship',
  'does not offer sponsorship',
]

/**
 * Phrases that only mean visa sponsorship in the right context.
 *
 * "without sponsorship" appears verbatim in standard export-control boilerplate
 * — "...controlled under these U.S. export laws without sponsorship for an
 * export license" — which is about a licence, not a person. Matching it blindly
 * flagged four live Cloudflare internships as closed to visa holders, which
 * would discourage precisely the students this is meant to help.
 */
const NO_SPONSORSHIP_AMBIGUOUS = ['without sponsorship', 'no sponsorship', 'not sponsor']

/** Words that confirm a nearby sponsorship mention really is about immigration. */
const VISA_CONTEXT = /\b(visa|immigration|h-?1b|opt|cpt|work authoriz|employment authoriz|sponsorship for employment)\b/i

/** Words that show a sponsorship mention is about something else entirely. */
const NON_VISA_CONTEXT = /\b(export licen[cs]e|export control|export laws|sponsorship opportunit|event sponsor|sponsor a team)\b/i

const OFFERS_SPONSORSHIP = [
  'will sponsor',
  'we sponsor',
  'sponsorship available',
  'offer visa sponsorship',
  'provide visa sponsorship',
  'open to sponsorship',
  'visa sponsorship is available',
]

const CITIZENSHIP_REQUIRED = [
  'must be a u.s. citizen',
  'must be a us citizen',
  'u.s. citizenship required',
  'us citizenship required',
  'requires us citizenship',
  'security clearance',
  'must be authorized to work in the united states without sponsorship',
  'green card holder',
]

/** The text surrounding a match, used to judge what it is actually about. */
function windowAround(haystack: string, phrase: string, radius = 140): string {
  const i = haystack.indexOf(phrase)
  if (i < 0) return ''
  return haystack.slice(Math.max(0, i - radius), i + phrase.length + radius)
}

export type SponsorshipSignal = 'offers' | 'none' | 'citizenship-required' | 'unstated'

export interface EligibilityRead {
  sponsorship: SponsorshipSignal
  /** The phrase found, so the classification can be shown as evidence. */
  matchedPhrase: string | null
}

export function readEligibility(text: string | null | undefined): EligibilityRead {
  if (!text) return { sponsorship: 'unstated', matchedPhrase: null }
  const haystack = text.toLowerCase()

  // Citizenship/clearance is the hardest constraint, so it is checked first.
  const clearance = CITIZENSHIP_REQUIRED.find((p) => haystack.includes(p))
  if (clearance) return { sponsorship: 'citizenship-required', matchedPhrase: clearance }

  const explicit = NO_SPONSORSHIP_EXPLICIT.find((p) => haystack.includes(p))
  if (explicit && !NON_VISA_CONTEXT.test(windowAround(haystack, explicit))) {
    return { sponsorship: 'none', matchedPhrase: explicit }
  }

  // An ambiguous phrase counts only when the surrounding text confirms it is
  // about immigration and not, say, an export licence.
  const ambiguous = NO_SPONSORSHIP_AMBIGUOUS.find((p) => {
    if (!haystack.includes(p)) return false
    const context = windowAround(haystack, p)
    return VISA_CONTEXT.test(context) && !NON_VISA_CONTEXT.test(context)
  })
  if (ambiguous) return { sponsorship: 'none', matchedPhrase: ambiguous }

  const offers = OFFERS_SPONSORSHIP.find((p) => haystack.includes(p))
  if (offers) return { sponsorship: 'offers', matchedPhrase: offers }

  return { sponsorship: 'unstated', matchedPhrase: null }
}

/** Whether a posting is worth flagging to a student who needs sponsorship. */
export function isSponsorshipConcern(signal: SponsorshipSignal): boolean {
  return signal === 'none' || signal === 'citizenship-required'
}

export function sponsorshipLabel(signal: SponsorshipSignal): string | null {
  switch (signal) {
    case 'none':
      return 'No sponsorship'
    case 'citizenship-required':
      return 'US citizenship / clearance'
    case 'offers':
      return 'Sponsors visas'
    default:
      return null
  }
}

/**
 * US-based, judged from a location string.
 *
 * Deliberately conservative: an unrecognised location counts as US rather
 * than being filtered away, because the cost of hiding a real domestic job is
 * higher than the cost of showing one extra international listing.
 */
const NON_US_MARKERS = [
  'london', 'berlin', 'barcelona', 'madrid', 'paris', 'amsterdam', 'dublin', 'lisbon',
  'munich', 'zurich', 'stockholm', 'copenhagen', 'warsaw', 'prague', 'tokyo', 'singapore',
  'sydney', 'melbourne', 'toronto', 'vancouver', 'montreal', 'bangalore', 'bengaluru',
  'hyderabad', 'mumbai', 'delhi', 'pune', 'chennai', 'tel aviv', 'dubai', 'hong kong',
  'shanghai', 'beijing', 'seoul', 'são paulo', 'sao paulo', 'mexico city', 'bogota',
  'buenos aires', 'lagos', 'nairobi', 'cairo', 'istanbul', 'manila', 'jakarta',
  'kuala lumpur', 'bangkok', 'ho chi minh', 'hanoi', 'taipei', 'auckland', 'edinburgh',
  'manchester', 'cambridge, uk', 'oxford', 'united kingdom', 'germany', 'france', 'spain',
  'netherlands', 'ireland', 'poland', 'portugal', 'india', 'canada', 'australia', 'japan',
  'brazil', 'mexico', 'israel', 'sweden', 'denmark', 'norway', 'finland', 'switzerland',
  'austria', 'belgium', 'italy', 'greece', 'romania', 'ukraine', 'emea', 'apac', 'latam',
]

export function isLikelyUsLocation(location: string | null | undefined): boolean {
  if (!location) return true // unknown -> keep
  const l = location.toLowerCase()
  if (/\b(remote|anywhere)\b/.test(l) && !NON_US_MARKERS.some((m) => l.includes(m))) return true
  return !NON_US_MARKERS.some((m) => l.includes(m))
}
