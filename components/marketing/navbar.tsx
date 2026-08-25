import Link from 'next/link'
import { Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
            <Rocket className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-900">LaunchProof</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#product" className="hover:text-slate-900">Product</a>
          <a href="#how-it-works" className="hover:text-slate-900">How it works</a>
          <a href="#demo" className="hover:text-slate-900">Demo</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Sign In
          </Link>
          <Link href="/login">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
