import Link from 'next/link'
import { Rocket, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, Code2, Layers, BarChart2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-200 bg-mobbin-grid">
      {/* Mobbin-style Floating Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#080b11]/80 backdrop-blur-xl">
        <div className="flex h-20 items-center justify-between px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">LaunchProof</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-600/25"
            >
              <span>Launch App</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobbin Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-24 text-center space-y-8 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-400 shadow-sm shadow-blue-500/20">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Evidence-Based Career Readiness Engine for SWE Students</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
          Stop collecting generic certificates.{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Build verifiable evidence.
          </span>
        </h1>

        <p className="text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Save the software engineering jobs you actually want. LaunchProof identifies what employers repeatedly ask for, compares requirements against what you have actually built, and tells you what to improve next.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-2xl shadow-blue-600/30"
          >
            <span>Explore Demo Account (Alex Chen)</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Feature Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-20">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0d1320]/80 p-6 space-y-3 backdrop-blur-md hover:border-blue-500/30 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <BarChart2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-extrabold text-white">Target Market Requirements</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extract recurring skills, tools, and hard eligibility requirements across saved job postings.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0d1320]/80 p-6 space-y-3 backdrop-blur-md hover:border-emerald-500/30 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-extrabold text-white">Evidence-Based Skill Graph</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Distinguish between strong code proof, weak evidence, self-reported skills, and missing gaps.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0d1320]/80 p-6 space-y-3 backdrop-blur-md hover:border-purple-500/30 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-extrabold text-white">Impact Project Generator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate targeted project plans that upgrade existing repos to close multiple evidence gaps at once.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
