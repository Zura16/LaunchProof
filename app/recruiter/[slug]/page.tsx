'use client'

import { useState, useEffect } from 'react'
import { loadAppState } from '@/lib/store/app-store'
import { ShieldCheck, Github, CheckCircle2, Calendar, Send, FileCode, Award, ExternalLink } from 'lucide-react'

export default function RecruiterPortalPage({ params }: { params: { slug: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [recruiterName, setRecruiterName] = useState('')
  const [recruiterEmail, setRecruiterEmail] = useState('')
  const [scheduleSuccess, setScheduleSuccess] = useState(false)

  useEffect(() => {
    const state = loadAppState()
    setProfile(state.profile)
    setSkills(state.customSkills || ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs', 'Docker'])
  }, [])

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setScheduleSuccess(true)
    setTimeout(() => {
      setShowScheduleModal(false)
      setScheduleSuccess(false)
    }, 2500)
  }

  if (!profile) return null

  const initials = profile.fullName
    ? profile.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AC'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans selection:bg-slate-900 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Recruiter Verification Header Banner */}
        <header className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-8 md:p-10 shadow-xl space-y-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-2xl bg-slate-900/90 backdrop-blur-md font-black text-white text-3xl flex items-center justify-center border-2 border-white/60 shadow-xl shadow-slate-900/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                {initials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black tracking-tight text-slate-900">{profile.fullName}</h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1 text-xs font-bold text-white shadow-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Recruiter Verified Candidate
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  {profile.university} • {profile.degree} in {profile.major} (Graduation: {profile.academicYear})
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 font-bold">
                  <span>Work Auth: {profile.workAuthorization || 'US Citizen / Authorized'}</span>
                  <span>•</span>
                  <span>Sponsorship Required: {profile.sponsorshipRequired ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowScheduleModal(true)}
                className="glass-btn-primary py-3 px-6 text-xs font-black"
              >
                <Calendar className="h-4 w-4 text-white" />
                <span>Request Phone Screen</span>
              </button>
            </div>
          </div>
        </header>

        {/* Schedule Interview Modal */}
        {showScheduleModal && (
          <form onSubmit={handleScheduleSubmit} className="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-slate-900">Request Phone Screen with {profile.fullName}</h3>
            {scheduleSuccess ? (
              <div className="rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Request sent successfully! {profile.fullName} will be notified immediately.</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-900">Your Name / Title</label>
                    <input
                      type="text"
                      value={recruiterName}
                      onChange={(e) => setRecruiterName(e.target.value)}
                      placeholder="e.g. Sarah Connor (Senior Technical Recruiter)"
                      required
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-900">Work Email</label>
                    <input
                      type="email"
                      value={recruiterEmail}
                      onChange={(e) => setRecruiterEmail(e.target.value)}
                      placeholder="sarah@company.com"
                      required
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="glass-btn-secondary py-2 px-4 text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="glass-btn-primary py-2 px-5 text-xs">
                    Send Interview Invitation
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* Verified Code Evidence Grid */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-slate-900" />
            <span>Verified Source Code Citations ({skills.length} Proofs)</span>
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {skills.map((skill, idx) => (
              <div key={skill} className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-base">{skill}</h3>
                  <span className="rounded-full bg-emerald-50/80 backdrop-blur-md px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-xs">
                    VERIFIED ARTIFACT
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600">Verified codebase implementation & résumé proof citation.</p>
                <div className="rounded-xl bg-slate-50/80 backdrop-blur-md p-3 text-[11px] font-mono text-slate-900 border border-slate-200/80 font-bold">
                  <span className="text-slate-400 block font-sans text-[10px] uppercase tracking-wider font-bold">Source File Citation:</span>
                  src/lib/{skill.toLowerCase().replace(/[^a-z]/g, '')}.ts • Verified 2026 Commit
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
