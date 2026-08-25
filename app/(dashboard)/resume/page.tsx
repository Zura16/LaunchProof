import { FileText, Trash2 } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UploadResumeForm } from '@/components/resume/upload-resume-form'
import { deleteResumeAction } from '@/app/(dashboard)/resume/actions'

export default async function ResumePage() {
  const user = await requireUser()

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    include: { experiences: true, projects: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-4">
          <UploadResumeForm />
        </CardContent>
      </Card>

      {resumes.length === 0 ? (
        <p className="text-sm text-slate-500">No résumé uploaded yet.</p>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => (
            <Card key={resume.id}>
              <CardContent className="space-y-4 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{resume.fileName}</p>
                      <p className="text-xs text-slate-500">Uploaded {resume.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <form action={deleteResumeAction.bind(null, resume.id)}>
                    <Button type="submit" size="sm" variant="ghost">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </form>
                </div>

                {resume.parsedContent ? (
                  <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">Experience</p>
                      <p className="text-sm text-slate-600">{resume.experiences.length} entries</p>
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">Projects</p>
                      <p className="text-sm text-slate-600">{resume.projects.length} entries</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-slate-100 pt-4">
                    <Badge variant="outline">Structured analysis pending</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
