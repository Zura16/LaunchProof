'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Settings, Rocket, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MAIN_NAV, isActivePath } from '@/components/layout/nav-items'

interface MobileNavProps {
  name: string
  subtitle: string
  signOutAction: () => Promise<void>
}

export function MobileNav({ name, subtitle, signOutAction }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close on navigation, so tapping a link doesn't leave the drawer covering
  // the page the user just asked for.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Escape should dismiss it, and the page behind must not scroll while the
  // drawer is over it.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="-ml-1 rounded-md p-1.5 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-slate-900/30"
          />

          <div className="absolute inset-y-0 left-0 flex w-64 flex-col justify-between border-r border-slate-200 bg-white shadow-xl">
            <div>
              <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
                <span className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
                    <Rocket className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold tracking-tight text-slate-900">LaunchProof</span>
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation menu"
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
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
                        'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium',
                        isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="border-t border-slate-200 p-3">
              <div className="px-2 py-1.5">
                <p className="truncate text-xs font-medium text-slate-900">{name}</p>
                <p className="truncate text-[11px] text-slate-500">{subtitle}</p>
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Settings
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
