'use client'

import { useState, useEffect } from 'react'
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
  RefreshCw,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { loadAppState, saveAppState } from '@/lib/store/app-store'
import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'

const mainNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Target Jobs', href: '/jobs', icon: Briefcase, badge: '12' },
  { name: 'Market Insights', href: '/market-insights', icon: BarChart3 },
  { name: 'Skill Evidence', href: '/evidence', icon: ShieldCheck },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb, badge: '3' },
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
  const [profileName, setProfileName] = useState('Alex Chen')
  const [university, setUniversity] = useState("UC Berkeley • CS '27")

  useEffect(() => {
    const state = loadAppState()
    if (state.profile?.fullName) {
      setProfileName(state.profile.fullName)
      setUniversity(`${state.profile.university} • ${state.profile.major}`)
    }
  }, [])

  const handleResetToDemo = () => {
    const demoState = {
      savedJobs: ALEX_CHEN_SEED.savedJobs,
      projectPlan: ALEX_CHEN_SEED.projectPlan,
      applications: ALEX_CHEN_SEED.applications,
      customSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Express', 'REST APIs', 'Git'],
      profile: ALEX_CHEN_SEED.profile,
    }
    saveAppState(demoState as any)
    window.location.reload()
  }

  const initials = profileName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200/80 bg-white/85 backdrop-blur-2xl flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200/80 px-6">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/90 backdrop-blur-xl font-bold text-white shadow-md shadow-slate-900/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black tracking-tight text-slate-900 text-base">LaunchProof</span>
              <span className="rounded-full bg-slate-100/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-900 border border-slate-300/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">Career Evidence System</p>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="space-y-6 px-3 py-4">
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
                      'group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200',
                      isActive
                        ? 'bg-slate-900/90 backdrop-blur-xl text-white font-black shadow-md shadow-slate-900/15 border border-slate-700/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:backdrop-blur-md hover:text-slate-900'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          'h-4 w-4 transition-colors',
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-xs',
                          isActive
                            ? 'bg-white/90 text-slate-900 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
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
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
                      'group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200',
                      isActive
                        ? 'bg-slate-900/90 backdrop-blur-xl text-white font-black shadow-md shadow-slate-900/15 border border-slate-700/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:backdrop-blur-md hover:text-slate-900'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          'h-4 w-4 transition-colors',
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
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

      {/* User Footer Profile & Mode Switcher */}
      <div className="border-t border-slate-200/80 p-3 space-y-2">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 backdrop-blur-md p-3 hover:border-slate-300 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-full bg-slate-900 p-[1px]">
              <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-xs text-white shadow-inner">
                {initials}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{profileName}</p>
              <p className="text-[10px] text-slate-500 truncate">{university}</p>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/80 pt-2 text-[10px]">
            <Link href="/onboarding" className="font-bold text-slate-900 hover:underline flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Edit Account</span>
            </Link>
            <button
              onClick={handleResetToDemo}
              className="text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              <span>Load Demo</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
