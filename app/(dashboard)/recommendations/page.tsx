'use client'

import { useState, useEffect } from 'react'
import { loadAppState } from '@/lib/store/app-store'
import {
  Sparkles,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  GraduationCap,
  Heart,
  Ban,
  MoreHorizontal,
  Check,
  Send,
  Building2,
  ExternalLink,
} from 'lucide-react'

interface RecommendedJob {
  id: string
  title: string
  company: string
  description: string
  logoText: string
  logoBg: string
  timeAgo: string
  alumniCount: number
  isEarlyApplicant: boolean
  location: string
  workType: string
  employmentType: string
  salaryRange: string
  experienceLevel: string
  yearsExp: string
  applicantCountText: string
  matchScore: number
  matchTier: string
  companyStage: string
  h1bSponsorLikely: boolean
  isSaved?: boolean
}

export default function RecommendationsPage() {
  const [userSkills, setUserSkills] = useState<string[]>([])
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const state = loadAppState()
    setUserSkills(state.customSkills || ['React', 'TypeScript', 'Node.js', 'PostgreSQL'])
  }, [])

  const toggleSaveJob = (id: string) => {
    setSavedJobs((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const recommendedJobsList: RecommendedJob[] = [
    {
      id: 'rec-1',
      title: 'Full Stack Engineer',
      company: 'HHAeXchange',
      description: 'Homecare management software for Medicaid LTSS providers and payers',
      logoText: 'HX',
      logoBg: 'bg-slate-900 text-white',
      timeAgo: '2 hours ago',
      alumniCount: 2,
      isEarlyApplicant: true,
      location: 'United States',
      workType: 'Remote',
      employmentType: 'Full-time',
      salaryRange: '$80K/yr - $120K/yr',
      experienceLevel: 'New Grad, Entry, Mid Level',
      yearsExp: '0+ years exp',
      applicantCountText: '< 25 applicants',
      matchScore: 78,
      matchTier: 'GOOD MATCH',
      companyStage: 'Late Stage Co.',
      h1bSponsorLikely: true,
    },
    {
      id: 'rec-2',
      title: 'Early Career Machine Learning Engineer, Applied AI',
      company: 'Brain Co.',
      description: 'AI platforms and applications for major institutions',
      logoText: 'BC',
      logoBg: 'bg-slate-900 text-white',
      timeAgo: '7 hours ago',
      alumniCount: 0,
      isEarlyApplicant: true,
      location: 'San Francisco Bay Area',
      workType: 'Hybrid',
      employmentType: 'Full-time',
      salaryRange: '$130K/yr - $165K/yr',
      experienceLevel: 'Entry Level',
      yearsExp: '0+ years exp',
      applicantCountText: '< 25 applicants',
      matchScore: 77,
      matchTier: 'GOOD MATCH',
      companyStage: 'Early Stage Co.',
      h1bSponsorLikely: true,
    },
    {
      id: 'rec-3',
      title: 'Backend Software Engineer (Distributed Systems)',
      company: 'Stripe',
      description: 'Financial infrastructure for the internet',
      logoText: 'ST',
      logoBg: 'bg-slate-900 text-white',
      timeAgo: '1 day ago',
      alumniCount: 4,
      isEarlyApplicant: false,
      location: 'San Francisco, CA',
      workType: 'Hybrid',
      employmentType: 'Full-time',
      salaryRange: '$145K/yr - $180K/yr',
      experienceLevel: 'Entry Level',
      yearsExp: '0+ years exp',
      applicantCountText: '32 applicants',
      matchScore: 89,
      matchTier: 'STRONG MATCH',
      companyStage: 'Late Stage Co.',
      h1bSponsorLikely: true,
    },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-slate-900" />
          <h1 className="text-2xl font-black text-slate-900">AI Recommended Target Jobs</h1>
        </div>
        <p className="text-xs font-medium text-slate-500 mt-1">
          High-match job recommendations tailored to your verified technical skills and evidence graph.
        </p>
      </div>

      {/* Recommended Jobs List */}
      <div className="space-y-6">
        {recommendedJobsList.map((job) => {
          const isSaved = savedJobs[job.id]

          return (
            <div
              key={job.id}
              className="group flex flex-col lg:flex-row rounded-3xl border border-slate-200/90 bg-white shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-slate-400"
            >
              {/* Left & Center Main Job Details Panel */}
              <div className="flex-1 p-6 md:p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Top Badges & Options Row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                        {job.timeAgo}
                      </span>
                      {job.alumniCount > 0 && (
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-900 border border-purple-200">
                          {job.alumniCount} school alumni work here
                        </span>
                      )}
                      {job.isEarlyApplicant && (
                        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-900 border border-sky-200">
                          Be an early applicant
                        </span>
                      )}
                    </div>
                    <button className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Logo + Title + Description Header */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-14 w-14 rounded-2xl ${job.logoBg} font-black text-lg flex items-center justify-center shrink-0 border border-slate-200 shadow-md`}
                    >
                      {job.logoText}
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight leading-snug group-hover:text-slate-900 transition-colors">
                        {job.title}
                      </h2>
                      <p className="text-xs font-bold text-slate-700">
                        {job.company} <span className="text-slate-400 font-normal">/ {job.description}</span>
                      </p>
                    </div>
                  </div>

                  {/* Metadata Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4 pt-2 text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{job.employmentType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-900">{job.salaryRange}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{job.workType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{job.experienceLevel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{job.yearsExp}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-xs font-medium text-slate-400">{job.applicantCountText}</span>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      title="Not Interested"
                      className="p-2.5 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                    <button
                      title="Save Job"
                      onClick={() => toggleSaveJob(job.id)}
                      className={`p-2.5 rounded-full border transition-all ${
                        isSaved
                          ? 'border-rose-200 bg-rose-50 text-rose-600'
                          : 'border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>

                    <button className="glass-btn-secondary py-2 px-4 text-xs font-bold">
                      <Sparkles className="h-3.5 w-3.5 text-slate-900" />
                      <span>ASK LAUNCHPROOF</span>
                    </button>

                    <button className="glass-btn-primary py-2 px-5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500">
                      <span>APPLY WITH AUTOFILL</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Dark Match Score Panel */}
              <div className="w-full lg:w-64 bg-[#0a151d] text-white p-6 md:p-8 flex flex-col items-center justify-center space-y-5 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800">
                {/* Circular SVG Radial Match Score Ring */}
                <div className="relative flex items-center justify-center h-24 w-24">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background Ring */}
                    <path
                      className="text-slate-800"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Foreground Score Ring */}
                    <path
                      className="text-emerald-400"
                      strokeDasharray={`${job.matchScore}, 100`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex items-baseline">
                    <span className="text-2xl font-black tracking-tighter text-white">{job.matchScore}</span>
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                    {job.matchTier}
                  </span>
                </div>

                <div className="w-full border-t border-slate-800 pt-4 space-y-2 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>{job.companyStage}</span>
                  </div>
                  {job.h1bSponsorLikely && (
                    <div className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>H1B Sponsor Likely</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
