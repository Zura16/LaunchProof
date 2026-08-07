'use client'

import { useState } from 'react'
import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import { ReadinessOverview } from '@/components/dashboard/readiness-overview'
import { HighestImpactActions } from '@/components/dashboard/highest-impact-actions'
import { MarketQuickBar } from '@/components/dashboard/market-quick-bar'
import Link from 'next/link'
import { Plus, Upload, ArrowRight, ShieldCheck, Filter, Sparkles, Code2, Layers } from 'lucide-react'

export default function DashboardPage() {
  const seed = ALEX_CHEN_SEED
  const [activeFilter, setActiveFilter] = useState('ALL')

  const filterOptions = [
    { label: 'All Insights', id: 'ALL' },
    { label: 'Critical Gaps', id: 'GAPS' },
    { label: 'Verified Strengths', id: 'STRENGTHS' },
    { label: 'Backend & DB', id: 'BACKEND' },
    { label: 'DevOps & Cloud', id: 'DEVOPS' },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Welcome with Mobbin Radial Background Glow */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#0d1320] via-[#090d16] to-[#0d1320] p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 translate-y-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Evidence Engine Active
              </span>
              <span className="text-slate-600 font-bold">•</span>
              <span className="text-xs font-semibold text-blue-400">Target: SWE Intern 2027</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white">
              Welcome back, <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">{seed.profile.fullName.split(' ')[0]}</span>
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed">
              LaunchProof compares your 12 saved target job requirements against verified GitHub repositories and résumé proofs to guide what you should improve next.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/jobs/new"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus className="h-4 w-4" />
              <span>Save New Job</span>
            </Link>
            <Link
              href="/resume"
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0d1320] px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-[#121929] hover:border-slate-700 transition-all"
            >
              <Upload className="h-4 w-4 text-slate-400" />
              <span>Upload Resume</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 1. Mobbin Filter Pills Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 overflow-x-auto">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[10px]">Filter View:</span>
          <div className="flex items-center gap-1.5 ml-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setActiveFilter(opt.id)}
                className={activeFilter === opt.id ? 'mobbin-pill-active' : 'mobbin-pill'}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <span className="text-xs text-slate-400 hidden md:block">
          Showing 12 jobs • 14 extracted requirements
        </span>
      </div>

      {/* 2. Readiness Metrics Overview */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Career Readiness Overview
        </h2>
        <ReadinessOverview
          savedJobsCount={seed.savedJobs.length}
          skillsCount={seed.marketInsights.length}
          strongCount={seed.evidences.filter((e) => e.strength === 'STRONG').length}
          weakCount={seed.evidences.filter((e) => e.strength === 'WEAK' || e.strength === 'MODERATE').length}
          missingCount={seed.evidences.filter((e) => e.strength === 'MISSING').length}
          applicationsCount={seed.applications.length}
        />
      </section>

      {/* 3. High Impact Actions & Target Market Breakdown Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <HighestImpactActions recommendations={seed.recommendations} />
        </div>
        <div className="lg:col-span-5">
          <MarketQuickBar insights={seed.marketInsights} />
        </div>
      </div>

      {/* 4. Flagship Action Plan Banner */}
      <section className="relative rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-[#0d1320] to-[#090d16] p-8 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
          <ShieldCheck className="h-80 w-80 text-blue-400" />
        </div>

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Recommended Flagship Action Plan</span>
          </div>

          <h3 className="text-xl font-extrabold text-white">
            {seed.projectPlan.title}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            {seed.projectPlan.whyItMatters}
          </p>

          <div className="pt-2 flex items-center gap-4">
            <Link
              href="/projects/plan-1"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/20"
            >
              <span>View Interactive Roadmap</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-slate-400">
              Difficulty: <strong className="text-white font-bold">{seed.projectPlan.difficulty}</strong> • Milestones: <strong className="text-white font-bold">4 Steps</strong>
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
