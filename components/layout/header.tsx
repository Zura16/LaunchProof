'use client'

import { usePathname } from 'next/navigation'
import { Github } from 'lucide-react'
import { MobileNav } from '@/components/layout/mobile-nav'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/jobs': 'Target Jobs',
  '/market-insights': 'Market Insights',
  '/evidence': 'Skill Evidence',
  '/recommendations': 'Recommendations',
  '/projects': 'Projects',
  '/applications': 'Applications',
  '/resume': 'Resume',
  '/settings': 'Settings',
  '/onboarding': 'Onboarding',
}

function titleForPath(pathname: string) {
  const exact = PAGE_TITLES[pathname]
  if (exact) return exact
  const match = Object.keys(PAGE_TITLES).find((p) => p !== '/' && pathname.startsWith(p))
  return match ? PAGE_TITLES[match] : 'LaunchProof'
}

interface HeaderProps {
  githubUsername: string | null
  name: string
  subtitle: string
  signOutAction: () => Promise<void>
}

export function Header({ githubUsername, name, subtitle, signOutAction }: HeaderProps) {
  const pathname = usePathname() ?? ''
  const title = titleForPath(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNav name={name} subtitle={subtitle} signOutAction={signOutAction} />
        <h1 className="truncate text-sm font-semibold text-slate-900">{title}</h1>
      </div>

      {githubUsername && (
        <div className="hidden shrink-0 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 sm:flex">
          <Github className="h-3.5 w-3.5" aria-hidden="true" />
          <span>@{githubUsername}</span>
        </div>
      )}
    </header>
  )
}
