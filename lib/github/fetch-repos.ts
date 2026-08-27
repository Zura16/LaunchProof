import { Octokit } from 'octokit'
import type { RepoSnapshot } from '@/lib/github/types'

export class GitHubFetchError extends Error {}

// Manifests worth reading in full. Anything else we only need the path of.
const MANIFEST_FILES = [
  'package.json',
  'requirements.txt',
  'pyproject.toml',
  'Pipfile',
  'go.mod',
  'pom.xml',
  'build.gradle',
  'Cargo.toml',
]

const MAX_REPOS = 30
const MAX_MANIFESTS_PER_REPO = 4
const MAX_TREE_ENTRIES = 2000
/**
 * Repositories fetched in parallel; each costs ~4 API calls.
 *
 * Measured against a real 29-repo account: sequential 97s, 8-wide 33.5s,
 * 16-wide 32.5s, 24-wide 31.8s. Past ~8 the wall time is set by the slowest
 * individual repository (a recursive tree call on a large repo), not by
 * throughput, so raising this further buys nothing and only adds load.
 */
const REPO_CONCURRENCY = 12

async function fetchTextFile(octokit: Octokit, owner: string, repo: string, path: string): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path })
    if (!Array.isArray(data) && data.type === 'file' && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf8')
    }
  } catch {
    // Missing file is a normal, expected outcome — not an error.
  }
  return null
}

async function buildSnapshot(
  octokit: Octokit,
  repo: {
    name: string
    full_name: string
    owner: { login: string }
    description: string | null
    fork: boolean
    stargazers_count?: number
    forks_count?: number
    topics?: string[]
    html_url: string
    default_branch?: string
    language: string | null
  }
): Promise<RepoSnapshot> {
  const owner = repo.owner.login
  const name = repo.name
  const defaultBranch = repo.default_branch ?? 'main'

  const [languages, filePaths] = await Promise.all([
    octokit.rest.repos
      .listLanguages({ owner, repo: name })
      .then((r) => r.data as Record<string, number>)
      .catch(() => ({}) as Record<string, number>),
    // One recursive tree call gives every path without cloning history.
    octokit.rest.git
      .getTree({ owner, repo: name, tree_sha: defaultBranch, recursive: '1' })
      .then((r) => r.data.tree.filter((t) => t.type === 'blob' && t.path).map((t) => t.path as string))
      .catch(() => [] as string[]),
  ])

  const trimmedPaths = filePaths.slice(0, MAX_TREE_ENTRIES)

  // Only fetch manifests we can see in the tree, and cap the count so a
  // monorepo cannot fan out into hundreds of content requests.
  const manifestPaths = trimmedPaths
    .filter((p) => MANIFEST_FILES.some((m) => p === m || p.endsWith(`/${m}`)))
    .slice(0, MAX_MANIFESTS_PER_REPO)

  const manifests: Record<string, string> = {}
  await Promise.all(
    manifestPaths.map(async (path) => {
      const content = await fetchTextFile(octokit, owner, name, path)
      if (content) manifests[path] = content
    })
  )

  const readme = await octokit.rest.repos
    .getReadme({ owner, repo: name })
    .then((r) => Buffer.from(r.data.content, 'base64').toString('utf8').slice(0, 8000))
    .catch(() => null)

  return {
    name,
    fullName: repo.full_name,
    description: repo.description,
    isFork: repo.fork,
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    topics: repo.topics ?? [],
    repoUrl: repo.html_url,
    defaultBranch,
    primaryLanguage: repo.language,
    languages,
    filePaths: trimmedPaths,
    manifests,
    readme,
  }
}

export async function fetchRepoSnapshots(accessToken: string): Promise<RepoSnapshot[]> {
  const octokit = new Octokit({ auth: accessToken })

  let repos
  try {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      visibility: 'public',
      affiliation: 'owner',
      sort: 'pushed',
      per_page: MAX_REPOS,
    })
    repos = data
  } catch {
    throw new GitHubFetchError(
      'Could not read your repositories from GitHub. Your access may have been revoked — try reconnecting.'
    )
  }

  // Forks are usually someone else's work; they are not evidence the
  // student built anything.
  const owned = repos.filter((r) => !r.fork)

  // Each repository needs several API calls (languages, tree, manifests,
  // README). Fetching them one repository at a time took ~97s for 29 repos,
  // which both feels broken to the user and exceeds serverless time limits.
  // A bounded worker pool keeps that well within budget while staying far
  // under GitHub's 5,000 requests/hour authenticated allowance.
  const snapshots: RepoSnapshot[] = []
  const queue = [...owned]

  async function worker() {
    for (;;) {
      const repo = queue.shift()
      if (!repo) return
      try {
        snapshots.push(await buildSnapshot(octokit, repo))
      } catch {
        // One unreadable repository should not fail the whole sync.
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(REPO_CONCURRENCY, owned.length) }, worker))

  // Preserve the API's ordering (most recently pushed first), which the
  // concurrent completion order would otherwise scramble.
  const rank = new Map(owned.map((r, i) => [r.full_name, i]))
  snapshots.sort((a, b) => (rank.get(a.fullName) ?? 0) - (rank.get(b.fullName) ?? 0))

  return snapshots
}
