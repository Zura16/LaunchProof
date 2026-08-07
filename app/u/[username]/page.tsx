import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import { ShieldCheck, Github, ExternalLink, Rocket, CheckCircle2, Code2, Database, Layers } from 'lucide-react'
import Link from 'next/link'

export default function PublicProofProfilePage({ params }: { params: { username: string } }) {
  const seed = ALEX_CHEN_SEED

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Header Banner */}
        <header className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950/40 p-8 shadow-2xl space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-blue-600 font-bold text-white text-2xl flex items-center justify-center border-2 border-blue-400 shadow-xl shadow-blue-500/20">
                AC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white">{seed.profile.fullName}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3" />
                    Verified LaunchProof Profile
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {seed.profile.university} • {seed.profile.degree} in {seed.profile.major} ('27)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://github.com/alexchen"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>@alexchen</span>
              </a>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400">Target Roles:</span>
            {seed.profile.targetRoleCategories.map((role) => (
              <span key={role} className="rounded bg-blue-500/10 px-2.5 py-0.5 font-semibold text-blue-400 border border-blue-500/20">
                {role}
              </span>
            ))}
          </div>
        </header>

        {/* Strongest Verified Technical Skills */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span>Verified Technical Skill Proofs</span>
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {seed.evidences
              .filter((e) => e.strength === 'STRONG' || e.strength === 'MODERATE')
              .map((ev) => (
                <div key={ev.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">{ev.skillName}</h3>
                    <span className="rounded bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                      {ev.strength} PROOF
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{ev.description}</p>
                  <div className="rounded bg-slate-950 p-2.5 text-[11px] font-mono text-blue-300 border border-slate-800">
                    <span className="text-slate-500 block font-sans text-[10px] uppercase tracking-wider font-semibold">Evidence Citation:</span>
                    {ev.citations.join(' • ')}
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Evidence-Backed Projects */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Code2 className="h-5 w-5 text-blue-400" />
            <span>Evidence-Backed Repositories</span>
          </h2>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">CampusConnect</h3>
                <p className="text-xs text-slate-400 mt-0.5">Campus student event and discussion platform</p>
              </div>
              <a
                href="https://github.com/alexchen/CampusConnect"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <span>View Repository</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['React', 'TypeScript', 'Express', 'Node.js', 'REST APIs', 'PostgreSQL'].map((t) => (
                <span key={t} className="rounded bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-slate-800 text-xs text-slate-500">
          Powered by LaunchProof Evidence-Based Career Readiness Engine
        </footer>
      </div>
    </div>
  )
}
