'use client'

import { Search, ExternalLink, Github, Command } from 'lucide-react'
import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-8 backdrop-blur-2xl">
      {/* Left: Status Ticker */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-slate-300/80 bg-slate-100/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-900 shadow-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-900"></span>
          </span>
          <span>Evidence Graph Synced</span>
        </div>
        <span className="text-slate-300 font-bold">•</span>
        <span className="text-xs font-semibold text-slate-600">12 Jobs Saved & Analyzed</span>
      </div>

      {/* Right: Search & Proof Profile */}
      <div className="flex items-center gap-3">
        {/* Search Bar with Keyboard Shortcut Badge */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search skills, repos, jobs..."
            className="h-9 w-64 rounded-xl border border-slate-200/80 bg-slate-100/80 backdrop-blur-md pl-9 pr-12 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all shadow-[inset_0_1px_1px_rgba(0,0,0,0.03)]"
          />
          <div className="absolute right-2.5 top-2 flex items-center gap-0.5 rounded bg-slate-200/80 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-300/80">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>

        {/* Public Proof Profile Liquid Glass Link */}
        <Link
          href="/u/alex-chen"
          target="_blank"
          className="glass-btn-secondary py-2"
        >
          <span>Proof Profile</span>
          <ExternalLink className="h-3 w-3 text-slate-500" />
        </Link>

        {/* GitHub Connected Liquid Glass Pill */}
        <div className="glass-btn-secondary py-2">
          <Github className="h-3.5 w-3.5 text-slate-900" />
          <span>@alexchen</span>
        </div>
      </div>
    </header>
  )
}
