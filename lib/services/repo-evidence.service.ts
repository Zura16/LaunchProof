import type { RepoSnapshot, DetectedEvidence, RepoAnalysis } from '@/lib/github/types'

// Languages below this share of a repo are treated as incidental (config
// files, a stray script) rather than as evidence the student works in them.
const LANGUAGE_STRONG_BYTES = 20_000
const LANGUAGE_MIN_SHARE = 0.05

type Category = DetectedEvidence['skillCategory']

interface DependencyRule {
  skillName: string
  category: Category
  /** Exact dependency names, or a prefix ending in `/` for scoped families. */
  packages: string[]
  /** File-path predicates that corroborate real usage, upgrading MODERATE -> STRONG. */
  corroborate?: (paths: string[]) => string[]
}

const hasPath = (paths: string[], test: (p: string) => boolean, limit = 3): string[] =>
  paths.filter(test).slice(0, limit)

const TEST_FILE = (p: string) =>
  /(^|\/)(__tests__|tests?|spec)\//i.test(p) || /\.(test|spec)\.[jt]sx?$/i.test(p) || /(^|\/)test_.*\.py$/i.test(p)

const DEPENDENCY_RULES: DependencyRule[] = [
  {
    skillName: 'React',
    category: 'FRAMEWORK',
    packages: ['react'],
    corroborate: (p) => hasPath(p, (f) => /\.(jsx|tsx)$/i.test(f)),
  },
  { skillName: 'Next.js', category: 'FRAMEWORK', packages: ['next'] },
  {
    skillName: 'Node.js',
    category: 'FRAMEWORK',
    packages: ['express', 'fastify', 'koa', '@nestjs/core'],
    corroborate: (p) => hasPath(p, (f) => /(^|\/)(server|api|routes?|controllers?)\//i.test(f)),
  },
  {
    skillName: 'REST APIs',
    category: 'CONCEPT',
    packages: ['express', 'fastify', 'koa', '@nestjs/core', 'axios'],
    corroborate: (p) => hasPath(p, (f) => /(^|\/)(routes?|api|controllers?|endpoints?)\//i.test(f)),
  },
  {
    skillName: 'PostgreSQL',
    category: 'DATABASE',
    packages: ['pg', 'postgres', 'node-postgres', 'psycopg2', 'psycopg2-binary', 'asyncpg'],
    corroborate: (p) => hasPath(p, (f) => /migrations?\//i.test(f) || /\.sql$/i.test(f)),
  },
  {
    skillName: 'SQL',
    category: 'DATABASE',
    packages: ['pg', 'mysql', 'mysql2', 'sqlite3', 'better-sqlite3', 'knex', 'sequelize', 'typeorm', 'prisma', '@prisma/client'],
    corroborate: (p) => hasPath(p, (f) => /\.sql$/i.test(f) || /migrations?\//i.test(f) || /schema\.prisma$/i.test(f)),
  },
  {
    skillName: 'MongoDB',
    category: 'DATABASE',
    packages: ['mongoose', 'mongodb'],
  },
  {
    skillName: 'Automated Testing',
    category: 'TESTING',
    packages: ['jest', 'vitest', 'mocha', 'jasmine', '@testing-library/react', 'supertest', 'pytest', 'cypress', 'playwright', '@playwright/test'],
    corroborate: (p) => hasPath(p, TEST_FILE),
  },
  {
    skillName: 'TypeScript',
    category: 'LANGUAGE',
    packages: ['typescript'],
    corroborate: (p) => hasPath(p, (f) => /\.tsx?$/i.test(f)),
  },
]

/** Files whose mere presence proves a practice, independent of dependencies. */
interface FileRule {
  skillName: string
  category: Category
  match: (path: string) => boolean
  strength: DetectedEvidence['strength']
  reason: (citations: string[]) => string
}

const FILE_RULES: FileRule[] = [
  {
    skillName: 'Docker',
    category: 'DEVOPS',
    match: (p) => /(^|\/)Dockerfile$/i.test(p) || /(^|\/)docker-compose\.ya?ml$/i.test(p),
    strength: 'MODERATE',
    reason: (c) => `Container configuration is committed to the repository (${c.join(', ')}).`,
  },
  {
    skillName: 'CI/CD',
    category: 'DEVOPS',
    match: (p) => /^\.github\/workflows\/.+\.ya?ml$/i.test(p) || /(^|\/)\.gitlab-ci\.ya?ml$/i.test(p) || /(^|\/)Jenkinsfile$/i.test(p),
    strength: 'STRONG',
    reason: (c) => `A continuous integration pipeline runs from this repository (${c.join(', ')}).`,
  },
  {
    skillName: 'AWS',
    category: 'CLOUD',
    match: (p) => /(^|\/)(serverless\.ya?ml|template\.ya?ml)$/i.test(p) || /\.ebextensions\//i.test(p) || /(^|\/)samconfig\.toml$/i.test(p),
    strength: 'MODERATE',
    reason: (c) => `AWS deployment configuration is present (${c.join(', ')}).`,
  },
  {
    skillName: 'Terraform',
    category: 'DEVOPS',
    match: (p) => /\.tf$/i.test(p),
    strength: 'MODERATE',
    reason: (c) => `Infrastructure-as-code definitions are committed (${c.join(', ')}).`,
  },
  {
    skillName: 'Kubernetes',
    category: 'DEVOPS',
    match: (p) => /(^|\/)k8s\//i.test(p) || /(^|\/)kubernetes\//i.test(p) || /(^|\/)helm\//i.test(p),
    strength: 'MODERATE',
    reason: (c) => `Kubernetes manifests are committed (${c.join(', ')}).`,
  },
]

const DEPLOY_CONFIG = (p: string) =>
  /(^|\/)(vercel\.json|netlify\.toml|Procfile|fly\.toml|render\.yaml|app\.yaml)$/i.test(p)

function parseDependencies(manifests: Record<string, string>): Map<string, string> {
  // Maps dependency name -> the manifest path that declared it.
  const found = new Map<string, string>()

  for (const [path, content] of Object.entries(manifests)) {
    if (/package\.json$/i.test(path)) {
      try {
        const pkg = JSON.parse(content) as {
          dependencies?: Record<string, string>
          devDependencies?: Record<string, string>
        }
        for (const name of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) {
          if (!found.has(name)) found.set(name, path)
        }
      } catch {
        // A malformed manifest is not evidence of anything; skip it.
      }
    } else if (/requirements\.txt$/i.test(path)) {
      for (const line of content.split('\n')) {
        const name = line.trim().split(/[=<>!\[;#\s]/)[0]?.toLowerCase()
        if (name && !found.has(name)) found.set(name, path)
      }
    } else if (/(pyproject\.toml|Pipfile|go\.mod|pom\.xml|build\.gradle|Cargo\.toml)$/i.test(path)) {
      // Coarse but honest: record the manifest so language-level rules can
      // cite it, without pretending to fully parse every ecosystem.
      found.set(`__manifest__${path}`, path)
    }
  }

  return found
}

/**
 * Deterministically derive skill evidence from a repository snapshot.
 *
 * No AI is involved: a dependency in a manifest, a test file, a Dockerfile,
 * or a CI workflow are all checkable facts. Every returned item carries the
 * concrete citations that justify it, so a classification can always be
 * explained back to the student.
 */
export function analyzeRepoSnapshot(snapshot: RepoSnapshot): RepoAnalysis {
  const { filePaths, languages, manifests, topics, readme } = snapshot
  const dependencies = parseDependencies(manifests)
  const detected: DetectedEvidence[] = []
  const claimed = new Set<string>()

  // Case-insensitive so a lowercase repo topic ("react") cannot re-claim a
  // skill a stronger rule already proved ("React").
  const push = (e: DetectedEvidence) => {
    const key = e.skillName.trim().toLowerCase()
    if (!key || claimed.has(key)) return
    claimed.add(key)
    detected.push(e)
  }

  // 1. Languages, weighted by how much of the repo they actually make up.
  const totalBytes = Object.values(languages).reduce((sum, n) => sum + n, 0)
  if (totalBytes > 0) {
    for (const [language, bytes] of Object.entries(languages)) {
      const share = bytes / totalBytes
      if (share < LANGUAGE_MIN_SHARE) continue
      const strong = bytes >= LANGUAGE_STRONG_BYTES
      push({
        skillName: language,
        skillCategory: 'LANGUAGE',
        strength: strong ? 'STRONG' : 'MODERATE',
        reason: `${language} makes up ${Math.round(share * 100)}% of ${snapshot.name} (${bytes.toLocaleString()} bytes of code).`,
        citations: [`${snapshot.fullName}: ${bytes.toLocaleString()} bytes of ${language}`],
      })
    }
  }

  // 2. Dependencies, upgraded to STRONG when real usage corroborates them.
  for (const rule of DEPENDENCY_RULES) {
    const matchedPackages = rule.packages.filter((p) => dependencies.has(p))
    if (matchedPackages.length === 0) continue

    const manifestPaths = Array.from(new Set(matchedPackages.map((p) => dependencies.get(p)!)))
    const corroborating = rule.corroborate?.(filePaths) ?? []
    const strength = corroborating.length > 0 ? 'STRONG' : 'MODERATE'

    const reason =
      corroborating.length > 0
        ? `Declared as a dependency (${matchedPackages.join(', ')}) and used in the codebase.`
        : `Declared as a dependency (${matchedPackages.join(', ')}), but no supporting implementation files were detected.`

    push({
      skillName: rule.skillName,
      skillCategory: rule.category,
      strength,
      reason,
      citations: [...manifestPaths.map((m) => `${m}: ${matchedPackages.join(', ')}`), ...corroborating],
    })
  }

  // 3. Practices proven by the presence of specific files.
  for (const rule of FILE_RULES) {
    const matches = hasPath(filePaths, rule.match)
    if (matches.length === 0) continue
    push({
      skillName: rule.skillName,
      skillCategory: rule.category,
      strength: rule.strength,
      reason: rule.reason(matches),
      citations: matches,
    })
  }

  // 4. Test files without a recognised framework still demonstrate testing.
  const testFiles = hasPath(filePaths, TEST_FILE)
  if (testFiles.length > 0 && !claimed.has('automated testing')) {
    push({
      skillName: 'Automated Testing',
      skillCategory: 'TESTING',
      strength: 'MODERATE',
      reason: 'Test files are present, though no recognised test framework was found in the dependency manifests.',
      citations: testFiles,
    })
  }

  // 5. Topics and README mentions are the weakest signal: the student said
  // it, the repository does not demonstrate it. Only recorded for skills
  // nothing stronger already covered.
  const readmeLower = (readme ?? '').toLowerCase()
  for (const topic of topics) {
    const normalized = topic.trim()
    if (!normalized || claimed.has(normalized.toLowerCase())) continue
    push({
      skillName: normalized,
      skillCategory: 'OTHER',
      strength: 'WEAK',
      reason: `Listed as a repository topic${readmeLower.includes(normalized.toLowerCase()) ? ' and mentioned in the README' : ''}, but nothing in the code was detected that demonstrates it.`,
      citations: [`${snapshot.fullName} topic: ${normalized}`],
      requiresExistingSkill: true,
    })
  }

  return {
    detected,
    signals: {
      hasTests: testFiles.length > 0,
      hasDocker: filePaths.some((p) => /(^|\/)Dockerfile$/i.test(p) || /(^|\/)docker-compose\.ya?ml$/i.test(p)),
      hasCI: filePaths.some((p) => /^\.github\/workflows\/.+\.ya?ml$/i.test(p)),
      hasDeployConfig: filePaths.some(DEPLOY_CONFIG),
      fileCount: filePaths.length,
    },
  }
}
