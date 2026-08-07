'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  ShieldCheck,
  Lightbulb,
  FolderGit2,
  Send,
  FileText,
  UserCheck,
  Settings,
  Rocket,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mainNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Target Jobs', href: '/jobs', icon: Briefcase, badge: '12' },
  { name: 'Market Insights', href: '/market-insights', icon: BarChart3 },
  { name: 'Skill Evidence', href: '/evidence', icon: ShieldCheck },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb, badge: '3', highlight: true },
  { name: 'Projects', href: '/projects', icon: FolderGit2 },
  { name: 'Applications', href: '/applications', icon: Send, badge: '4' },
]

const secondaryNav = [
  { name: 'Resume Workspace', href: '/resume', icon: FileText },
  { name: 'Proof Profile', href: '/profile', icon: UserCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-white/[0.08] bg-[#090d16] flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.08] px-6">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 font-bold text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base">LaunchProof</span>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-400 border border-blue-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Career Evidence System</p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="space-y-6 px-3 py-4">
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Core Workflow
            </div>
            <nav className="space-y-1">
              {mainNav.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white shadow-sm border border-blue-500/30'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          'h-4 w-4 transition-colors',
                          isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold',
                          isActive
                            ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30'
                            : 'bg-white/[0.06] text-slate-400 group-hover:bg-white/[0.1]'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Student System
            </div>
            <nav className="space-y-1">
              {secondaryNav.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white border border-blue-500/30'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          'h-4 w-4 transition-colors',
                          isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="border-t border-white/[0.08] p-3">
        <div className="rounded-xl border border-white/[0.08] bg-[#0d1320] p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 p-[1px]">
              <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-xs text-white">
                AC
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Alex Chen</p>
              <p className="text-[10px] text-slate-400 truncate">UC Berkeley • CS '27</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px]">
            <span className="text-slate-400">Target Role:</span>
            <span className="font-semibold text-emerald-400">SWE Intern '27</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
