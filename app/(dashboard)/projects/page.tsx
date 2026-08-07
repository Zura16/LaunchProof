import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import Link from 'next/link'
import { FolderGit2, ArrowRight, CheckCircle2, Clock } from 'lucide-react'

export default function ProjectsPage() {
  const plan = ALEX_CHEN_SEED.projectPlan

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Evidence Project Plans</h1>
          <p className="text-xs text-slate-400 mt-1">
            Projects designed specifically to close high-frequency skill evidence gaps.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-slate-700 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Active Project Plan
            </span>
            <h2 className="text-lg font-bold text-white mt-2">{plan.title}</h2>
            <p className="text-xs text-slate-400 mt-1">Target Repo: <span className="text-slate-200 font-mono">{plan.targetRepoName}</span></p>
          </div>
          <span className="rounded bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
            Difficulty: {plan.difficulty}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{plan.objective}</p>

        <div className="flex flex-wrap gap-2 pt-2">
          {plan.skillsTargeted.map((skill, i) => (
            <span key={i} className="rounded bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
              {skill}
            </span>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">4 Milestones • 11 Subtasks</span>
          <Link
            href={`/projects/plan-1`}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            <span>Open Project Plan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
