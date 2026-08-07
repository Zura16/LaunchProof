import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import { CheckCircle2, Circle, ArrowLeft, ShieldCheck, Target, ListChecks, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const plan = ALEX_CHEN_SEED.projectPlan

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </Link>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">{plan.title}</h1>
              <span className="rounded bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
                {plan.difficulty} Difficulty
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Upgrading existing repository: <span className="font-mono text-slate-200">{plan.targetRepoName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout: Objective + Why It Matters + Definition of Done */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-8 space-y-6">
          {/* Why This Project Matters */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span>Why This Project Matters (Market Evidence Alignment)</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{plan.whyItMatters}</p>
          </div>

          {/* Objective */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" />
              <span>Project Objective</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{plan.objective}</p>
          </div>

          {/* Interactive Milestones & Task Checklist */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-blue-400" />
              <span>Project Milestones ({plan.milestones.length} Steps)</span>
            </h3>

            <div className="space-y-4">
              {plan.milestones.map((m) => (
                <div
                  key={m.order}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/20 text-xs font-bold text-blue-400">
                        {m.order}
                      </span>
                      <h4 className="font-bold text-white text-sm">{m.title}</h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">{m.description}</p>

                  <div className="space-y-2 pt-1">
                    {m.tasks.map((task, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 rounded border border-slate-800/80 bg-slate-950 p-2.5 text-xs text-slate-200"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <span className={task.completed ? 'line-through text-slate-500' : ''}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Definition of Done & Expected Evidence Created */}
        <div className="md:col-span-4 space-y-6">
          {/* Definition of Done */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Definition of Done</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {plan.definitionOfDone.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Evidence Generated */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-5 space-y-3">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Evidence Generated Upon Completion</span>
            </h3>
            <div className="space-y-2 text-xs">
              {plan.expectedEvidence.map((item, i) => (
                <div
                  key={i}
                  className="rounded bg-emerald-500/10 p-2 text-emerald-300 border border-emerald-500/20 font-medium"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
