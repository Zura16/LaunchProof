'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { RecommendationData } from '@/lib/services/seed-data.service'

interface ActionsProps {
  recommendations: RecommendationData[]
}

export function HighestImpactActions({ recommendations }: ActionsProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100/80 backdrop-blur-md border border-slate-300/80 text-slate-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-base font-black text-slate-900">Highest-Impact Actions</h2>
            <span className="rounded-full bg-slate-100/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-900 border border-slate-300/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
              Evidence-Prioritized
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Weighted by recurring target job demand and missing codebase evidence.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={rec.id}
            className="group relative rounded-xl border border-slate-200/80 bg-slate-50/60 backdrop-blur-md p-5 transition-all duration-300 hover:border-slate-400 hover:bg-white hover:shadow-xl hover:shadow-slate-900/10"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white shadow-sm">
                    {index + 1}
                  </span>
                  <h3 className="font-black text-slate-900 text-sm group-hover:text-slate-900 transition-colors">
                    {rec.title}
                  </h3>
                  <span className="rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-300/80 shadow-xs">
                    Repo: {rec.targetProject}
                  </span>
                </div>

                {/* Legibility Box */}
                <div className="rounded-lg border border-slate-200/80 bg-white/90 backdrop-blur-md p-3 text-xs text-slate-800 leading-relaxed shadow-sm">
                  <span className="font-bold text-slate-900">Why am I seeing this? </span>
                  <span className="text-slate-600">{rec.explanation}</span>
                </div>

                {/* Evidence Gaps Closed */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500">Closes Gaps:</span>
                  {rec.gapsSolved.map((gap, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-50/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 shadow-sm"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      {gap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Liquid Glass Action Button */}
              <div className="flex items-center justify-end md:self-center">
                <Link
                  href={`/projects/plan-1`}
                  className="glass-btn-primary py-2 px-4 text-xs"
                >
                  <span>Create plan</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
