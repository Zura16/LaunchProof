import { isRelevantPosting } from '@/lib/services/job-feed.service'
import { htmlToText } from '@/lib/jobfeed/types'

function assert(label: string, condition: boolean, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!condition) process.exitCode = 1
}

// --- Relevance filter: must be early-career AND engineering ---
const ACCEPT = [
  'Software Engineer, Intern',
  'Software Engineer Intern (Fall 2026)',
  'Research Engineer Intern (Fall 2026)',
  'Software Engineering Intern (2027 Start) - Winter',
  'New Grad Software Engineer',
  'New Graduate Software Engineer',
  'Backend Developer, University Graduate',
  'University Grad Engineer',
  'Data Engineer Co-op',
  'Entry-Level Full-Stack Engineer',
]

const REJECT = [
  // early-career but not engineering
  'Accounting Intern (Fall 2026)',
  'Marketing Campaigns Intern',
  'Strategic Events Intern (Fall 2026)',
  'Product Management Intern (Summer 2027)',
  'Operations Associate, New Grad (Mexico)',
  // engineering but not early-career
  'Senior Software Engineer',
  'Staff Backend Engineer',
  'Principal Engineer, Platform',
  'Engineering Manager, Payments',
  'Director of Engineering',
  'Software Architect',
  // neither
  'Graduate Program Manager',
  'Marketing Graduate Scheme',
  'Senior Graduate Engineer',
  'University Recruiter',
  'Enterprise Sales Representative',
]

for (const title of ACCEPT) assert(`accepts "${title}"`, isRelevantPosting(title))
for (const title of REJECT) assert(`rejects "${title}"`, !isRelevantPosting(title))

// A senior role must lose even when it also reads as early-career.
assert(
  'seniority overrides an early-career keyword',
  !isRelevantPosting('Senior Software Engineer, University Recruiting Tools')
)

// --- HTML to text ---
const html = '<div><h2>About</h2><p>Build&nbsp;APIs &amp; services.</p><ul><li>Python</li><li>SQL</li></ul><script>bad()</script></div>'
const text = htmlToText(html)
assert('strips tags', !/[<>]/.test(text))
assert('drops script contents', !text.includes('bad()'))
assert('decodes entities', text.includes('Build APIs & services'))
assert('keeps list items on separate lines', text.split('\n').filter((l) => l.includes('Python')).length === 1)
assert('collapses excess blank lines', !/\n{3,}/.test(text))
