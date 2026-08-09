'use client'

import Link from 'next/link'
import dynamicImport from 'next/dynamic'
import { Rocket, ArrowRight, Sparkles, UserPlus, Play } from 'lucide-react'
import { loadAppState, saveAppState } from '@/lib/store/app-store'
import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import { useRouter } from 'next/navigation'

// Monochrome 3D Expanded Wireframe Net Background
const WireframeNetBg = dynamicImport(
  () => import('@/components/ui/wireframe-net-bg').then((mod) => mod.WireframeNetBg),
  { ssr: false }
)

export default function LandingPage() {
  const router = useRouter()

  const handleLoadDemo = () => {
    const demoState = {
      savedJobs: ALEX_CHEN_SEED.savedJobs,
      projectPlan: ALEX_CHEN_SEED.projectPlan,
      applications: ALEX_CHEN_SEED.applications,
      customSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Express', 'REST APIs', 'Git'],
      profile: ALEX_CHEN_SEED.profile,
    }
    saveAppState(demoState as any)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white relative overflow-hidden bg-mobbin-grid">
      {/* 3D Wireframe Net Full-Screen Viewport Background */}
      <WireframeNetBg fullScreen={true} opacity={0.45} />

      {/* Floating Liquid Glass Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/75 backdrop-blur-2xl shadow-xs">
        <div className="flex h-20 items-center justify-between px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/90 backdrop-blur-xl font-bold text-white shadow-lg shadow-slate-900/20 ring-1 ring-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">LaunchProof</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadDemo}
              className="glass-btn-secondary py-2 px-4 text-xs"
            >
              <span>Explore Demo</span>
            </button>
            <Link
              href="/onboarding"
              className="glass-btn-primary py-2 px-4 text-xs"
            >
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4 text-white" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Landing Content */}
      <main className="max-w-5xl mx-auto px-6 py-28 text-center space-y-10 relative z-10 pointer-events-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/80 backdrop-blur-xl px-4 py-1.5 text-xs font-bold text-slate-900 shadow-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
          <Sparkles className="h-3.5 w-3.5 text-slate-900" />
          <span>Evidence-Based Career Readiness Engine for SWE Students</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight max-w-4xl mx-auto drop-shadow-xs">
          Stop collecting generic certificates.{' '}
          <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
            Build verifiable evidence.
          </span>
        </h1>

        <p className="text-base md:text-lg text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
          Save the software engineering jobs you actually want. LaunchProof identifies what employers repeatedly ask for, compares requirements against what you have actually built, and tells you what to improve next.
        </p>

        {/* Dual Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/onboarding"
            className="w-full sm:w-auto glass-btn-primary text-sm px-8 py-4"
          >
            <UserPlus className="h-5 w-5 text-white" />
            <span>Create Your Own Account (Free)</span>
            <ArrowRight className="h-5 w-5 text-white" />
          </Link>

          <button
            onClick={handleLoadDemo}
            className="w-full sm:w-auto glass-btn-secondary text-sm px-8 py-4"
          >
            <Play className="h-4 w-4 text-slate-700" />
            <span>Explore Demo Account (Alex Chen)</span>
          </button>
        </div>
      </main>
    </div>
  )
}
