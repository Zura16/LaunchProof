import {
  readEligibility,
  isSponsorshipConcern,
  isLikelyUsLocation,
} from '@/lib/services/eligibility.service'

function assert(label: string, condition: boolean, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!condition) process.exitCode = 1
}

// --- sponsorship, read from the posting's own wording ---
assert(
  'detects an explicit refusal to sponsor',
  readEligibility('We are unable to sponsor visas for this role.').sponsorship === 'none'
)
assert(
  'detects "no visa sponsorship"',
  readEligibility('Note: no visa sponsorship is provided.').sponsorship === 'none'
)
assert(
  'detects a citizenship or clearance requirement',
  readEligibility('Applicants must be a US citizen due to security clearance.').sponsorship ===
    'citizenship-required'
)
assert(
  'detects an offer to sponsor',
  readEligibility('We will sponsor visas for exceptional candidates.').sponsorship === 'offers'
)
assert('says nothing when the posting says nothing', readEligibility('Great team, great perks.').sponsorship === 'unstated')
assert('empty input is unstated', readEligibility('').sponsorship === 'unstated')

// Export-control boilerplate must not be read as an immigration statement.
// This exact wording appears in live Cloudflare postings and wrongly flagged
// four real internships before context checking was added.
assert(
  'export-control boilerplate is not a visa refusal',
  readEligibility(
    'Candidates must have authorization to receive software or technology controlled under these U.S. export laws without sponsorship for an export license.'
  ).sponsorship === 'unstated'
)
assert(
  'an ambiguous phrase counts when visa context is present',
  readEligibility('We are not able to offer visa sponsorship; candidates must work without sponsorship.')
    .sponsorship === 'none'
)
assert(
  'a bare "no sponsorship" with no visa context is not assumed',
  readEligibility('No sponsorship of external conferences is provided.').sponsorship === 'unstated'
)

// Citizenship outranks a generic sponsorship mention in the same posting.
assert(
  'citizenship requirement takes precedence',
  readEligibility('We sponsor visas. However applicants must be a US citizen.').sponsorship ===
    'citizenship-required'
)

// The matched phrase is retained so the flag can be justified to the student.
assert('keeps the phrase it matched', !!readEligibility('We cannot provide visa support.').matchedPhrase)

assert('a refusal is a concern', isSponsorshipConcern('none'))
assert('a clearance requirement is a concern', isSponsorshipConcern('citizenship-required'))
assert('an offer is not a concern', !isSponsorshipConcern('offers'))
assert('silence is not treated as a refusal', !isSponsorshipConcern('unstated'))

// --- location, biased toward keeping ---
assert('keeps a US city', isLikelyUsLocation('San Francisco, CA'))
assert('keeps US remote', isLikelyUsLocation('Remote - US'))
assert('keeps bare Remote', isLikelyUsLocation('Remote'))
assert('keeps an unknown location rather than hiding it', isLikelyUsLocation('Somewhere unlisted'))
assert('keeps a null location', isLikelyUsLocation(null))
assert('excludes London', !isLikelyUsLocation('London, UK'))
assert('excludes Berlin', !isLikelyUsLocation('Berlin, Germany'))
assert('excludes Bengaluru', !isLikelyUsLocation('Bengaluru, India'))
assert('excludes Toronto', !isLikelyUsLocation('Toronto, Canada'))
assert('excludes a non-US remote role', !isLikelyUsLocation('Remote - Germany'))
assert('excludes regional shorthand', !isLikelyUsLocation('EMEA'))
