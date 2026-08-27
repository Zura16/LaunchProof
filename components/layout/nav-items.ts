import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  ShieldCheck,
  Lightbulb,
  FolderGit2,
  Send,
  FileText,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

export const MAIN_NAV: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Target Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Market Insights', href: '/market-insights', icon: BarChart3 },
  { name: 'Skill Evidence', href: '/evidence', icon: ShieldCheck },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
  { name: 'Projects', href: '/projects', icon: FolderGit2 },
  { name: 'Applications', href: '/applications', icon: Send },
  { name: 'Resume', href: '/resume', icon: FileText },
]

export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}
