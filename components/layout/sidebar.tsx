'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, Rocket, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MAIN_NAV, isActivePath } from '@/components/layout/nav-items'

interface SidebarProps {
  name: string
  subtitle: string
  initials: string
  signOutAction: () => Promise<void>
}

export function Sidebar({ name, subtitle, initials, signOutAction }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col justify-between border-r border-slate-200 bg-white lg:flex">
      <div>
        <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
            <Rocket className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-900">LaunchProof</span>
        </div>

        <nav aria-label="Main" className="space-y-0.5 px-3 py-4">
          {MAIN_NAV.map((item) => {
            const isActive = isActivePath(pathname, item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900',
                  isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-900">{name}</p>
            <p className="truncate text-[11px] text-slate-500">{subtitle}</p>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1">
          <Link
            href="/settings"
            aria-current={isActivePath(pathname, '/settings') ? 'page' : undefined}
            className="flex flex-1 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <Settings className="h-3.5 w-3.5" aria-hidden="true" />
            Settings
          </Link>
          <form action={signOutAction} className="flex-1">
            <button
              type="submit"
              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
