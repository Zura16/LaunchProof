import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import Link from 'next/link'
import { FolderGit2, ArrowRight } from 'lucide-react'

export default function ProjectsPage() {
  const plan = ALEX_CHEN_SEED.projectPlan

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Evidence Project Plans</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Projects designed specifically to close high-frequency skill evidence gaps.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-4 shadow-xl hover:border-slate-400 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <span className="rounded-full bg-slate-900/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-xs">
              Active Project Plan
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-3">{plan.title}</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">Target Repo: <span className="text-slate-900 font-mono font-bold">{plan.targetRepoName}</span></p>
          </div>
          <span className="rounded-full bg-slate-100/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-900 border border-slate-300/80 shadow-xs">
            Difficulty: {plan.difficulty}
          </span>
        </div>

        <p className="text-xs font-medium text-slate-600 leading-relaxed">{plan.objective}</p>

        <div className="flex flex-wrap gap-2 pt-2">
          {plan.skillsTargeted.map((skill, i) => (
            <span key={i} className="rounded-xl bg-slate-100/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-800 border border-slate-300/80">
              {skill}
            </span>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100/80 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">4 Milestones • 11 Subtasks</span>
          <Link
            href={`/projects/plan-1`}
            className="glass-btn-primary py-2.5 px-4"
          >
            <span>Open Project Plan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
