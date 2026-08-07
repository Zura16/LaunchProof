import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import { ShieldCheck, FileCode, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react'

export default function EvidencePage() {
  const evidences = ALEX_CHEN_SEED.evidences

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">Skill Evidence Graph</h1>
        <p className="text-xs text-slate-400 mt-1">
          LaunchProof evaluates technical skills through concrete source code artifacts, commits, package dependencies, and résumé proofs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {evidences.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                <h3 className="font-bold text-white text-base">{item.skillName}</h3>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                  {item.category}
                </span>
              </div>
              <span
                className={`rounded px-2.5 py-0.5 text-xs font-bold border ${
                  item.strength === 'STRONG'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : item.strength === 'MODERATE'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : item.strength === 'WEAK'
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {item.strength} EVIDENCE
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

            <div className="rounded border border-slate-800/80 bg-slate-950 p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <span>Source Artifact</span>
                <span>{item.sourceName}</span>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-medium text-slate-400">Concrete File Citations:</p>
                {item.citations.map((cite, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono text-[11px] text-blue-300">
                    <FileCode className="h-3 w-3 text-slate-500" />
                    <span>{cite}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
