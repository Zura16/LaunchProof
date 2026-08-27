import { isAIConfigured } from '@/lib/ai/client'
import { analyzeJobDescription } from '@/lib/ai/job-analysis'
import { analyzeResumeText } from '@/lib/ai/resume-analysis'

function assert(label: string, condition: boolean, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!condition) process.exitCode = 1
}

const JOB_DESCRIPTION = `
Software Engineering Intern — Summer 2027
Acme Robotics, Boston, MA (Hybrid)

About the role:
You'll join our platform team building internal services that power our fleet operations.
You will design and implement RESTful API endpoints, work with our Postgres database, and
help improve our deployment pipeline.

Required qualifications:
- Currently pursuing a BS or MS in Computer Science or a related field
- Graduating between December 2026 and June 2028
- Proficiency in Python or Java
- Experience building RESTful web services
- Familiarity with relational databases (we use Postgres)

Preferred qualifications:
- Experience writing unit tests with pytest or JUnit
- Exposure to Docker and containerized workflows
- Familiarity with AWS

Responsibilities:
- Write clean, tested code and participate in code review
- Collaborate with senior engineers on system design

Applicants must be authorized to work in the United States. We are unable to provide
visa sponsorship for this internship.
`

const RESUME_TEXT = `
JORDAN RIVERA
jordan.rivera@example.edu | github.com/jrivera

EDUCATION
State University — B.S. Computer Science, Expected May 2027. GPA: 3.6

EXPERIENCE
Backend Engineering Intern, Northwind Systems (Jun 2025 - Aug 2025)
- Implemented 8 REST endpoints in Django serving internal dashboards
- Wrote pytest unit tests covering the billing module

PROJECTS
TrailMap — github.com/jrivera/trailmap
- Hiking route planner built with React and a Flask backend
- Stored route data in PostgreSQL with indexed geo queries

SKILLS
Python, JavaScript, React, Flask, PostgreSQL, Git, Docker
`

async function main() {
  assert('API key is detected as configured', isAIConfigured())

  console.log('\n--- Job analysis ---')
  const job = await analyzeJobDescription(JOB_DESCRIPTION)
  console.log(`extracted ${job.requirements.length} requirements`)

  const byType = (t: string) => job.requirements.filter((r) => r.requirementType === t)
  const names = job.requirements.map((r) => r.canonicalSkillGuess.toLowerCase())

  for (const r of job.requirements) {
    console.log(`  [${r.requirementType}/${r.importance}] ${r.canonicalSkillGuess}  ("${r.rawPhrase}") conf=${r.confidence}`)
  }

  assert('extracted a non-trivial number of requirements', job.requirements.length >= 5)
  assert('found REQUIRED items', byType('REQUIRED').length > 0)
  assert('found PREFERRED items', byType('PREFERRED').length > 0)
  assert(
    'classified eligibility (work authorization / graduation window)',
    byType('ELIGIBILITY').length > 0,
    `${byType('ELIGIBILITY').length} found`
  )
  assert('normalized "Postgres" to PostgreSQL', names.some((n) => n.includes('postgres')))
  assert(
    'testing appears as PREFERRED, not REQUIRED',
    byType('PREFERRED').some((r) => /test|pytest|junit/i.test(r.canonicalSkillGuess + r.rawPhrase)) &&
      !byType('REQUIRED').some((r) => /pytest|junit/i.test(r.canonicalSkillGuess))
  )
  assert('did not hallucinate an unmentioned technology (Kubernetes)', !names.some((n) => n.includes('kubernetes')))
  assert('all confidences within 0..1', job.requirements.every((r) => r.confidence >= 0 && r.confidence <= 1))

  console.log('\n--- Résumé analysis ---')
  const resume = await analyzeResumeText(RESUME_TEXT)
  console.log(`education=${resume.education.length} experiences=${resume.experiences.length} projects=${resume.projects.length} listedSkills=${resume.listedSkills.length}`)
  console.log('  projects:', resume.projects.map((p) => `${p.title} [${p.technologies.join(', ')}]`).join(' | '))
  console.log('  listedSkills:', resume.listedSkills.join(', '))

  assert('parsed education', resume.education.length === 1)
  assert('parsed the internship', resume.experiences.length === 1)
  assert('parsed the project', resume.projects.length === 1)
  assert(
    'tied React to the project that used it',
    resume.projects.some((p) => p.technologies.some((t) => /react/i.test(t)))
  )
  assert(
    'Docker stays in listedSkills (never demonstrated in the résumé)',
    resume.listedSkills.some((s) => /docker/i.test(s)) &&
      !resume.projects.some((p) => p.technologies.some((t) => /docker/i.test(t)))
  )
  assert(
    'did not invent metrics absent from the résumé',
    !JSON.stringify(resume).match(/\b(99|100|50)%/)
  )
}

main().catch((e) => {
  console.error('ERROR:', e instanceof Error ? e.message : e)
  process.exit(1)
})
