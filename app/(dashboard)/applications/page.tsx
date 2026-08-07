import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import { Send, Clock, CheckCircle2, FileText, UserCheck } from 'lucide-react'

export default function ApplicationsPage() {
  const apps = ALEX_CHEN_SEED.applications

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PREPARING':
        return <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">Preparing</span>
      case 'APPLIED':
        return <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">Applied</span>
      case 'RECRUITER_SCREEN':
        return <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">Recruiter Screen</span>
      default:
        return <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400">Saved</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Send className="h-5 w-5 text-blue-400" />
          <span>Application Tracker ({apps.length})</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Track target applications, resume versions submitted, and referral contacts.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied Date</th>
                <th className="px-4 py-3">Resume Version Used</th>
                <th className="px-4 py-3">Referral / Contact</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{app.company}</td>
                  <td className="px-4 py-3 text-slate-300">{app.title}</td>
                  <td className="px-4 py-3">{getStatusBadge(app.status)}</td>
                  <td className="px-4 py-3 text-slate-400">{app.appliedDate || 'Not yet'}</td>
                  <td className="px-4 py-3 font-mono text-blue-300">{app.resumeVersion}</td>
                  <td className="px-4 py-3 text-slate-400">{app.referralContact || '—'}</td>
                  <td className="px-4 py-3 text-slate-400 truncate max-w-xs">{app.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
