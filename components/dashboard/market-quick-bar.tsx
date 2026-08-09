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
        return <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 shadow-sm">Strong</span>
      case 'MODERATE':
        return <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 shadow-sm">Moderate</span>
      case 'WEAK':
        return <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-800 border border-orange-200 shadow-sm">Weak</span>
      default:
        return <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200 shadow-sm">Missing</span>
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 border border-slate-300 text-slate-900">
              <BarChart2 className="h-4 w-4" />
            </div>
            <h2 className="text-base font-black text-slate-900">Target Market Demand</h2>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Across {insights[0]?.totalJobs || 12} saved SWE internship postings.
          </p>
        </div>
        <Link
          href="/market-insights"
          className="flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-slate-700 transition-colors"
        >
          <span>Breakdown</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-4">
        {insights.map((item) => (
          <div key={item.skillName} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span>{item.skillName}</span>
                <span className="text-slate-400 font-normal text-[11px]">({item.frequencyCount}/{item.totalJobs} jobs)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900">{item.frequencyPercent}%</span>
                {getBadge(item.studentEvidence)}
              </div>
            </div>

            {/* Progress Bar in Black/Slate */}
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  item.studentEvidence === 'STRONG'
                    ? 'bg-slate-900 shadow-sm'
                    : item.studentEvidence === 'MODERATE'
                    ? 'bg-slate-700 shadow-sm'
                    : 'bg-slate-400 shadow-sm'
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
