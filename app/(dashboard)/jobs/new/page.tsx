'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadAppState, saveAppState } from '@/lib/store/app-store'
import { calculateResumeJobMatch, JobMatchAnalysis } from '@/lib/services/job-watcher.service'
import { SavedJobData } from '@/lib/services/seed-data.service'
import { Plus, ArrowLeft, Sparkles, Building2, Link as LinkIcon, FileText, CheckCircle2, ShieldCheck, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function NewJobPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [matchResult, setMatchResult] = useState<JobMatchAnalysis | null>(null)

  const handleAnalyzeJob = (e: React.FormEvent) => {
    e.preventDefault()
    if (!company || !title) return

    setIsAnalyzing(true)
    setTimeout(() => {
      // Calculate real resume match score
      const state = loadAppState()
      const reqList = ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs']
      const analysis = calculateResumeJobMatch(state.customSkills?.join(' ') || '', reqList)
      setMatchResult(analysis)

      // Save to savedJobs list
      const newJob: SavedJobData = {
        id: `job-${Date.now()}`,
        company,
        title,
        description: description || 'Target software engineering job posting',
        url: url || 'https://linkedin.com/jobs',
        dateSaved: 'Just Now',
        location: 'San Francisco, CA (Hybrid)',
        requirements: reqList.map((skill) => ({
          skillName: skill,
          type: 'REQUIRED',
          importance: 'HIGH',
          matchingEvidence: analysis.matchedSkills.includes(skill) ? ('STRONG' as const) : ('MISSING' as const),
        })),
        fitReasoning: analysis.fitReasoning,
        fitRecommendation: analysis.matchScore >= 80 ? 'STRONG_CANDIDATE' : 'APPLY_WHILE_IMPROVING',
        eligibility: { graduationWindow: 'Pass', degreeRequired: 'BS CS', workAuthorization: 'Authorized', sponsorship: 'Available', status: 'PASS' },
      }

      const updated = [newJob, ...(state.savedJobs || [])]
      saveAppState({ ...state, savedJobs: updated })

      setIsAnalyzing(false)
    }, 700)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="space-y-2 border-b border-slate-200/80 pb-6">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Target Jobs</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-slate-900" />
          <span>Parse & Watch New Target Job</span>
        </h1>
        <p className="text-xs font-medium text-slate-500">
          Enter a job posting URL or description to extract technical requirements and calculate your instant résumé match score.
        </p>
      </div>

      {/* Analysis Form */}
      <form onSubmit={handleAnalyzeJob} className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-8 space-y-6 shadow-xl">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5 text-slate-700" />
              <span>Job Posting URL (Optional)</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://company.com/careers/software-engineer"
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-900 font-mono placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-700" />
                <span>Company Name</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. OpenAI"
                required
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-900 font-bold focus:bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-slate-700" />
                <span>Role Title</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full Stack Engineer"
                required
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-900 font-bold focus:bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-700" />
              <span>Paste Job Description Text</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste job posting duties, qualifications, and tech stack here..."
              rows={5}
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none font-mono"
            />
          </div>
        </div>

        <button type="submit" disabled={isAnalyzing} className="glass-btn-primary w-full py-3 text-xs font-black">
          {isAnalyzing ? (
            <span>Calculating Instant Résumé Match Score...</span>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-white" />
              <span>Parse Requirements & Score Résumé Match</span>
            </>
          )}
        </button>
      </form>

      {/* Live Match Score Result */}
      {matchResult && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/90 backdrop-blur-xl p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <h3 className="text-lg font-black text-emerald-950">Calculated Match Score: {matchResult.matchScore}% Match</h3>
            </div>
            <button onClick={() => router.push('/jobs')} className="glass-btn-primary py-2 px-4 text-xs font-bold bg-emerald-700">
              View in Target Jobs
            </button>
          </div>

          <p className="text-xs font-bold text-emerald-900">{matchResult.fitReasoning}</p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-2">
            <div className="rounded-xl bg-white/90 p-4 border border-emerald-200 space-y-1">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">Matched Skills ({matchResult.matchedSkills.length})</span>
              <p className="text-xs font-bold text-slate-900">{matchResult.matchedSkills.join(', ')}</p>
            </div>
            <div className="rounded-xl bg-white/90 p-4 border border-rose-200 space-y-1">
              <span className="text-xs font-black text-rose-800 uppercase tracking-wider">Missing Evidence Gaps ({matchResult.missingSkills.length})</span>
              <p className="text-xs font-bold text-slate-900">{matchResult.missingSkills.join(', ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
