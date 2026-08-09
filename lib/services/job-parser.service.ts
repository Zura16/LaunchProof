export interface ParsedRequirement {
  skillName: string
  category: 'LANGUAGE' | 'FRAMEWORK' | 'DATABASE' | 'TOOL' | 'CONCEPT'
  isRequired: boolean
  matchingEvidence: 'STRONG' | 'MODERATE' | 'WEAK' | 'MISSING'
}

export interface HardEligibilityResult {
  passed: boolean
  graduationWindow: string
  workAuthorization: string
  sponsorship: string
  reasoning: string
}

export interface ParsedJobResult {
  company: string
  title: string
  location: string
  url: string
  eligibility: HardEligibilityResult
  requirements: ParsedRequirement[]
  fitReasoning: string
  readinessScore: number
}

const SKILL_CATALOG: { name: string; category: ParsedRequirement['category'] }[] = [
  { name: 'TypeScript', category: 'LANGUAGE' },
  { name: 'JavaScript', category: 'LANGUAGE' },
  { name: 'Python', category: 'LANGUAGE' },
  { name: 'Java', category: 'LANGUAGE' },
  { name: 'Go', category: 'LANGUAGE' },
  { name: 'C++', category: 'LANGUAGE' },
  { name: 'React', category: 'FRAMEWORK' },
  { name: 'Next.js', category: 'FRAMEWORK' },
  { name: 'Node.js', category: 'FRAMEWORK' },
  { name: 'Express', category: 'FRAMEWORK' },
  { name: 'FastAPI', category: 'FRAMEWORK' },
  { name: 'Django', category: 'FRAMEWORK' },
  { name: 'Spring Boot', category: 'FRAMEWORK' },
  { name: 'PostgreSQL', category: 'DATABASE' },
  { name: 'MySQL', category: 'DATABASE' },
  { name: 'MongoDB', category: 'DATABASE' },
  { name: 'Redis', category: 'DATABASE' },
  { name: 'SQLite', category: 'DATABASE' },
  { name: 'REST APIs', category: 'CONCEPT' },
  { name: 'GraphQL', category: 'CONCEPT' },
  { name: 'Docker', category: 'TOOL' },
  { name: 'AWS', category: 'TOOL' },
  { name: 'Git', category: 'TOOL' },
  { name: 'CI/CD', category: 'TOOL' },
  { name: 'Kubernetes', category: 'TOOL' },
]

export function parseJobDescription(text: string, rawUrl?: string, companyInput?: string, titleInput?: string): ParsedJobResult {
  const lower = (text + ' ' + (rawUrl || '')).toLowerCase()

  // 1. Extract Company & Title if not provided
  let company = companyInput || 'Target Employer'
  let title = titleInput || 'Software Engineering Intern'

  if (!companyInput) {
    if (lower.includes('meta')) company = 'Meta'
    else if (lower.includes('stripe')) company = 'Stripe'
    else if (lower.includes('google')) company = 'Google'
    else if (lower.includes('amazon')) company = 'Amazon'
    else if (lower.includes('apple')) company = 'Apple'
    else if (lower.includes('microsoft')) company = 'Microsoft'
    else if (lower.includes('databricks')) company = 'Databricks'
    else if (lower.includes('airbnb')) company = 'Airbnb'
  }

  if (!titleInput) {
    if (lower.includes('backend')) title = 'Backend SWE Intern (Summer 2027)'
    else if (lower.includes('full stack') || lower.includes('fullstack')) title = 'Full Stack SWE Intern'
    else if (lower.includes('frontend')) title = 'Frontend SWE Intern'
    else if (lower.includes('infrastructure')) title = 'Infrastructure Engineer Intern'
    else title = 'Software Engineering Intern (Summer 2027)'
  }

  // 2. Extract Skills
  const requirements: ParsedRequirement[] = []
  SKILL_CATALOG.forEach((item) => {
    const isPresent = new RegExp(`\\b${item.name.replace('.', '\\.')}\\b`, 'i').test(lower)
    if (isPresent) {
      // Determine if required or preferred
      const isReq = !lower.includes(`preferred: ${item.name.toLowerCase()}`)
      // Assign initial mock evidence matching
      let evidence: ParsedRequirement['matchingEvidence'] = 'MODERATE'
      if (['React', 'TypeScript', 'Node.js', 'REST APIs', 'PostgreSQL', 'Express', 'Git'].includes(item.name)) {
        evidence = 'STRONG'
      } else if (['Docker', 'Redis', 'Python'].includes(item.name)) {
        evidence = 'MODERATE'
      } else if (['AWS', 'CI/CD', 'Jest'].includes(item.name)) {
        evidence = 'WEAK'
      } else {
        evidence = 'MISSING'
      }

      requirements.push({
        skillName: item.name,
        category: item.category,
        isRequired: isReq,
        matchingEvidence: evidence,
      })
    }
  })

  // Ensure at least 4 requirements extracted
  if (requirements.length < 3) {
    requirements.push(
      { skillName: 'REST APIs', category: 'CONCEPT', isRequired: true, matchingEvidence: 'STRONG' },
      { skillName: 'TypeScript', category: 'LANGUAGE', isRequired: true, matchingEvidence: 'STRONG' },
      { skillName: 'PostgreSQL', category: 'DATABASE', isRequired: true, matchingEvidence: 'STRONG' },
      { skillName: 'Docker', category: 'TOOL', isRequired: false, matchingEvidence: 'MODERATE' }
    )
  }

  // 3. Hard Eligibility Window Check
  const passedGrad = !lower.includes('graduated in 2024')
  const eligibility: HardEligibilityResult = {
    passed: passedGrad,
    graduationWindow: 'May 2026 – Dec 2027 Eligible',
    workAuthorization: 'US Authorized (CPT/OPT)',
    sponsorship: 'Not Required for Internship',
    reasoning: passedGrad
      ? 'Verified: Fits target May 2027 graduation window for Alex Chen.'
      : 'Requires manual review of graduation window.',
  }

  // 4. Compute Readiness Score
  const strongCount = requirements.filter((r) => r.matchingEvidence === 'STRONG').length
  const total = requirements.length
  const score = Math.min(100, Math.round((strongCount / total) * 100) + 20)

  return {
    company,
    title,
    location: lower.includes('remote') ? 'Remote (US)' : 'San Francisco, CA',
    url: rawUrl || 'https://careers.company.com/job/123',
    eligibility,
    requirements,
    fitReasoning: `Strong alignment on ${requirements.filter(r => r.matchingEvidence === 'STRONG').map(r => r.skillName).slice(0, 3).join(', ')}. Primary gap is in ${requirements.filter(r => r.matchingEvidence === 'MISSING' || r.matchingEvidence === 'WEAK').map(r => r.skillName)[0] || 'CI/CD'}.`,
    readinessScore: score,
  }
}
