// A point-in-time snapshot of everything LaunchProof inspects in a
// repository. Deliberately decoupled from Octokit so the evidence analyzer
// is a pure function over data — it can run against live GitHub responses,
// seed fixtures, or test fixtures without change.
export interface RepoSnapshot {
  name: string
  fullName: string
  description: string | null
  isFork: boolean
  stars: number
  forks: number
  topics: string[]
  repoUrl: string
  defaultBranch: string
  primaryLanguage: string | null
  /** Bytes of code per language, from the GitHub languages API. */
  languages: Record<string, number>
  /** Every file path in the default branch's tree (paths only, no contents). */
  filePaths: string[]
  /** Contents of dependency manifests we care about, keyed by path. */
  manifests: Record<string, string>
  readme: string | null
}

export interface DetectedEvidence {
  skillName: string
  skillCategory: 'LANGUAGE' | 'FRAMEWORK' | 'DATABASE' | 'CLOUD' | 'DEVOPS' | 'TESTING' | 'CONCEPT' | 'TOOL' | 'OTHER'
  strength: 'STRONG' | 'MODERATE' | 'WEAK'
  /** Human-readable justification, shown to the student verbatim. */
  reason: string
  /** Concrete file paths / dependency names backing the claim. */
  citations: string[]
  /**
   * When true, this signal is too weak to justify creating a new canonical
   * skill — it is only recorded if the skill is already tracked. Applies to
   * repository topics and README mentions, which are author-written tags
   * rather than demonstrated capability.
   */
  requiresExistingSkill?: boolean
}

export interface RepoAnalysis {
  detected: DetectedEvidence[]
  signals: {
    hasTests: boolean
    hasDocker: boolean
    hasCI: boolean
    hasDeployConfig: boolean
    fileCount: number
  }
}
