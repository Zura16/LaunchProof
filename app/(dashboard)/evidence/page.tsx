import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import { ShieldCheck, FileCode } from 'lucide-react'

export default function EvidencePage() {
  const evidences = ALEX_CHEN_SEED.evidences

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900">Skill Evidence Graph</h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          LaunchProof evaluates technical skills through concrete source code artifacts, commits, package dependencies, and résumé proofs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {evidences.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-xl hover:border-slate-400 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 border border-slate-300 text-slate-900">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">{item.skillName}</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-300">
                  {item.category}
                </span>
              </div>
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-bold border shadow-sm ${
                  item.strength === 'STRONG'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : item.strength === 'MODERATE'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : item.strength === 'WEAK'
                    ? 'bg-orange-50 text-orange-800 border-orange-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {item.strength} EVIDENCE
              </span>
            </div>

            <p className="text-xs font-medium text-slate-600 leading-relaxed">{item.description}</p>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs shadow-inner">
              <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <span>Source Artifact</span>
                <span className="text-slate-900">{item.sourceName}</span>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-500">Concrete File Citations:</p>
                {item.citations.map((cite, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono text-[11px] text-slate-900 bg-white p-1.5 rounded border border-slate-300 font-bold shadow-xs">
                    <FileCode className="h-3.5 w-3.5 text-slate-700 shrink-0" />
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
