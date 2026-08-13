'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import { ReadinessOverview } from '@/components/dashboard/readiness-overview'
import { HighestImpactActions } from '@/components/dashboard/highest-impact-actions'
import { MarketQuickBar } from '@/components/dashboard/market-quick-bar'
import { ReadinessRadar } from '@/components/dashboard/readiness-radar'
import { loadAppState } from '@/lib/store/app-store'
import Link from 'next/link'
import { Plus, Upload, ArrowRight, Filter, Sparkles } from 'lucide-react'

// Monochrome Expanded 3D Wireframe Net Background
const WireframeNetBg = dynamic(
  () => import('@/components/ui/wireframe-net-bg').then((mod) => mod.WireframeNetBg),
  { ssr: false }
)

export default function DashboardPage() {
  const seed = ALEX_CHEN_SEED
  const [userName, setUserName] = useState('Alex')
  const [activeFilter, setActiveFilter] = useState('ALL')

  useEffect(() => {
    const state = loadAppState()
    if (state.profile?.fullName) {
      setUserName(state.profile.fullName.split(' ')[0])
    }
  }, [])

  const filterOptions = [
    { label: 'All Insights', id: 'ALL' },
    { label: 'Critical Gaps', id: 'GAPS' },
    { label: 'Verified Strengths', id: 'STRENGTHS' },
    { label: 'Backend & DB', id: 'BACKEND' },
    { label: 'DevOps & Cloud', id: 'DEVOPS' },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner with Dynamic User Name & 3D Net Canvas */}
      <div className="relative rounded-3xl border border-slate-200/80 bg-white/90 p-8 md:p-10 shadow-xl overflow-hidden backdrop-blur-2xl">
        {/* Expanded 3D Wireframe Net Canvas Container */}
        <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none opacity-50">
          <WireframeNetBg className="absolute inset-0 h-full w-full pointer-events-none" opacity={0.6} />
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-slate-900 animate-pulse" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Evidence Engine Active
              </span>
              <span className="text-slate-300 font-bold">•</span>
              <span className="text-xs font-bold text-slate-900">Target: SWE Intern 2027</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Welcome back, <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">{userName}</span>
            </h1>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              LaunchProof compares your saved target job requirements against verified GitHub repositories and résumé proofs to guide what you should improve next.
            </p>
          </div>

          {/* Quick Action Liquid Glass Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/jobs/new"
              className="glass-btn-primary py-2.5 px-4"
            >
              <Plus className="h-4 w-4" />
              <span>Save New Job</span>
            </Link>
            <Link
              href="/resume"
              className="glass-btn-secondary py-2.5 px-4"
            >
              <Upload className="h-4 w-4 text-slate-700" />
              <span>Upload Resume</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 1. Filter Pills Bar */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 overflow-x-auto">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-500" />
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
        <span className="text-xs font-semibold text-slate-500 hidden md:block">
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

      {/* 3. High Impact Actions & Target Market Breakdown Grid with Skill Radar */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-8">
          <HighestImpactActions recommendations={seed.recommendations} />
        </div>
        <div className="lg:col-span-5 space-y-8">
          <ReadinessRadar />
          <MarketQuickBar insights={seed.marketInsights} />
        </div>
      </div>

      {/* 4. Flagship Action Plan Banner */}
      <section className="relative rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-xl overflow-hidden backdrop-blur-2xl">
        <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none opacity-40">
          <WireframeNetBg className="absolute inset-0 h-full w-full pointer-events-none" opacity={0.5} />
        </div>

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-900 border border-slate-300/80 shadow-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
            <Sparkles className="h-3.5 w-3.5 text-slate-900" />
            <span>Recommended Flagship Action Plan</span>
          </div>

          <h3 className="text-xl font-black text-slate-900">
            {seed.projectPlan.title}
          </h3>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {seed.projectPlan.whyItMatters}
          </p>

          <div className="pt-2 flex items-center gap-4">
            <Link
              href="/projects/plan-1"
              className="glass-btn-primary py-2.5 px-5"
            >
              <span>View Interactive Roadmap</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-slate-500 font-semibold">
              Difficulty: <strong className="text-slate-900 font-bold">{seed.projectPlan.difficulty}</strong> • Milestones: <strong className="text-slate-900 font-bold">4 Steps</strong>
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
