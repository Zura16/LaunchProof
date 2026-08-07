import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import Link from 'next/link'
import { Plus, ExternalLink, CheckCircle2, MapPin, Building2 } from 'lucide-react'

export default function JobsPage() {
  const jobs = ALEX_CHEN_SEED.savedJobs

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Target Jobs ({jobs.length})</h1>
          <p className="text-xs text-slate-400 mt-1">
            Saved job listings extracted via LaunchProof Chrome Extension or direct URL paste.
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>Save New Job</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0d1320]/80 p-6 transition-all duration-300 hover:border-blue-500/40 hover:bg-[#101828] hover:shadow-2xl hover:shadow-blue-500/5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                    <Building2 className="h-3.5 w-3.5 text-blue-400" />
                    <span>{job.company}</span>
                  </div>
                  <h3 className="font-extrabold text-white text-base mt-1 group-hover:text-blue-300 transition-colors">
                    {job.title}
                  </h3>
                </div>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 hover:text-white hover:border-white/20 transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="h-3 w-3 text-slate-500" />
                  {job.location}
                </span>
                <span>•</span>
                <span>Saved {job.dateSaved}</span>
              </div>

              {/* Hard Eligibility Badge */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Eligibility Passed: {job.eligibility.graduationWindow}</span>
              </div>

              {/* Extracted Requirements Pills */}
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Extracted Requirements
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {job.requirements.map((req, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                        req.matchingEvidence === 'STRONG'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : req.matchingEvidence === 'MODERATE'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {req.skillName} ({req.matchingEvidence})
                    </span>
                  ))}
                </div>
              </div>

              {/* Guidance Box */}
              <div className="rounded-xl border border-white/[0.06] bg-[#080b11] p-3 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-blue-400">Guidance: </span>
                <span className="text-slate-300">{job.fitReasoning}</span>
              </div>
            </div>

            <div className="mt-5 border-t border-white/[0.08] pt-4 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Status: Saved</span>
              <button className="rounded-xl bg-blue-500/10 px-3.5 py-1.5 text-xs font-bold text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 transition-all">
                Deep Match
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
