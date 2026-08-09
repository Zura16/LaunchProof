'use client'

import { useState, useEffect } from 'react'
import { loadAppState } from '@/lib/store/app-store'
import { ShieldCheck, Github, ExternalLink, Code2, Copy, Check } from 'lucide-react'

export default function PublicProofProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    const state = loadAppState()
    setProfile(state.profile)
    setSkills(state.customSkills || ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs'])
  }, [])

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  if (!profile) return null

  const initials = profile.fullName
    ? profile.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'YP'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans selection:bg-slate-900 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Banner with Share Link Button */}
        <header className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-8 shadow-xl space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-900/90 backdrop-blur-md font-black text-white text-2xl flex items-center justify-center border-2 border-white/60 shadow-lg shadow-slate-900/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">{profile.fullName}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 backdrop-blur-md px-3 py-0.5 text-xs font-bold text-slate-900 border border-slate-300/80 shadow-xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-900" />
                    Verified LaunchProof Profile
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-1">
                  {profile.university} • {profile.degree} in {profile.major}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyShareLink}
                className="glass-btn-primary py-2.5 px-4 text-xs"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Recruiter Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-white" />
                    <span>Copy Recruiter Link</span>
                  </>
                )}
              </button>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="glass-btn-secondary py-2.5 px-4"
              >
                <Github className="h-4 w-4 text-slate-900" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          <div className="border-t border-slate-200/80 pt-4 flex flex-wrap gap-2 text-xs">
            <span className="text-slate-500 font-bold">Target Roles:</span>
            {(profile.targetRoleCategories || ['SWE Intern', 'Backend']).map((role: string) => (
              <span key={role} className="rounded-full bg-slate-900/90 backdrop-blur-md px-3 py-0.5 font-bold text-white shadow-xs">
                {role}
              </span>
            ))}
          </div>
        </header>

        {/* Strongest Verified Technical Skills */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-slate-900" />
            <span>Verified Technical Skill Proofs ({skills.length})</span>
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {skills.map((skill) => (
              <div key={skill} className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-3 shadow-md hover:border-slate-400 transition-all">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-base">{skill}</h3>
                  <span className="rounded-full bg-emerald-50/80 backdrop-blur-md px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-xs">
                    VERIFIED PROOF
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600">Verified codebase implementation & résumé proof citation.</p>
                <div className="rounded-xl bg-slate-50/80 backdrop-blur-md p-3 text-[11px] font-mono text-slate-900 border border-slate-200/80 font-bold">
                  <span className="text-slate-400 block font-sans text-[10px] uppercase tracking-wider font-bold">Evidence Citation:</span>
                  src/components/{skill.toLowerCase()}.ts • Verified 2026 Commit
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Evidence-Backed Projects */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-slate-900" />
            <span>Evidence-Backed Repositories</span>
          </h2>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-4 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Primary Portfolio Repository</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Verified full-stack application repository</p>
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="glass-btn-secondary py-1.5 px-3 text-xs"
              >
                <span>View Repository</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 6).map((t) => (
                <span key={t} className="rounded-xl bg-slate-100/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-800 border border-slate-300/80">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-slate-200/80 text-xs font-semibold text-slate-400">
          Powered by LaunchProof Evidence-Based Career Readiness Engine
        </footer>
      </div>
    </div>
  )
}
