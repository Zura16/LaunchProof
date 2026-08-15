'use client'

import { useState } from 'react'
import { loadAppState } from '@/lib/store/app-store'
import Link from 'next/link'
import { FolderGit2, ArrowRight, CheckCircle2, Clock, ShieldCheck, Sparkles, Copy, Check, FileCode } from 'lucide-react'

export default function ProjectsPage() {
  const plan = loadAppState().projectPlan
  const [copiedTemplate, setCopiedTemplate] = useState(false)

  const handleCopyIssueTemplate = () => {
    const issueMarkdown = `## 🚀 LaunchProof Milestone Task: ${plan.title}

### 🎯 Objective
${plan.objective}

### 💡 Why It Matters
${plan.whyItMatters}

### 📋 Checklist Milestones
${plan.milestones.map((m) => `#### Step ${m.order}: ${m.title}\n${m.tasks.map((t) => `- [ ] ${t.text}`).join('\n')}`).join('\n\n')}

### 🛡️ Verified Evidence Citations
${plan.expectedEvidence.map((e) => `- ${e}`).join('\n')}
`
    navigator.clipboard.writeText(issueMarkdown)
    setCopiedTemplate(true)
    setTimeout(() => setCopiedTemplate(false), 2000)
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FolderGit2 className="h-6 w-6 text-slate-900" />
            <span>Impact Project Roadmap</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Evidence-generating project roadmaps designed to close critical market skill gaps.
          </p>
        </div>

        <button onClick={handleCopyIssueTemplate} className="glass-btn-secondary py-2.5 px-4 text-xs font-bold">
          {copiedTemplate ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-700">GitHub Issue Template Copied!</span>
            </>
          ) : (
            <>
              <FileCode className="h-4 w-4 text-slate-700" />
              <span>Export as GitHub Issue Template</span>
            </>
          )}
        </button>
      </div>

      {/* Flagship Project Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-8 space-y-6 shadow-xl hover:border-slate-400 transition-all">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-900 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                FLAGSHIP RECOMMENDATION
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-xs">
                {plan.difficulty} Difficulty
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-2">{plan.title}</h2>
            <p className="text-xs font-mono text-slate-500 font-bold">Target Repository: {plan.targetRepoName}</p>
          </div>

          <Link
            href="/projects/plan-1"
            className="glass-btn-primary py-2.5 px-5 shrink-0 text-xs font-bold"
          >
            <span>Open Interactive Checklist</span>
            <ArrowRight className="h-4 w-4 text-white" />
          </Link>
        </div>

        <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          {plan.objective}
        </p>

        {/* Milestones Preview */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Milestone Steps Preview</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {plan.milestones.map((m) => (
              <div key={m.order} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white">
                    {m.order}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs">{m.title}</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-medium pl-7">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
