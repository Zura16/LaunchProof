import { prisma } from '@/lib/db/prisma'
import {
  computeSkillGaps,
  recomputeSkillGaps,
  priorityLabel,
  type ComputedGap,
} from '@/lib/services/gap-analysis.service'
import type { RecommendationType, RecommendationImpact, SkillCategory } from '@prisma/client'
import type { RepoAnalysis } from '@/lib/github/types'

/**
 * Action efficiency — the spec's fourth ranking factor, applied here rather
 * than in gap analysis. How large a gap is has nothing to do with how cheap
 * it is to close; that only matters when deciding what to *do*.
 *
 * Hardening a repository the student already built is far cheaper than
 * starting a new one, so it is weighted accordingly. This is what keeps
 * LaunchProof from telling students to build endless new projects.
 */
const EFFICIENCY: Record<RecommendationType, number> = {
  IMPROVE_EXISTING_PROJECT: 1,
  ADD_TESTING: 0.95,
  ADD_CICD: 0.95,
  DEPLOY_PROJECT: 0.9,
  ADD_DATABASE: 0.85,
  IMPROVE_DOCUMENTATION: 0.8,
  STRENGTHEN_RESUME: 0.75,
  BUILD_NEW_PROJECT: 0.4,
  APPLY_NOW: 0.5,
}

// Gap categories that can be closed by hardening an existing repository
// rather than building something new.
const REPO_IMPROVABLE: SkillCategory[] = ['TESTING', 'DEVOPS', 'CLOUD', 'DATABASE']

const TYPE_FOR_CATEGORY: Partial<Record<SkillCategory, RecommendationType>> = {
  TESTING: 'ADD_TESTING',
  DEVOPS: 'ADD_CICD',
  CLOUD: 'DEPLOY_PROJECT',
  DATABASE: 'ADD_DATABASE',
}

export interface GeneratedRecommendation {
  type: RecommendationType
  impact: RecommendationImpact
  title: string
  reasoning: string
  skillsAddressed: string[]
  targetRepoName: string | null
  priorityScore: number
}

function impactFor(score: number): RecommendationImpact {
  const label = priorityLabel(score)
  return label === 'High' ? 'HIGH' : label === 'Medium' ? 'MEDIUM' : 'LOW'
}

function joinSkills(names: string[]): string {
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

/** Plain-language reasoning built from the same numbers used for ranking. */
function buildReasoning(gaps: ComputedGap[], repoName: string | null, totalJobs: number): string {
  const sorted = [...gaps].sort((a, b) => b.marketCount - a.marketCount)
  const lead = sorted
    .slice(0, 3)
    .map((g) => `${g.skillName} in ${g.marketCount} of ${g.totalJobs}`)
    .join(', ')

  const coverage = Math.round(
    (sorted.reduce((max, g) => Math.max(max, g.marketCount), 0) / Math.max(totalJobs, 1)) * 100
  )

  const where = repoName
    ? `${repoName} is your strongest existing project and already lacks all of them, so hardening it closes several gaps at once instead of starting something new.`
    : 'You have no analyzed repository that demonstrates these yet.'

  return `These skills recur across your target roles — ${lead} — reaching ${coverage}% of the jobs you saved. ${where}`
}

interface RepoCandidate {
  name: string
  evidenceCount: number
  signals: RepoAnalysis['signals'] | null
}

async function loadRepoCandidates(userId: string): Promise<RepoCandidate[]> {
  const account = await prisma.gitHubAccount.findUnique({
    where: { userId },
    include: { repositories: true },
  })
  if (!account) return []

  const evidenceCounts = await prisma.evidence.groupBy({
    by: ['sourceId'],
    where: { userId, sourceType: 'GITHUB_REPOSITORY' },
    _count: true,
  })
  const countById = new Map(evidenceCounts.map((e) => [e.sourceId, e._count]))

  return account.repositories
    .map((r) => {
      const analysis = r.analysisResult as unknown as RepoAnalysis | null
      return {
        name: r.name,
        evidenceCount: countById.get(r.id) ?? 0,
        signals: analysis?.signals ?? null,
      }
    })
    // "Strongest project" = the one with the most demonstrated evidence.
    .sort((a, b) => b.evidenceCount - a.evidenceCount)
}

/**
 * Generate recommendations deterministically from computed gaps.
 *
 * Ranking is entirely application logic — market frequency, requirement
 * importance, evidence gap, and action efficiency. AI is used only to
 * reword the explanation (see enrichRecommendationWording), never to decide
 * what matters or in what order.
 */
export async function generateRecommendations(userId: string): Promise<GeneratedRecommendation[]> {
  const gaps = await computeSkillGaps(userId)
  if (gaps.length === 0) return []

  const totalJobs = gaps[0].totalJobs
  const skills = await prisma.skill.findMany({
    where: { id: { in: gaps.map((g) => g.skillId) } },
    select: { id: true, category: true },
  })
  const categoryById = new Map(skills.map((s) => [s.id, s.category]))

  // Only gaps with genuine headroom are actionable.
  const actionable = gaps.filter((g) => g.currentEvidence !== 'STRONG' && g.priorityScore > 0)
  if (actionable.length === 0) return []

  const repos = await loadRepoCandidates(userId)
  const bestRepo = repos[0] ?? null
  const recommendations: GeneratedRecommendation[] = []
  const claimed = new Set<string>()

  // 1. Flagship: bundle the repo-improvable gaps into a single upgrade of
  // the student's strongest project. This is what makes one piece of work
  // close four gaps rather than four separate projects.
  const bundleable = actionable.filter((g) => {
    const category = categoryById.get(g.skillId)
    return category && REPO_IMPROVABLE.includes(category)
  })

  if (bestRepo && bundleable.length >= 2) {
    // Cap the bundle: past ~4 skills a single "upgrade" stops reading as one
    // coherent piece of work, and the remaining gaps are more useful as
    // separately actionable items than as an ever-growing list.
    const bundle = bundleable.slice(0, 4)
    const score = bundle.reduce((sum, g) => sum + g.priorityScore, 0) * EFFICIENCY.IMPROVE_EXISTING_PROJECT
    bundle.forEach((g) => claimed.add(g.skillId))

    recommendations.push({
      type: 'IMPROVE_EXISTING_PROJECT',
      impact: impactFor(bundle[0].priorityScore),
      title: `Upgrade ${bestRepo.name}`,
      reasoning: buildReasoning(bundle, bestRepo.name, totalJobs),
      skillsAddressed: bundle.map((g) => g.skillName),
      targetRepoName: bestRepo.name,
      priorityScore: score,
    })
  }

  // 2. Focused recommendations for the highest remaining gaps.
  for (const gap of actionable) {
    if (claimed.has(gap.skillId)) continue
    if (recommendations.length >= 5) break

    const category = categoryById.get(gap.skillId)
    const isSelfReported = gap.currentEvidence === 'SELF_REPORTED'

    let type: RecommendationType
    if (isSelfReported) {
      // Claimed on the résumé with nothing behind it — the cheapest fix is
      // to produce a real artifact, not to learn something new.
      type = 'STRENGTHEN_RESUME'
    } else if (category && TYPE_FOR_CATEGORY[category] && bestRepo) {
      type = TYPE_FOR_CATEGORY[category]!
    } else {
      type = bestRepo ? 'IMPROVE_EXISTING_PROJECT' : 'BUILD_NEW_PROJECT'
    }

    const targetRepo = type === 'BUILD_NEW_PROJECT' ? null : (bestRepo?.name ?? null)
    const score = gap.priorityScore * EFFICIENCY[type]

    const titles: Record<RecommendationType, string> = {
      ADD_TESTING: `Add automated tests to ${targetRepo ?? 'a project'}`,
      ADD_CICD: `Add a CI pipeline to ${targetRepo ?? 'a project'}`,
      DEPLOY_PROJECT: `Deploy ${targetRepo ?? 'a backend project'}`,
      ADD_DATABASE: `Add a real ${gap.skillName} implementation to ${targetRepo ?? 'a project'}`,
      IMPROVE_DOCUMENTATION: `Document ${targetRepo ?? 'your project'}`,
      STRENGTHEN_RESUME: `Back up your ${gap.skillName} claim with evidence`,
      IMPROVE_EXISTING_PROJECT: `Demonstrate ${gap.skillName} in ${targetRepo ?? 'a project'}`,
      BUILD_NEW_PROJECT: `Build a project that demonstrates ${gap.skillName}`,
      APPLY_NOW: `Apply now`,
    }

    claimed.add(gap.skillId)
    recommendations.push({
      type,
      impact: impactFor(gap.priorityScore),
      title: titles[type],
      reasoning: isSelfReported
        ? `${gap.skillName} appears in ${gap.marketCount} of your ${gap.totalJobs} target jobs, but your only evidence is a self-reported claim with no artifact behind it. Producing something checkable is a smaller step than learning a new skill.`
        : gap.explanation,
      skillsAddressed: [gap.skillName],
      targetRepoName: targetRepo,
      priorityScore: score,
    })
  }

  // 3. If the student is already well covered on a saved job, say so —
  // continuing to build when you are ready to apply is its own mistake.
  const readyJob = await findApplyReadyJob(userId)
  if (readyJob) {
    recommendations.push({
      type: 'APPLY_NOW',
      impact: 'LOW',
      title: `Apply to ${readyJob.company}`,
      reasoning: `You have supporting evidence for every required qualification listed by ${readyJob.company} for ${readyJob.title}. Remaining gaps there are preferred qualifications, which are not stated as mandatory.`,
      skillsAddressed: [],
      targetRepoName: null,
      priorityScore: 0.05,
    })
  }

  return recommendations.sort((a, b) => b.priorityScore - a.priorityScore)
}

async function findApplyReadyJob(userId: string): Promise<{ company: string; title: string } | null> {
  const savedJobs = await prisma.savedJob.findMany({
    where: { userId, application: null },
    include: { jobPosting: { include: { requirements: true } } },
    take: 25,
  })

  const studentSkills = await prisma.studentSkill.findMany({ where: { userId } })
  const strengthBySkill = new Map(studentSkills.map((s) => [s.skillId, s.highestStrength]))

  for (const saved of savedJobs) {
    const required = saved.jobPosting.requirements.filter((r) => r.type === 'REQUIRED')
    if (required.length < 3) continue

    const allProven = required.every((r) => {
      const strength = strengthBySkill.get(r.skillId)
      return strength === 'STRONG' || strength === 'MODERATE'
    })
    if (allProven) {
      return { company: saved.jobPosting.company, title: saved.jobPosting.title }
    }
  }
  return null
}

/**
 * Replace the user's recommendations with a freshly generated set.
 *
 * Two kinds are preserved rather than regenerated:
 *  - those already turned into a project plan, because the student is
 *    working on them and deleting one would discard their progress;
 *  - those the student dismissed, so a refresh never resurrects advice
 *    they explicitly rejected.
 */
export async function regenerateRecommendations(userId: string): Promise<GeneratedRecommendation[]> {
  const generated = await generateRecommendations(userId)

  const preserved = await prisma.recommendation.findMany({
    where: { userId, OR: [{ projectPlan: { isNot: null } }, { status: 'DISMISSED' }] },
    select: { id: true, title: true },
  })
  const preservedTitles = new Set(preserved.map((r) => r.title))

  await prisma.recommendation.deleteMany({
    where: { userId, id: { notIn: preserved.map((r) => r.id) } },
  })

  const fresh = generated.filter((g) => !preservedTitles.has(g.title))
  if (fresh.length > 0) {
    await prisma.recommendation.createMany({
      data: fresh.map((g) => ({
        userId,
        type: g.type,
        impact: g.impact,
        title: g.title,
        reasoning: g.reasoning,
        skillsAddressed: g.skillsAddressed,
        targetRepoName: g.targetRepoName,
        priorityScore: g.priorityScore,
      })),
    })
  }

  return generated
}

/**
 * Single entry point for "the inputs changed": recompute gaps, then rebuild
 * the recommendations that depend on them. Called after a job is analyzed
 * or removed, a résumé is analyzed, or GitHub is synced or disconnected.
 */
export async function refreshDerivedInsights(userId: string): Promise<void> {
  await recomputeSkillGaps(userId)
  await regenerateRecommendations(userId)
}
