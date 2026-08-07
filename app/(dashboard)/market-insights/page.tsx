import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import { BarChart3, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'

export default function MarketInsightsPage() {
  const insights = ALEX_CHEN_SEED.marketInsights

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">Target Market Analysis</h1>
        <p className="text-xs text-slate-400 mt-1">
          Aggregated demand patterns across 12 saved software engineering internship postings.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <span className="text-xs text-slate-400">Total Saved Jobs</span>
            <p className="text-2xl font-bold text-white mt-1">12</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <span className="text-xs text-slate-400">Top Market Skill</span>
            <p className="text-2xl font-bold text-blue-400 mt-1">REST APIs (75%)</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <span className="text-xs text-slate-400">Top Evidence Gap</span>
            <p className="text-2xl font-bold text-rose-400 mt-1">Testing (58%)</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <span className="text-xs text-slate-400">Strongest Evidence</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">React & REST</p>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Skill Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Job Frequency</th>
                <th className="px-4 py-3">Market Demand %</th>
                <th className="px-4 py-3">Req vs Pref</th>
                <th className="px-4 py-3">Your Evidence Status</th>
                <th className="px-4 py-3">Priority Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {insights.map((item) => (
                <tr key={item.skillName} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{item.skillName}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{item.category}</td>
                  <td className="px-4 py-3">{item.frequencyCount} / {item.totalJobs} jobs</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{item.frequencyPercent}%</span>
                      <div className="h-1.5 w-16 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${item.frequencyPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {item.requiredCount} req • {item.preferredCount} pref
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold border ${
                        item.studentEvidence === 'STRONG'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : item.studentEvidence === 'MODERATE'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {item.studentEvidence}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.priority === 'CRITICAL_GAP' && (
                      <span className="text-rose-400 font-semibold">Priority Gap #1</span>
                    )}
                    {item.priority === 'HIGH_GAP' && (
                      <span className="text-amber-400 font-semibold">Priority Gap #2</span>
                    )}
                    {item.priority === 'STRENGTH' && (
                      <span className="text-emerald-400">Verified Strength</span>
                    )}
                    {item.priority === 'SECONDARY' && (
                      <span className="text-slate-400">Secondary</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
