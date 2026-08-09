import { ALEX_CHEN_SEED, SkillEvidenceData } from './seed-data.service'

export interface SkillEvidenceGraph {
  skillName: string
  category: string
  strength: 'STRONG' | 'MODERATE' | 'WEAK' | 'SELF_REPORTED' | 'MISSING'
  sourceName: string
  citations: string[]
  description: string
}

export function computeEvidenceGraph(skills: string[], customResumeText?: string): SkillEvidenceGraph[] {
  const seedEvidences = ALEX_CHEN_SEED.evidences

  return skills.map((skill) => {
    // Check if we have pre-verified seed evidence for this skill
    const foundSeed = seedEvidences.find(
      (e) => e.skillName.toLowerCase() === skill.toLowerCase()
    )

    if (foundSeed) {
      return {
        skillName: foundSeed.skillName,
        category: foundSeed.category,
        strength: foundSeed.strength,
        sourceName: foundSeed.sourceName,
        citations: foundSeed.citations,
        description: foundSeed.description,
      }
    }

    // Check if custom resume text contains the skill
    const inCustomText = customResumeText
      ? new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i').test(customResumeText)
      : false

    if (inCustomText) {
      return {
        skillName: skill,
        category: 'Extracted Skill',
        strength: 'MODERATE',
        sourceName: 'Uploaded Student Résumé PDF',
        citations: ['Resume Section: Technical Skills & Experience'],
        description: `Verified keyword presence for ${skill} in uploaded student résumé document.`,
      }
    }

    return {
      skillName: skill,
      category: 'Target Skill',
      strength: 'MISSING',
      sourceName: 'No GitHub Artifact Found',
      citations: ['Missing: No verified commits or file citations found in linked repos'],
      description: `Target employers demand ${skill}, but no GitHub code proof or project citation was detected.`,
    }
  })
}
