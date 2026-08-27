import { analyzeRepoSnapshot } from '@/lib/services/repo-evidence.service'
import type { RepoSnapshot } from '@/lib/github/types'

function assert(label: string, condition: boolean) {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}`)
  if (!condition) process.exitCode = 1
}

const base: RepoSnapshot = {
  name: 'Sample',
  fullName: 'someone/Sample',
  description: null,
  isFork: false,
  stars: 0,
  forks: 0,
  topics: [],
  repoUrl: 'https://github.com/someone/Sample',
  defaultBranch: 'main',
  primaryLanguage: null,
  languages: {},
  filePaths: [],
  manifests: {},
  readme: null,
}

const snap = (overrides: Partial<RepoSnapshot>): RepoSnapshot => ({ ...base, ...overrides })
const pkg = (deps: Record<string, string>, dev: Record<string, string> = {}) =>
  JSON.stringify({ dependencies: deps, devDependencies: dev })

const find = (r: ReturnType<typeof analyzeRepoSnapshot>, name: string) =>
  r.detected.find((d) => d.skillName.toLowerCase() === name.toLowerCase())

// A dependency alone is not proof it is used.
const depOnly = analyzeRepoSnapshot(snap({ manifests: { 'package.json': pkg({ react: '^18' }) } }))
assert('react dependency with no components -> MODERATE', find(depOnly, 'React')?.strength === 'MODERATE')

// Corroborating implementation files upgrade it.
const depUsed = analyzeRepoSnapshot(
  snap({ manifests: { 'package.json': pkg({ react: '^18' }) }, filePaths: ['src/App.tsx'] })
)
assert('react dependency plus .tsx files -> STRONG', find(depUsed, 'React')?.strength === 'STRONG')
assert('strong detection cites the corroborating file', !!find(depUsed, 'React')?.citations.some((c) => c.includes('src/App.tsx')))

// Practices proven by file presence.
const infra = analyzeRepoSnapshot(
  snap({ filePaths: ['Dockerfile', '.github/workflows/ci.yml', 'src/__tests__/app.test.ts'] })
)
assert('Dockerfile detected', !!find(infra, 'Docker'))
assert('CI workflow detected as STRONG', find(infra, 'CI/CD')?.strength === 'STRONG')
assert('test files detected without a framework dependency', !!find(infra, 'Automated Testing'))
assert('signals report tests/docker/CI', infra.signals.hasTests && infra.signals.hasDocker && infra.signals.hasCI)

// Absence must stay absent — the core honesty property.
const bare = analyzeRepoSnapshot(snap({ manifests: { 'package.json': pkg({ express: '^4' }) } }))
assert('no test files -> no testing evidence', !find(bare, 'Automated Testing'))
assert('no Dockerfile -> no Docker evidence', !find(bare, 'Docker'))
assert('no CI config -> no CI evidence', !find(bare, 'CI/CD'))

// Language weighting.
const langs = analyzeRepoSnapshot(snap({ languages: { TypeScript: 40000, Shell: 200 } }))
assert('dominant language -> STRONG', find(langs, 'TypeScript')?.strength === 'STRONG')
assert('incidental language below threshold is ignored', !find(langs, 'Shell'))

// Topics are the weakest signal and must not override proven usage.
const topicVsProof = analyzeRepoSnapshot(
  snap({
    topics: ['react'],
    manifests: { 'package.json': pkg({ react: '^18' }) },
    filePaths: ['src/App.tsx'],
  })
)
const reactRows = topicVsProof.detected.filter((d) => d.skillName.toLowerCase() === 'react')
assert('topic does not duplicate an already-proven skill', reactRows.length === 1)
assert('proven skill keeps its STRONG rating', reactRows[0]?.strength === 'STRONG')

const topicOnly = analyzeRepoSnapshot(snap({ topics: ['kubernetes'] }))
assert('topic-only signal is WEAK', find(topicOnly, 'kubernetes')?.strength === 'WEAK')
assert('topic-only signal cannot create a new canonical skill', find(topicOnly, 'kubernetes')?.requiresExistingSkill === true)

// Malformed input must not throw.
const broken = analyzeRepoSnapshot(snap({ manifests: { 'package.json': '{ not json' } }))
assert('malformed manifest is ignored rather than throwing', broken.detected.length === 0)
