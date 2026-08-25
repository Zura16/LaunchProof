import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { requireUser } from '@/lib/auth/require-user'
import { signOut } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()

  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } })
  if (!profile?.onboardingCompletedAt) {
    redirect('/onboarding')
  }

  const githubAccount = await prisma.gitHubAccount.findUnique({
    where: { userId: user.id },
    select: { username: true },
  })

  const name = profile.fullName || user.name || 'Student'
  const subtitle = profile.university && profile.major ? `${profile.university} · ${profile.major}` : profile.university || ''
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function signOutAction() {
    'use server'
    await signOut({ redirectTo: '/' })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar name={name} subtitle={subtitle} initials={initials} signOutAction={signOutAction} />
      <div className="flex min-h-screen flex-col pl-60">
        <Header githubUsername={githubAccount?.username ?? null} />
        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-8">{children}</main>
      </div>
    </div>
  )
}
