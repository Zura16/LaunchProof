import { prisma } from '@/lib/db/prisma'
import type { EvidenceStrength } from '@prisma/client'

/**
 * A cheap, deterministic read on how a discovered posting lines up with the
 * student's evidence.
 *
 * This is a *pre-screen*, not the real analysis: it matches known canonical
 * skills and their aliases against the posting text. Full AI extraction runs
 * only when the student saves the job — running it across every posting in a
 * feed would cost a fortune and tell them little more than this does.
 *
 * It deliberately produces counts, never a percentage or a score, for the
 * same reason the rest of the app doesn't.
 */
export interface FeedFit {
  proven: string[]
  gaps: string[]
  /** Skills mentioned that the student has no evidence for at all. */
  unknownToStudent: string[]
  matchedTotal: number
}

const PROVEN: EvidenceStrength[] = ['STRONG', 'MODERATE']

interface SkillLexiconEntry {
  skillId: string
  name: string
  patterns: RegExp[]
}

function toPattern(term: string): RegExp | null {
  const trimmed = term.trim()
  // Very short tokens ("R", "Go", "C") produce constant false positives in
  // prose; require an explicit word boundary and a minimum length.
  if (trimmed.length < 2) return null
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^a-zA-Z0-9+#])${escaped}([^a-zA-Z0-9+#]|$)`, 'i')
}

let lexiconCache: { builtAt: number; entries: SkillLexiconEntry[] } | null = null
const LEXICON_TTL_MS = 5 * 60 * 1000

/** Canonical skills plus their aliases, compiled to matchers. */
async function getSkillLexicon(): Promise<SkillLexiconEntry[]> {
  if (lexiconCache && Date.now() - lexiconCache.builtAt < LEXICON_TTL_MS) {
    return lexiconCache.entries
  }

  const skills = await prisma.skill.findMany({ include: { aliases: true } })
  const entries = skills.map((s) => ({
    skillId: s.id,
    name: s.name,
    patterns: [s.name, ...s.aliases.map((a) => a.alias)]
      .map(toPattern)
      .filter((p): p is RegExp => p !== null),
  }))

  lexiconCache = { builtAt: Date.now(), entries }
  return entries
}

export async function computeFeedFit(
  userId: string,
  jobs: { id: string; title: string; descriptionText: string | null }[]
): Promise<Map<string, FeedFit>> {
  const [lexicon, studentSkills] = await Promise.all([
    getSkillLexicon(),
    prisma.studentSkill.findMany({ where: { userId }, select: { skillId: true, highestStrength: true } }),
  ])

  const strengthBySkillId = new Map(studentSkills.map((s) => [s.skillId, s.highestStrength]))
  const results = new Map<string, FeedFit>()

  for (const job of jobs) {
    // Title is included so a posting whose description hasn't been hydrated
    // still yields something.
    const haystack = `${job.title}\n${job.descriptionText ?? ''}`

    const proven: string[] = []
    const gaps: string[] = []
    const unknownToStudent: string[] = []

    for (const entry of lexicon) {
      if (!entry.patterns.some((p) => p.test(haystack))) continue

      const strength = strengthBySkillId.get(entry.skillId)
      if (!strength) {
        unknownToStudent.push(entry.name)
      } else if (PROVEN.includes(strength)) {
        proven.push(entry.name)
      } else {
        gaps.push(entry.name)
      }
    }

    results.set(job.id, {
      proven: proven.sort(),
      gaps: gaps.sort(),
      unknownToStudent: unknownToStudent.sort(),
      matchedTotal: proven.length + gaps.length + unknownToStudent.length,
    })
  }

  return results
}
