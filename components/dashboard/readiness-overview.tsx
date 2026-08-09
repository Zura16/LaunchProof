'use client'

import { Briefcase, ShieldCheck, AlertTriangle, Layers, Send, TrendingUp } from 'lucide-react'

interface OverviewProps {
  savedJobsCount: number
  skillsCount: number
  strongCount: number
  weakCount: number
  missingCount: number
  applicationsCount: number
}

export function ReadinessOverview({
  savedJobsCount,
  skillsCount,
  strongCount,
  weakCount,
  missingCount,
  applicationsCount,
}: OverviewProps) {
  const cards = [
    {
      label: 'Target Jobs Saved',
      value: savedJobsCount,
      subtext: 'Across SWE & Backend',
      icon: Briefcase,
      color: 'text-slate-900',
      glow: 'shadow-slate-900/10',
      border: 'hover:border-slate-400',
      bg: 'bg-slate-100 border-slate-300',
    },
    {
      label: 'Skills Extracted',
      value: skillsCount,
      subtext: 'Analyzed requirements',
      icon: Layers,
      color: 'text-slate-900',
      glow: 'shadow-slate-900/10',
      border: 'hover:border-slate-400',
      bg: 'bg-slate-100 border-slate-300',
    },
    {
      label: 'Strong Proof Skills',
      value: strongCount,
      subtext: 'Verified in Code/Resume',
      icon: ShieldCheck,
      color: 'text-emerald-700',
      glow: 'shadow-emerald-500/10',
      border: 'hover:border-emerald-500/40',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Weak/Moderate Proof',
      value: weakCount,
      subtext: 'Needs project upgrade',
      icon: TrendingUp,
      color: 'text-amber-700',
      glow: 'shadow-amber-500/10',
      border: 'hover:border-amber-500/40',
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      label: 'Missing Critical Gaps',
      value: missingCount,
      subtext: 'In high market demand',
      icon: AlertTriangle,
      color: 'text-rose-700',
      glow: 'shadow-rose-500/10',
      border: 'hover:border-rose-500/40',
      bg: 'bg-rose-50 border-rose-200',
    },
    {
      label: 'Active Applications',
      value: applicationsCount,
      subtext: 'In pipeline',
      icon: Send,
      color: 'text-slate-900',
      glow: 'shadow-slate-900/10',
      border: 'hover:border-slate-400',
      bg: 'bg-slate-100 border-slate-300',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 ${card.border} hover:bg-slate-50/80 hover:shadow-xl ${card.glow}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-tight">{card.label}</span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl border ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black tracking-tight text-slate-900">{card.value}</span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-slate-500 truncate">{card.subtext}</p>
        </div>
      ))}
    </div>
  )
}
