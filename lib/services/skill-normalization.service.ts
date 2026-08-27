import { prisma } from '@/lib/db/prisma'
import type { Skill, SkillCategory } from '@prisma/client'

function normalizeForCompare(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface ResolveInput {
  rawPhrase: string
  canonicalSkillGuess: string
  skillCategory: SkillCategory
}

/**
 * Lookup-only resolution: steps 1-4 of the normalization order, without
 * creating anything. Used for weak signals (repository topics, README
 * mentions) that should attach to a skill we already track but must never
 * invent new canonical skills — otherwise a tag like "rest-api" would
 * become a separate skill alongside "REST APIs".
 */
export async function findCanonicalSkill(...candidates: string[]): Promise<Skill | null> {
  const usable = candidates.map((c) => c?.trim()).filter(Boolean)
  if (usable.length === 0) return null

  for (const candidate of usable) {
    const exact = await prisma.skill.findFirst({
      where: { name: { equals: candidate, mode: 'insensitive' } },
    })
    if (exact) return exact
  }

  for (const candidate of usable) {
    const alias = await prisma.skillAlias.findFirst({
      where: { alias: { equals: candidate, mode: 'insensitive' } },
      include: { skill: true },
    })
    if (alias) return alias.skill
  }

  const allSkills = await prisma.skill.findMany({ include: { aliases: true } })
  for (const candidate of usable) {
    const normalized = normalizeForCompare(candidate)
    for (const skill of allSkills) {
      if (normalizeForCompare(skill.name) === normalized) return skill
      if (skill.aliases.some((a) => normalizeForCompare(a.alias) === normalized)) return skill
    }
  }

  return null
}

// Normalization order, per product spec: (1) exact canonical-name match,
// (2) alias table match, (3) the AI's own controlled canonical guess
// (steps 1-2 re-run against that guess), (4) a lightweight normalized
// fallback match to catch near-duplicates the AI phrased slightly
// differently, and only then create a new canonical Skill.
export async function resolveCanonicalSkill(input: ResolveInput): Promise<Skill> {
  const { rawPhrase, canonicalSkillGuess, skillCategory } = input

  const existing = await findCanonicalSkill(canonicalSkillGuess, rawPhrase)
  if (existing) return existing

  const baseSlug = slugify(canonicalSkillGuess) || 'skill'
  let slug = baseSlug
  let suffix = 1
  while (await prisma.skill.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++suffix}`
  }

  try {
    return await prisma.skill.create({
      data: {
        name: canonicalSkillGuess,
        slug,
        category: skillCategory,
        aliases:
          normalizeForCompare(rawPhrase) !== normalizeForCompare(canonicalSkillGuess)
            ? { create: [{ alias: rawPhrase }] }
            : undefined,
      },
    })
  } catch {
    // Lost a race with a concurrent request creating the same skill —
    // fall back to whatever now exists rather than erroring the request.
    const existing = await prisma.skill.findFirst({
      where: { name: { equals: canonicalSkillGuess, mode: 'insensitive' } },
    })
    if (existing) return existing
    throw new Error(`Failed to resolve or create skill "${canonicalSkillGuess}"`)
  }
}
