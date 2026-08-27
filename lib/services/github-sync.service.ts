import { prisma } from '@/lib/db/prisma'
import type { Prisma } from '@prisma/client'
import { fetchRepoSnapshots, GitHubFetchError } from '@/lib/github/fetch-repos'
import { analyzeRepoSnapshot } from '@/lib/services/repo-evidence.service'
import { resolveCanonicalSkill, findCanonicalSkill } from '@/lib/services/skill-normalization.service'
import { syncStudentSkills, strongestOf } from '@/lib/services/evidence-sync.service'
import { refreshDerivedInsights } from '@/lib/services/recommendation-engine.service'
import type { RepoSnapshot, RepoAnalysis, DetectedEvidence } from '@/lib/github/types'

export { GitHubFetchError }

/**
 * Persist one repository plus the evidence derived from it.
 *
 * Shared by the live GitHub sync and the demo seed so both produce evidence
 * through exactly the same path — seeded evidence is derived, not asserted.
 */
export async function persistRepoAnalysis(
  userId: string,
  githubAccountId: string,
  snapshot: RepoSnapshot,
  analysis: RepoAnalysis
): Promise<string> {
  // Normalize optional fields to concrete values: Prisma's Json input type
  // rejects properties that may be `undefined`.
  const analysisJson: Prisma.InputJsonObject = {
    detected: analysis.detected.map((d) => ({
      skillName: d.skillName,
      skillCategory: d.skillCategory,
      strength: d.strength,
      reason: d.reason,
      citations: d.citations,
      requiresExistingSkill: d.requiresExistingSkill ?? false,
    })),
    signals: { ...analysis.signals },
    analyzedAt: new Date().toISOString(),
  }

  const repo = await prisma.gitHubRepository.upsert({
    where: { id: `${githubAccountId}:${snapshot.name}` },
    update: {
      description: snapshot.description,
      stars: snapshot.stars,
      forks: snapshot.forks,
      languages: snapshot.languages,
      primaryLanguage: snapshot.primaryLanguage,
      topics: snapshot.topics,
      defaultBranch: snapshot.defaultBranch,
      analysisResult: analysisJson,
    },
    create: {
      id: `${githubAccountId}:${snapshot.name}`,
      githubAccountId,
      name: snapshot.name,
      fullName: snapshot.fullName,
      description: snapshot.description,
      isFork: snapshot.isFork,
      stars: snapshot.stars,
      forks: snapshot.forks,
      languages: snapshot.languages,
      primaryLanguage: snapshot.primaryLanguage,
      topics: snapshot.topics,
      repoUrl: snapshot.repoUrl,
      defaultBranch: snapshot.defaultBranch,
      analysisResult: analysisJson,
    },
  })

  // Rebuild this repo's evidence from scratch so a re-sync never leaves
  // behind claims for code that has since been deleted.
  await prisma.evidence.deleteMany({
    where: { userId, sourceType: 'GITHUB_REPOSITORY', sourceId: repo.id },
  })

  // Resolve every detection to a canonical skill first, then keep only the
  // strongest per skill. Two different signals can normalize to the same
  // skill through the alias table — a repo topic of "express" and an
  // express dependency both mean Node.js — and the analyzer cannot know
  // that, since aliases live in the database. Without this, one repository
  // could claim a skill is both proven and undemonstrated.
  const bySkillId = new Map<string, { strength: DetectedEvidence['strength']; reason: string; citations: string[] }>()

  for (const item of analysis.detected) {
    // Topic/README signals attach to known skills only — they must never
    // mint a new canonical skill from an author-written tag.
    const skill = item.requiresExistingSkill
      ? await findCanonicalSkill(item.skillName)
      : await resolveCanonicalSkill({
          rawPhrase: item.skillName,
          canonicalSkillGuess: item.skillName,
          skillCategory: item.skillCategory,
        })
    if (!skill) continue

    const existing = bySkillId.get(skill.id)
    if (!existing) {
      bySkillId.set(skill.id, { strength: item.strength, reason: item.reason, citations: item.citations })
      continue
    }

    const winner = strongestOf([existing.strength, item.strength])
    bySkillId.set(skill.id, {
      strength: winner as DetectedEvidence['strength'],
      reason: winner === existing.strength ? existing.reason : item.reason,
      // Keep every citation: the weaker signal is still context worth showing.
      citations: Array.from(new Set([...existing.citations, ...item.citations])),
    })
  }

  for (const [skillId, item] of bySkillId.entries()) {
    await prisma.evidence.create({
      data: {
        userId,
        skillId,
        sourceType: 'GITHUB_REPOSITORY',
        sourceId: repo.id,
        strength: item.strength,
        description: `${snapshot.name}: ${item.reason}`,
        evidenceUrl: snapshot.repoUrl,
        metadata: { citations: item.citations, repository: snapshot.fullName },
      },
    })
  }

  return repo.id
}

export async function syncGitHubRepositories(userId: string): Promise<{ repoCount: number; evidenceCount: number }> {
  const account = await prisma.gitHubAccount.findUnique({ where: { userId } })
  if (!account) throw new GitHubFetchError('No GitHub account is connected.')

  const oauth = await prisma.account.findFirst({ where: { userId, provider: 'github' } })
  if (!oauth?.access_token) {
    throw new GitHubFetchError(
      'No usable GitHub access token was found. Reconnect your GitHub account from Settings to grant access.'
    )
  }

  const snapshots = await fetchRepoSnapshots(oauth.access_token)

  let evidenceCount = 0
  const seenRepoIds: string[] = []

  for (const snapshot of snapshots) {
    const analysis = analyzeRepoSnapshot(snapshot)
    const repoId = await persistRepoAnalysis(userId, account.id, snapshot, analysis)
    seenRepoIds.push(repoId)
    evidenceCount += analysis.detected.length
  }

  // Repositories that vanished from GitHub (deleted or made private) should
  // stop counting as evidence.
  const stale = await prisma.gitHubRepository.findMany({
    where: { githubAccountId: account.id, id: { notIn: seenRepoIds } },
    select: { id: true },
  })
  if (stale.length > 0) {
    const staleIds = stale.map((r) => r.id)
    await prisma.evidence.deleteMany({
      where: { userId, sourceType: 'GITHUB_REPOSITORY', sourceId: { in: staleIds } },
    })
    await prisma.gitHubRepository.deleteMany({ where: { id: { in: staleIds } } })
  }

  await prisma.gitHubAccount.update({ where: { id: account.id }, data: { updatedAt: new Date() } })
  await syncStudentSkills(userId)
  await refreshDerivedInsights(userId)

  return { repoCount: snapshots.length, evidenceCount }
}

/** Disconnecting GitHub must retract the evidence those repositories supplied. */
export async function clearGitHubEvidence(userId: string): Promise<void> {
  await prisma.evidence.deleteMany({ where: { userId, sourceType: 'GITHUB_REPOSITORY' } })
  await syncStudentSkills(userId)
  await refreshDerivedInsights(userId)
}
