import { FileText, Sparkles, CheckCircle2, ShieldCheck, Upload } from 'lucide-react'

export default function ResumePage() {
  const bulletRevisions = [
    {
      original: 'Built a full-stack web application.',
      evidenceBacking: 'CampusConnect (React, Express, PostgreSQL, REST APIs)',
      suggested:
        'Built and deployed a React and Node.js application backed by PostgreSQL, implementing role-based authentication and 12 high-throughput REST API endpoints.',
    },
    {
      original: 'Worked on database queries and personal spending app.',
      evidenceBacking: 'ExpenseTracker (SQLite, Express, Node.js)',
      suggested:
        'Developed personal expense tracking app using React and Express with structured relational database schema design.',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <span>Résumé Workspace</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Improve your résumé bullets using strictly verified GitHub and technical project evidence.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors">
          <Upload className="h-3.5 w-3.5" />
          <span>Upload PDF Résumé</span>
        </button>
      </div>

      {/* Active Resume Details */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Alex_Chen_SWE_Resume.pdf</h3>
            <p className="text-xs text-slate-400">Parsed 8 skills, 1 internship, 2 technical projects</p>
          </div>
        </div>
        <span className="rounded bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
          Parsed Successfully
        </span>
      </div>

      {/* Evidence-Backed Bullet Enhancer */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span>Evidence-Backed Bullet Improvements</span>
        </div>

        {bulletRevisions.map((item, index) => (
          <div key={index} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
                Original Résumé Bullet:
              </span>
              <p className="text-xs font-mono text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800/80">
                "{item.original}"
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Verified Evidence Source:
              </span>
              <p className="text-xs text-slate-300 font-medium">{item.evidenceBacking}</p>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Evidence-Backed Suggested Revision:
              </span>
              <p className="text-xs text-emerald-200 bg-emerald-950/20 p-2.5 rounded border border-emerald-500/30 font-medium leading-relaxed">
                "{item.suggested}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
