import { redirect } from 'next/navigation'
import { Rocket } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { toDateInputValue } from '@/lib/utils'
import { getLinkedGitHubAccount } from '@/lib/services/github-connect.service'
import { ProgressSteps } from '@/components/onboarding/progress-steps'
import { StepStudentInfo } from '@/components/onboarding/step-student-info'
import { StepCareerGoals } from '@/components/onboarding/step-career-goals'
import { StepResume } from '@/components/onboarding/step-resume'
import { StepGitHub } from '@/components/onboarding/step-github'
import { StepJobs } from '@/components/onboarding/step-jobs'

const STEP_TITLES: Record<number, { title: string; description: string }> = {
  1: { title: 'Tell us about you', description: 'This helps LaunchProof tailor role and skill demand to your situation.' },
  2: { title: 'What are you targeting?', description: 'LaunchProof filters and prioritizes gaps around these goals.' },
  3: { title: 'Upload your résumé', description: 'Optional, but the more evidence you connect, the better your gap analysis.' },
  4: { title: 'Connect GitHub', description: 'Optional. Your repositories become real, checkable evidence.' },
  5: { title: 'Save your target jobs', description: 'Save at least 3 jobs you actually want so LaunchProof can find real patterns.' },
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { step?: string }
}) {
  const user = await requireUser()
  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } })

  if (profile?.onboardingCompletedAt) {
    redirect('/dashboard')
  }

  const requestedStep = Number(searchParams.step ?? '1')
  const step = Number.isFinite(requestedStep) && requestedStep >= 1 && requestedStep <= 5 ? requestedStep : 1

  let stepContent: React.ReactNode = null

  if (step === 1) {
    stepContent = (
      <StepStudentInfo
        initial={{
          fullName: profile?.fullName,
          university: profile?.university,
          degree: profile?.degree,
          major: profile?.major,
          graduationDate: toDateInputValue(profile?.graduationDate) || undefined,
          academicYear: profile?.academicYear,
        }}
      />
    )
  } else if (step === 2) {
    stepContent = (
      <StepCareerGoals
        initial={{
          targetRoleCategories: profile?.targetRoleCategories ?? [],
          preferredJobTypes: profile?.preferredJobTypes ?? [],
          preferredLocations: profile?.preferredLocations ?? [],
          remotePreference: profile?.remotePreference || undefined,
          workAuthorization: profile?.workAuthorization || undefined,
          sponsorshipRequired: profile?.sponsorshipRequired,
        }}
      />
    )
  } else if (step === 3) {
    const resume = await prisma.resume.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    stepContent = <StepResume existingFileName={resume?.fileName} />
  } else if (step === 4) {
    const githubAccount = await getLinkedGitHubAccount(user.id)
    stepContent = <StepGitHub connectedUsername={githubAccount?.username ?? null} />
  } else {
    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: user.id },
      include: { jobPosting: { select: { company: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    })
    stepContent = (
      <StepJobs
        savedJobs={savedJobs.map((s) => ({ id: s.id, company: s.jobPosting.company, title: s.jobPosting.title }))}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
            <Rocket className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-900">LaunchProof</span>
        </div>

        <ProgressSteps current={step} />

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h1 className="text-base font-semibold text-slate-900">{STEP_TITLES[step].title}</h1>
            <p className="text-xs text-slate-500">{STEP_TITLES[step].description}</p>
          </div>
          {stepContent}
        </div>
      </div>
    </div>
  )
}
