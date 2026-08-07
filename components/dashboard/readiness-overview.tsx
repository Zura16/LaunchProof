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
      color: 'text-blue-400',
      glow: 'shadow-blue-500/10',
      border: 'hover:border-blue-500/40',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Skills Extracted',
      value: skillsCount,
      subtext: 'Analyzed requirements',
      icon: Layers,
      color: 'text-purple-400',
      glow: 'shadow-purple-500/10',
      border: 'hover:border-purple-500/40',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'Strong Proof Skills',
      value: strongCount,
      subtext: 'Verified in Code/Resume',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      glow: 'shadow-emerald-500/10',
      border: 'hover:border-emerald-500/40',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Weak/Moderate Proof',
      value: weakCount,
      subtext: 'Needs project upgrade',
      icon: TrendingUp,
      color: 'text-amber-400',
      glow: 'shadow-amber-500/10',
      border: 'hover:border-amber-500/40',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Missing Critical Gaps',
      value: missingCount,
      subtext: 'In high market demand',
      icon: AlertTriangle,
      color: 'text-rose-400',
      glow: 'shadow-rose-500/10',
      border: 'hover:border-rose-500/40',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
    {
      label: 'Active Applications',
      value: applicationsCount,
      subtext: 'In pipeline',
      icon: Send,
      color: 'text-cyan-400',
      glow: 'shadow-cyan-500/10',
      border: 'hover:border-cyan-500/40',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`rounded-2xl border border-white/[0.08] bg-[#0d1320]/80 p-4 transition-all duration-300 ${card.border} hover:bg-[#11192b] hover:shadow-xl ${card.glow}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 tracking-tight">{card.label}</span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl border ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black tracking-tight text-white">{card.value}</span>
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-400 truncate">{card.subtext}</p>
        </div>
      ))}
    </div>
  )
}
