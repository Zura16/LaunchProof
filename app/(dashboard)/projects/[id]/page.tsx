'use client'

import { useState, useEffect } from 'react'
import { loadAppState, saveAppState } from '@/lib/store/app-store'
import { CheckCircle2, Circle, ArrowLeft, ShieldCheck, Target, ListChecks, Sparkles, Terminal } from 'lucide-react'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const [plan, setPlan] = useState(() => loadAppState().projectPlan)

  useEffect(() => {
    const current = loadAppState()
    setPlan(current.projectPlan)
  }, [])

  const toggleTask = (milestoneOrder: number, taskIndex: number) => {
    const updatedMilestones = plan.milestones.map((m) => {
      if (m.order === milestoneOrder) {
        const updatedTasks = m.tasks.map((t, idx) => {
          if (idx === taskIndex) {
            return { ...t, completed: !t.completed }
          }
          return t
        })
        return { ...m, tasks: updatedTasks }
      }
      return m
    })

    const updatedPlan = { ...plan, milestones: updatedMilestones }
    setPlan(updatedPlan)

    const currentState = loadAppState()
    saveAppState({ ...currentState, projectPlan: updatedPlan })
  }

  // Calculate completed task count
  const allTasks = plan.milestones.flatMap((m) => m.tasks)
  const completedCount = allTasks.filter((t) => t.completed).length
  const progressPercent = Math.round((completedCount / allTasks.length) * 100) || 0

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="space-y-3 border-b border-slate-200/80 pb-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </Link>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{plan.title}</h1>
              <span className="rounded-full bg-slate-900/90 backdrop-blur-md px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                {plan.difficulty} Difficulty
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Upgrading existing repository: <span className="font-mono font-bold text-slate-900">{plan.targetRepoName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/projects/plan-1/git-patch"
              className="glass-btn-primary py-2.5 px-4 text-xs"
            >
              <Terminal className="h-4 w-4 text-white" />
              <span>Get Git Code Patch</span>
            </Link>

            <div className="text-right pl-2 border-l border-slate-200/80">
              <span className="text-xs font-bold text-slate-500">Overall Progress</span>
              <p className="text-lg font-black text-slate-900">{progressPercent}% Completed</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full rounded-full bg-slate-100/80 border border-slate-200/80 overflow-hidden p-0.5">
          <div
            className="h-full bg-slate-900 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Grid Layout: Objective + Why It Matters + Definition of Done */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-8 space-y-6">
          {/* Why This Project Matters */}
          <div className="rounded-2xl border border-slate-300/80 bg-slate-100/80 backdrop-blur-md p-5 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-slate-900" />
              <span>Why This Project Matters (Market Evidence Alignment)</span>
            </div>
            <p className="text-xs font-medium text-slate-700 leading-relaxed">{plan.whyItMatters}</p>
          </div>

          {/* Objective */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-5 space-y-2 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Target className="h-4 w-4 text-slate-900" />
              <span>Project Objective</span>
            </h3>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">{plan.objective}</p>
          </div>

          {/* Interactive Milestones & Task Checklist */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-slate-900" />
              <span>Interactive Project Milestones ({plan.milestones.length} Steps)</span>
            </h3>

            <div className="space-y-4">
              {plan.milestones.map((m) => (
                <div
                  key={m.order}
                  className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-slate-100/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white shadow-sm">
                        {m.order}
                      </span>
                      <h4 className="font-black text-slate-900 text-sm">{m.title}</h4>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-500">{m.description}</p>

                  <div className="space-y-2 pt-1">
                    {m.tasks.map((task, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleTask(m.order, idx)}
                        className={`w-full flex items-start gap-2.5 rounded-xl border p-3 text-xs text-left transition-all cursor-pointer shadow-xs ${
                          task.completed
                            ? 'border-emerald-200 bg-emerald-50/80 text-emerald-950 font-medium'
                            : 'border-slate-200/80 bg-slate-50/80 text-slate-800 font-medium hover:border-slate-400 hover:bg-white'
                        }`}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <span className={task.completed ? 'line-through text-emerald-800 font-normal' : ''}>
                          {task.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="md:col-span-4 space-y-6">
          {/* Definition of Done */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-5 space-y-3 shadow-md">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-slate-900" />
              <span>Definition of Done</span>
            </h3>
            <ul className="space-y-2 text-xs font-medium text-slate-700">
              {plan.definitionOfDone.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-slate-900 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Evidence Generated */}
          <div className="rounded-2xl border border-slate-300/80 bg-slate-100/80 backdrop-blur-md p-5 space-y-3 shadow-md">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-900" />
              <span>Evidence Generated Upon Completion</span>
            </h3>
            <div className="space-y-2 text-xs">
              {plan.expectedEvidence.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/90 backdrop-blur-md p-2.5 text-slate-900 border border-slate-300/80 font-black shadow-xs"
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
