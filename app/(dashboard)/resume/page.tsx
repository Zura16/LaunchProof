import { FileText, Trash2, AlertTriangle } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UploadResumeForm } from '@/components/resume/upload-resume-form'
import { ParsedResume } from '@/components/resume/parsed-resume'
import { AnalyzeResumeButton } from '@/components/resume/analyze-resume-button'
import { deleteResumeAction } from '@/app/(dashboard)/resume/actions'
import { resumeAnalysisResultSchema } from '@/schemas/resume-analysis'
import type { EvidenceStrength } from '@prisma/client'

export default async function ResumePage({ searchParams }: { searchParams: { analysisError?: string } }) {
  const user = await requireUser()

  const [resumes, studentSkills] = await Promise.all([
    prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studentSkill.findMany({ where: { userId: user.id }, include: { skill: true } }),
  ])

  // Map every known skill name and alias to its canonical id so extracted
  // résumé skills can link through to their evidence.
  const aliases = await prisma.skillAlias.findMany({
    where: { skillId: { in: studentSkills.map((s) => s.skillId) } },
  })
  const skillLinks = new Map<string, { skillId: string; strength: EvidenceStrength }>()
  for (const s of studentSkills) {
    skillLinks.set(s.skill.name.toLowerCase(), { skillId: s.skillId, strength: s.highestStrength })
  }
  for (const a of aliases) {
    const owner = studentSkills.find((s) => s.skillId === a.skillId)
    if (owner) skillLinks.set(a.alias.toLowerCase(), { skillId: a.skillId, strength: owner.highestStrength })
  }

  return (
    <div className="space-y-6">
      {searchParams.analysisError && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="flex items-start gap-2 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-xs text-red-800">{searchParams.analysisError}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="py-4">
          <UploadResumeForm />
        </CardContent>
      </Card>

      {resumes.length === 0 ? (
        <p className="text-sm text-slate-500">No résumé uploaded yet.</p>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => {
            const parsed = resumeAnalysisResultSchema.safeParse(resume.parsedContent)
            return (
              <Card key={resume.id}>
                <CardHeader className="flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                    <div>
                      <CardTitle>{resume.fileName}</CardTitle>
                      <CardDescription>
                        Uploaded {resume.createdAt.toLocaleDateString()}
                        {resume.rawText ? ` · ${resume.rawText.length.toLocaleString()} characters extracted` : ''}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <AnalyzeResumeButton resumeId={resume.id} analyzed={parsed.success} />
                    <form action={deleteResumeAction.bind(null, resume.id)}>
                      <Button type="submit" size="sm" variant="ghost">
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </form>
                  </div>
                </CardHeader>
                <CardContent>
                  {parsed.success ? (
                    <ParsedResume parsed={parsed.data} skillLinks={skillLinks} />
                  ) : (
                    <div className="space-y-2">
                      <Badge variant="outline">Structured analysis pending</Badge>
                      <p className="text-xs text-slate-500">
                        Text has been extracted from this PDF. Run analysis to pull out your education, experience,
                        projects, and skills — and to turn them into evidence LaunchProof can compare against your
                        target jobs.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
