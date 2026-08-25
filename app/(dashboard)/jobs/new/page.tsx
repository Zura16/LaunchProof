import { requireUser } from '@/lib/auth/require-user'
import { AddJobForm } from '@/components/jobs/add-job-form'

export default async function NewJobPage() {
  await requireUser()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <p className="text-sm text-slate-500">
          Skill requirement extraction runs automatically once you save a job — check back on the job&apos;s detail
          page for its analysis.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <AddJobForm />
      </div>
    </div>
  )
}
