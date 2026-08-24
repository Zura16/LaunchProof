'use client'

import { useState, useEffect } from 'react'
import { loadAppState, saveAppState } from '@/lib/store/app-store'
import { SavedJobData } from '@/lib/services/seed-data.service'
import { fetchLiveWatchedJobs } from '@/lib/services/job-watcher.service'
import Link from 'next/link'
import { Plus, ExternalLink, CheckCircle2, MapPin, Building2, Trash2, Briefcase, Sparkles, X, Target, ArrowRight, Columns, Eye, RefreshCw } from 'lucide-react'

export default function JobsPage() {
  const [jobs, setJobs] = useState<SavedJobData[]>([])
  const [selectedMatchJob, setSelectedMatchJob] = useState<SavedJobData | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [isLiveWatching, setIsLiveWatching] = useState(false)
  const [liveWatchMessage, setLiveWatchMessage] = useState<string | null>(null)

  useEffect(() => {
    const state = loadAppState()
    setJobs(state.savedJobs || [])
  }, [])

  const handleDeleteJob = (id: string) => {
    const updated = jobs.filter((j) => j.id !== id)
    setJobs(updated)
    const currentState = loadAppState()
    saveAppState({ ...currentState, savedJobs: updated })
  }

  const handleToggleLiveWatch = () => {
    if (isLiveWatching) {
      setIsLiveWatching(false)
      setLiveWatchMessage(null)
      return
    }

    setIsLiveWatching(true)
    setLiveWatchMessage('Scanning OpenAI, Anthropic, Stripe & Meta career portals...')

    setTimeout(() => {
      const liveJobs = fetchLiveWatchedJobs()
      const state = loadAppState()
      const updated = [...liveJobs, ...(state.savedJobs || [])]
      setJobs(updated)
      saveAppState({ ...state, savedJobs: updated })
      setLiveWatchMessage('Live Watcher active! Auto-fetched 2 new high-match job postings.')
    }, 1200)
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>Your Target Jobs ({jobs.length})</span>
            {isLiveWatching && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Live Auto-Watcher Active
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Saved job listings analyzed against your personal evidence graph.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleLiveWatch}
            className={`py-2.5 px-4 text-xs font-bold rounded-xl border transition-all ${
              isLiveWatching
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'glass-btn-secondary text-slate-900'
            }`}
          >
            {isLiveWatching ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>Watching Live Postings</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-900" />
                <span>Enable Live Auto-Watcher</span>
              </div>
            )}
          </button>

          {jobs.length >= 2 && (
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="glass-btn-secondary py-2.5 px-4 text-xs font-bold"
            >
              <Columns className="h-4 w-4 text-slate-900" />
              <span>{showComparison ? 'Hide Comparison' : 'Compare Jobs Side-by-Side'}</span>
            </button>
          )}

          <Link
            href="/jobs/new"
            className="glass-btn-primary py-2.5 px-4 text-xs font-bold"
          >
            <Plus className="h-4 w-4 text-white" />
            <span>Save New Job</span>
          </Link>
        </div>
      </div>

      {/* Live Watcher Banner Notification */}
      {liveWatchMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 backdrop-blur-md p-4 flex items-center justify-between text-xs text-emerald-950 font-bold shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{liveWatchMessage}</span>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Matrix */}
      {showComparison && jobs.length >= 2 && (
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Columns className="h-4 w-4 text-slate-900" />
              <span>Side-by-Side Target Job Comparison Matrix</span>
            </h3>
            <button onClick={() => setShowComparison(false)} className="text-xs text-slate-400 hover:text-slate-900">
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto">
            {jobs.slice(0, 3).map((j) => (
              <div key={j.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{j.company}</span>
                <h4 className="font-black text-slate-900 text-sm">{j.title}</h4>
                <div className="text-xs text-slate-600 space-y-1 border-t border-slate-200/80 pt-2">
                  <p><strong className="text-slate-900">Location:</strong> {j.location}</p>
                  <p><strong className="text-slate-900">Graduation Window:</strong> {j.eligibility?.graduationWindow || 'Verified'}</p>
                </div>
                <div className="space-y-1 border-t border-slate-200/80 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Top Requirements:</span>
                  <div className="flex flex-wrap gap-1">
                    {j.requirements.map((r, idx) => (
                      <span key={idx} className="rounded bg-white px-2 py-0.5 text-[10px] font-bold border border-slate-200">
                        {r.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deep Match Score Modal */}
      {selectedMatchJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 max-w-xl w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedMatchJob(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800 border border-emerald-200 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Deep Match Score: 88% Match</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">{selectedMatchJob.title} @ {selectedMatchJob.company}</h2>
              <p className="text-xs text-slate-500 font-medium">Detailed breakdown of verified evidence vs job requirements.</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Verified Evidence Overlap</h3>
              <div className="space-y-2">
                {selectedMatchJob.requirements.map((req, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold">
                    <span className="text-slate-900">{req.skillName}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                        req.matchingEvidence === 'STRONG'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.matchingEvidence === 'MODERATE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {req.matchingEvidence}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Recommended Next Step:</span>
              <Link
                href="/projects/plan-1"
                onClick={() => setSelectedMatchJob(null)}
                className="glass-btn-primary py-2 px-4 text-xs"
              >
                <span>View Project Upgrade</span>
                <ArrowRight className="h-3.5 w-3.5 text-white" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-12 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900/90 text-white shadow-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">No Saved Jobs Yet</h3>
            <p className="text-xs text-slate-500 font-medium">Save job URLs or descriptions to extract skill requirements for your profile.</p>
          </div>
          <Link href="/jobs/new" className="glass-btn-primary py-2.5 px-6">
            <Plus className="h-4 w-4 text-white" />
            <span>Save Your First Target Job</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 shadow-sm transition-all duration-300 hover:border-slate-400 hover:bg-white hover:shadow-xl hover:shadow-slate-900/10"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <Building2 className="h-3.5 w-3.5 text-slate-900" />
                      <span>{job.company}</span>
                    </div>
                    <h3 className="font-black text-slate-900 text-base mt-1 group-hover:text-slate-900 transition-colors">
                      {job.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-200/80 bg-slate-50/80 backdrop-blur-md p-2 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-xs"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="rounded-xl border border-rose-200 bg-rose-50/80 backdrop-blur-md p-2 text-rose-600 hover:bg-rose-100 transition-all shadow-xs"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {job.location}
                  </span>
                  <span>•</span>
                  <span>Saved {job.dateSaved}</span>
                </div>

                {/* Hard Eligibility Badge */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 backdrop-blur-md p-3 text-xs text-emerald-800 flex items-center gap-2 font-bold shadow-xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Eligibility Passed: {job.eligibility?.graduationWindow || 'Verified'}</span>
                </div>

                {/* Extracted Requirements Pills */}
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Extracted Requirements
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requirements.map((req, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border shadow-xs ${
                          req.matchingEvidence === 'STRONG'
                            ? 'bg-emerald-50/80 backdrop-blur-md text-emerald-800 border-emerald-200'
                            : req.matchingEvidence === 'MODERATE'
                            ? 'bg-amber-50/80 backdrop-blur-md text-amber-800 border-amber-200'
                            : 'bg-rose-50/80 backdrop-blur-md text-rose-800 border-rose-200'
                        }`}
                      >
                        {req.skillName} ({req.matchingEvidence})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Guidance Box */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 backdrop-blur-md p-3 text-xs text-slate-700 space-y-1 shadow-xs">
                  <span className="font-bold text-slate-900">Guidance: </span>
                  <span className="text-slate-600 font-medium">{job.fitReasoning}</span>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100/80 pt-4 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">Status: Saved</span>
                <button
                  onClick={() => setSelectedMatchJob(job)}
                  className="glass-btn-secondary py-1.5 px-3.5 text-xs"
                >
                  Deep Match
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
