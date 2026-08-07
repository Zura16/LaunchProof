'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, CheckCircle2, ShieldAlert, Layers } from 'lucide-react'
import { RecommendationData } from '@/lib/services/seed-data.service'

interface ActionsProps {
  recommendations: RecommendationData[]
}

export function HighestImpactActions({ recommendations }: ActionsProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0d1320]/90 p-6 shadow-2xl backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-base font-extrabold text-white">Highest-Impact Actions</h2>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 border border-blue-500/20">
              Evidence-Prioritized
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Weighted by recurring target job demand and missing codebase evidence.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={rec.id}
            className="group relative rounded-xl border border-white/[0.08] bg-[#090d16]/80 p-5 transition-all duration-300 hover:border-blue-500/40 hover:bg-[#0c1220] hover:shadow-xl hover:shadow-blue-500/5"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/20 text-xs font-black text-blue-400 border border-blue-500/30">
                    {index + 1}
                  </span>
                  <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                    {rec.title}
                  </h3>
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-semibold text-slate-400 border border-white/10">
                    Repo: {rec.targetProject}
                  </span>
                </div>

                {/* Mobbin Human Explainability Box */}
                <div className="rounded-lg border border-white/[0.06] bg-[#0d1320]/80 p-3 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-white">Why am I seeing this? </span>
                  <span className="text-slate-300">{rec.explanation}</span>
                </div>

                {/* Evidence Gaps Closed */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400">Closes Gaps:</span>
                  {rec.gapsSolved.map((gap, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      {gap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end md:self-center">
                <Link
                  href={`/projects/plan-1`}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 transition-all"
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
