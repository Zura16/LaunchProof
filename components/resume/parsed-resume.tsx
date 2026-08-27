import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import type { ResumeAnalysisResult } from '@/schemas/resume-analysis'
import type { EvidenceStrength } from '@prisma/client'

interface Props {
  parsed: ResumeAnalysisResult
  // Canonical skill id + strength for each skill name the résumé mentioned,
  // so every extracted skill links to its evidence.
  skillLinks: Map<string, { skillId: string; strength: EvidenceStrength }>
}

const STRENGTH_VARIANT: Record<EvidenceStrength, 'success' | 'info' | 'warning' | 'outline' | 'destructive'> = {
  STRONG: 'success',
  MODERATE: 'info',
  WEAK: 'warning',
  SELF_REPORTED: 'outline',
  MISSING: 'destructive',
}

function SkillChip({ name, skillLinks }: { name: string; skillLinks: Props['skillLinks'] }) {
  const link = skillLinks.get(name.trim().toLowerCase())
  if (!link) return <Badge variant="outline">{name}</Badge>

  return (
    <Link href={`/evidence/${link.skillId}`}>
      <Tooltip content={`Evidence strength: ${link.strength.replace('_', ' ').toLowerCase()}`}>
        <Badge variant={STRENGTH_VARIANT[link.strength]} className="cursor-pointer">
          {name}
        </Badge>
      </Tooltip>
    </Link>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{title}</p>
      {children}
    </div>
  )
}

export function ParsedResume({ parsed, skillLinks }: Props) {
  const isEmpty =
    parsed.education.length === 0 &&
    parsed.experiences.length === 0 &&
    parsed.projects.length === 0 &&
    parsed.listedSkills.length === 0

  if (isEmpty) {
    return (
      <p className="text-sm text-slate-500">
        Analysis completed, but no structured content could be identified in this résumé.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {parsed.education.length > 0 && (
        <Section title="Education">
          <div className="space-y-2">
            {parsed.education.map((e, i) => (
              <div key={i} className="rounded-md border border-slate-100 px-3 py-2">
                <p className="text-sm font-medium text-slate-900">{e.institution}</p>
                <p className="text-xs text-slate-500">
                  {[e.degree, e.field].filter(Boolean).join(', ')}
                  {e.graduationDate ? ` · ${e.graduationDate}` : ''}
                  {e.gpa ? ` · GPA ${e.gpa}` : ''}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {parsed.experiences.length > 0 && (
        <Section title="Experience">
          <div className="space-y-3">
            {parsed.experiences.map((e, i) => (
              <div key={i} className="rounded-md border border-slate-100 px-3 py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <p className="text-sm font-medium text-slate-900">
                    {e.role} <span className="font-normal text-slate-500">· {e.company}</span>
                  </p>
                  {(e.startDate || e.endDate) && (
                    <p className="text-xs text-slate-400">{[e.startDate, e.endDate].filter(Boolean).join(' – ')}</p>
                  )}
                </div>
                {e.bullets.length > 0 && (
                  <ul className="mt-1.5 space-y-1">
                    {e.bullets.map((b, bi) => (
                      <li key={bi} className="text-xs leading-relaxed text-slate-600">
                        · {b}
                      </li>
                    ))}
                  </ul>
                )}
                {e.skillsUsed.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {e.skillsUsed.map((s) => (
                      <SkillChip key={s} name={s} skillLinks={skillLinks} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {parsed.projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-3">
            {parsed.projects.map((p, i) => (
              <div key={i} className="rounded-md border border-slate-100 px-3 py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">{p.title}</p>
                  <div className="flex items-center gap-2">
                    {p.repoUrl && (
                      <a
                        href={p.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
                      >
                        Repo <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {p.liveUrl && (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
                      >
                        Live <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
                {p.description && <p className="mt-1 text-xs leading-relaxed text-slate-600">{p.description}</p>}
                {p.bullets.length > 0 && (
                  <ul className="mt-1.5 space-y-1">
                    {p.bullets.map((b, bi) => (
                      <li key={bi} className="text-xs leading-relaxed text-slate-600">
                        · {b}
                      </li>
                    ))}
                  </ul>
                )}
                {p.technologies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.technologies.map((t) => (
                      <SkillChip key={t} name={t} skillLinks={skillLinks} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {parsed.listedSkills.length > 0 && (
        <Section title="Listed skills">
          <p className="-mt-1 mb-2 text-xs text-slate-500">
            These appear only in a skills list, with nothing in the résumé demonstrating them.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {parsed.listedSkills.map((s) => (
              <SkillChip key={s} name={s} skillLinks={skillLinks} />
            ))}
          </div>
        </Section>
      )}

      {parsed.certifications.length > 0 && (
        <Section title="Certifications">
          <ul className="space-y-1">
            {parsed.certifications.map((c, i) => (
              <li key={i} className="text-xs text-slate-600">
                · {c}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}
