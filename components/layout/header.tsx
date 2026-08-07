'use client'

import { Search, ExternalLink, Github, CheckCircle2, Command } from 'lucide-react'
import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/[0.08] bg-[#080b11]/80 px-8 backdrop-blur-xl">
      {/* Left: Status Ticker */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Evidence Graph Synced</span>
        </div>
        <span className="text-slate-600 font-bold">•</span>
        <span className="text-xs font-medium text-slate-400">12 Jobs Saved & Analyzed</span>
      </div>

      {/* Right: Search & Proof Profile */}
      <div className="flex items-center gap-3">
        {/* Mobbin-style Search Bar with Keyboard Shortcut Badge */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search skills, repos, jobs..."
            className="h-9 w-64 rounded-xl border border-white/[0.08] bg-[#0d1320] pl-9 pr-12 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <div className="absolute right-2.5 top-2 flex items-center gap-0.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-slate-400 border border-white/10">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>

        {/* Public Proof Profile Link */}
        <Link
          href="/u/alex-chen"
          target="_blank"
          className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#0d1320] px-3 py-2 text-xs font-semibold text-slate-200 hover:border-blue-500/40 hover:bg-[#121929] transition-all"
        >
          <span>Proof Profile</span>
          <ExternalLink className="h-3 w-3 text-slate-400" />
        </Link>

        {/* GitHub Connected Pill */}
        <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400">
          <Github className="h-3.5 w-3.5 text-emerald-400" />
          <span>@alexchen</span>
          <CheckCircle2 className="h-3 w-3 text-emerald-400 ml-0.5" />
        </div>
      </div>
    </header>
  )
}
