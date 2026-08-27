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

  const snapshots: RepoSnapshot[] = []
  for (const repo of owned) {
    try {
      snapshots.push(await buildSnapshot(octokit, repo))
    } catch {
      // One unreadable repository should not fail the whole sync.
    }
  }

  return snapshots
}
