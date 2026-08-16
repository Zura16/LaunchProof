'use client'

import { useState, useEffect } from 'react'
import { loadAppState } from '@/lib/store/app-store'
import { Filter, BarChart3, ShieldCheck, DollarSign, Calculator, Grid, Building2 } from 'lucide-react'

export default function MarketInsightsPage() {
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [savedJobsCount, setSavedJobsCount] = useState(12)
  const [userSkills, setUserSkills] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState('San Francisco, CA')

  useEffect(() => {
    const state = loadAppState()
    setSavedJobsCount(state.savedJobs?.length || 12)
    setUserSkills(state.customSkills || ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs'])
  }, [])

  const categories = ['ALL', 'CRITICAL GAPS', 'VERIFIED STRENGTHS', 'LANGUAGES', 'FRAMEWORKS', 'DATABASES', 'CLOUD']

  const targetCompanies = ['Stripe', 'Meta', 'Amazon', 'Apple', 'Netflix']
  const heatmapSkills = ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Redis', 'System Design']

  // Company matrix data
  const companySkillMatrix: Record<string, Record<string, boolean>> = {
    Stripe: { TypeScript: true, React: true, 'Node.js': true, PostgreSQL: true, Docker: true, Redis: true, 'System Design': true },
    Meta: { TypeScript: true, React: true, 'Node.js': false, PostgreSQL: false, Docker: true, Redis: true, 'System Design': true },
    Amazon: { TypeScript: false, React: true, 'Node.js': true, PostgreSQL: true, Docker: true, Redis: true, 'System Design': true },
    Apple: { TypeScript: true, React: true, 'Node.js': true, PostgreSQL: true, Docker: false, Redis: false, 'System Design': true },
    Netflix: { TypeScript: true, React: true, 'Node.js': true, PostgreSQL: true, Docker: true, Redis: true, 'System Design': true },
  }

  const allMarketSkills = [
    { skillName: 'REST APIs', category: 'FRAMEWORKS', freq: 75, status: 'STRONG', priority: 'STRENGTH' },
    { skillName: 'TypeScript', category: 'LANGUAGES', freq: 67, status: 'STRONG', priority: 'STRENGTH' },
    { skillName: 'React', category: 'FRAMEWORKS', freq: 67, status: 'STRONG', priority: 'STRENGTH' },
    { skillName: 'Node.js', category: 'FRAMEWORKS', freq: 58, status: 'STRONG', priority: 'STRENGTH' },
    { skillName: 'PostgreSQL', category: 'DATABASES', freq: 50, status: 'STRONG', priority: 'STRENGTH' },
    { skillName: 'Docker', category: 'CLOUD', freq: 50, status: userSkills.includes('Docker') ? 'STRONG' : 'MISSING', priority: 'CRITICAL GAPS' },
    { skillName: 'Redis', category: 'DATABASES', freq: 42, status: userSkills.includes('Redis') ? 'STRONG' : 'MISSING', priority: 'CRITICAL GAPS' },
    { skillName: 'CI/CD', category: 'CLOUD', freq: 33, status: userSkills.includes('CI/CD') ? 'STRONG' : 'MISSING', priority: 'CRITICAL GAPS' },
    { skillName: 'Python', category: 'LANGUAGES', freq: 33, status: userSkills.includes('Python') ? 'STRONG' : 'MODERATE', priority: 'VERIFIED STRENGTHS' },
  ]

  const filteredSkills = allMarketSkills.filter((item) => {
    if (activeCategory === 'ALL') return true
    if (activeCategory === 'CRITICAL GAPS') return item.status === 'MISSING'
    if (activeCategory === 'VERIFIED STRENGTHS') return item.status === 'STRONG'
    return item.category === activeCategory
  })

  // Salary calculations based on location
  const salaryMultiplier = selectedLocation.includes('San Francisco') ? 1.25 : selectedLocation.includes('New York') ? 1.2 : 1.0
  const baseSalaryEst = Math.round(115000 * salaryMultiplier)
  const equityEst = Math.round(25000 * salaryMultiplier)

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-slate-900" />
          <span>Target Market Analysis ({savedJobsCount} Saved Jobs)</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Aggregated demand patterns across your target software engineering postings vs your evidence graph.
        </p>
      </div>

      {/* Target Company Skill Matrix Heatmap */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-4 shadow-md overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100/80 pb-3">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
            <Grid className="h-4 w-4 text-slate-900" />
            <span>Target Company Skill Matrix Heatmap</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Green = Verified Candidate Proof • Red = Market Skill Gap
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Company</th>
                {heatmapSkills.map((s) => (
                  <th key={s} className="py-2.5 px-3 text-center">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {targetCompanies.map((company) => (
                <tr key={company} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-black text-slate-900 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-700" />
                    <span>{company}</span>
                  </td>
                  {heatmapSkills.map((skill) => {
                    const isRequired = companySkillMatrix[company]?.[skill]
                    const hasProof = userSkills.includes(skill)

                    if (!isRequired) {
                      return <td key={skill} className="py-3 px-3 text-center text-slate-300 font-mono text-[10px]">N/A</td>
                    }

                    return (
                      <td key={skill} className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black ${
                            hasProof
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}
                        >
                          {hasProof ? 'VERIFIED' : 'GAP'}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Market Compensation Estimator */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-4 shadow-md">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-100/80 pb-3">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
            <Calculator className="h-4 w-4 text-slate-900" />
            <span>Target Market Compensation Estimator</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Location:</span>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="rounded-xl border border-slate-200/80 bg-slate-50 p-1.5 text-xs font-bold text-slate-900 focus:outline-none"
            >
              <option value="San Francisco, CA">San Francisco, CA (Tier 1)</option>
              <option value="New York, NY">New York, NY (Tier 1)</option>
              <option value="Remote (US)">Remote (US Tier 2)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500">Estimated Base Salary</span>
            <p className="text-2xl font-black text-slate-900 mt-1">${baseSalaryEst.toLocaleString()} / yr</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800">Estimated Annual Equity/RSU</span>
            <p className="text-2xl font-black text-emerald-950 mt-1">${equityEst.toLocaleString()} / yr</p>
          </div>
          <div className="rounded-xl bg-slate-100 p-4 border border-slate-300">
            <span className="text-xs font-bold text-slate-700">Total Compensation Range</span>
            <p className="text-2xl font-black text-slate-900 mt-1">${(baseSalaryEst + equityEst).toLocaleString()} / yr</p>
          </div>
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80">
        <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Filter Category:</span>
        <div className="flex items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? 'mobbin-pill-active' : 'mobbin-pill'}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-xs">
            <span className="text-xs font-bold text-slate-500">Total Saved Jobs</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{savedJobsCount}</p>
          </div>
          <div className="rounded-xl border border-slate-300/80 bg-slate-100/80 p-4 shadow-xs">
            <span className="text-xs font-bold text-slate-500">Top Market Skill</span>
            <p className="text-2xl font-black text-slate-900 mt-1">REST APIs (75%)</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 shadow-xs">
            <span className="text-xs font-bold text-slate-500">Top Evidence Gap</span>
            <p className="text-2xl font-black text-rose-700 mt-1">Docker & CI/CD</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-xs">
            <span className="text-xs font-bold text-slate-500">Strongest Evidence</span>
            <p className="text-2xl font-black text-emerald-800 mt-1">React & TypeScript</p>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 backdrop-blur-md text-slate-500 font-bold uppercase border-b border-slate-200/80 text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Skill Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Market Demand %</th>
                <th className="px-4 py-3">Evidence Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 bg-white font-medium">
              {filteredSkills.map((item) => (
                <tr key={item.skillName} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-black text-slate-900">{item.skillName}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{item.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">{item.freq}%</span>
                      <div className="h-2 w-20 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-slate-900 rounded-full"
                          style={{ width: `${item.freq}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border shadow-xs ${
                        item.status === 'STRONG'
                          ? 'bg-emerald-50/80 backdrop-blur-md text-emerald-800 border-emerald-200'
                          : 'bg-rose-50/80 backdrop-blur-md text-rose-800 border-rose-200'
                      }`}
                    >
                      {item.status}
                    </span>
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
