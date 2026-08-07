'use client'

import Link from 'next/link'
import { ArrowRight, BarChart2 } from 'lucide-react'
import { MarketInsightData } from '@/lib/services/seed-data.service'

interface MarketQuickProps {
  insights: MarketInsightData[]
}

export function MarketQuickBar({ insights }: MarketQuickProps) {
  const getBadge = (evidence: string) => {
    switch (evidence) {
      case 'STRONG':
        return <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">Strong</span>
      case 'MODERATE':
        return <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">Moderate</span>
      case 'WEAK':
        return <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-bold text-orange-400 border border-orange-500/20">Weak</span>
      default:
        return <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">Missing</span>
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0d1320]/90 p-6 shadow-2xl backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <BarChart2 className="h-4 w-4" />
            </div>
            <h2 className="text-base font-extrabold text-white">Target Market Demand</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Across {insights[0]?.totalJobs || 12} saved SWE internship postings.
          </p>
        </div>
        <Link
          href="/market-insights"
          className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>Breakdown</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-4">
        {insights.map((item) => (
          <div key={item.skillName} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-white">
                <span>{item.skillName}</span>
                <span className="text-slate-500 font-normal text-[11px]">({item.frequencyCount}/{item.totalJobs} jobs)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-200">{item.frequencyPercent}%</span>
                {getBadge(item.studentEvidence)}
              </div>
            </div>

            {/* Glowing Mobbin Progress Bar */}
            <div className="h-2 w-full rounded-full bg-[#080b11] overflow-hidden p-0.5 border border-white/[0.04]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  item.studentEvidence === 'STRONG'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                    : item.studentEvidence === 'MODERATE'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-sm shadow-amber-500/50'
                    : 'bg-gradient-to-r from-rose-500 to-red-400 shadow-sm shadow-rose-500/50'
                }`}
                style={{ width: `${item.frequencyPercent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
