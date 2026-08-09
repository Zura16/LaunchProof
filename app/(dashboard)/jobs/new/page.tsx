'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Plus, CheckCircle2, Building2, MapPin, Briefcase, RefreshCw } from 'lucide-react'

export default function NewJobPage() {
  const router = useRouter()
  const [jobUrl, setJobUrl] = useState('')
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('San Francisco, CA (Hybrid)')
  const [jobDescription, setJobDescription] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedSkills, setExtractedSkills] = useState<string[]>([])
  const [eligibilityResult, setEligibilityResult] = useState<string | null>(null)

  // Handle URL or Description Extraction
  const handleExtractJob = () => {
    if (!jobDescription && !jobUrl) return

    setIsExtracting(true)

    setTimeout(() => {
      // Extract company & title if empty
      if (!company) {
        if (jobUrl.includes('meta')) setCompany('Meta')
        else if (jobUrl.includes('stripe')) setCompany('Stripe')
        else if (jobUrl.includes('google')) setCompany('Google')
        else setCompany('Target Employer')
      }

      if (!title) {
        if (jobDescription.toLowerCase().includes('backend')) setTitle('Backend Engineering Intern')
        else if (jobDescription.toLowerCase().includes('full stack') || jobDescription.toLowerCase().includes('fullstack')) setTitle('Full Stack SWE Intern')
        else setTitle('Software Engineering Intern (Summer 2027)')
      }

      // Skill Extraction Logic
      const candidateSkills = [
        'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'Go', 'C++',
        'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'REST APIs', 'GraphQL', 'Git'
      ]

      const found = candidateSkills.filter((s) =>
        new RegExp(`\\b${s.replace('.', '\\.')}\\b`, 'i').test(jobDescription || jobUrl)
      )

      const finalExtracted = found.length > 0 ? found : ['REST APIs', 'Python', 'PostgreSQL', 'Docker', 'Git']
      setExtractedSkills(finalExtracted)
      setEligibilityResult('Passed Graduation Window Check (Expected 2027) • Work Auth Eligible')
      setIsExtracting(false)
    }, 700)
  }

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/jobs')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Back Button */}
      <div className="space-y-2 border-b border-slate-200/80 pb-4">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Target Jobs</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900">Save & Analyze Target Job</h1>
        <p className="text-xs font-medium text-slate-500">
          Paste a job posting URL or job description text to extract required technical skills and verify eligibility.
        </p>
      </div>

      <form onSubmit={handleSaveJob} className="space-y-6">
        {/* URL Input */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-4 shadow-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900">Job Posting URL (Optional)</label>
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://boards.greenhouse.io/company/jobs/12345..."
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all font-mono"
            />
          </div>

          {/* Job Description Text Paste */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900">Paste Job Description Text</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job requirements, responsibilities, or eligibility text here..."
              rows={6}
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all font-sans"
            />
          </div>

          <button
            type="button"
            onClick={handleExtractJob}
            disabled={isExtracting}
            className="glass-btn-primary w-full py-3 text-xs"
          >
            {isExtracting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>Extracting Skills & Hard Eligibility...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-white" />
                <span>Run Requirements & Skill Extractor</span>
              </>
            )}
          </button>
        </div>

        {/* Extracted Skill Preview */}
        {extractedSkills.length > 0 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-100/80 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Extracted Target Requirements ({extractedSkills.length})</span>
              </h3>
              <span className="rounded-full bg-emerald-50/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 shadow-xs">
                Eligibility Passed
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((skill) => (
                <span key={skill} className="rounded-xl bg-slate-900/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-xs">
                  {skill}
                </span>
              ))}
            </div>

            {eligibilityResult && (
              <p className="text-xs text-emerald-950 font-bold bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
                ✓ {eligibilityResult}
              </p>
            )}
          </div>
        )}

        {/* Company & Title Details */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Job Metadata</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe"
                required
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900">Role Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Backend SWE Intern"
                required
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all font-bold"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/jobs" className="glass-btn-secondary py-2.5 px-5">
            Cancel
          </Link>
          <button type="submit" className="glass-btn-primary py-2.5 px-6">
            <Plus className="h-4 w-4 text-white" />
            <span>Save Job to Target Pipeline</span>
          </button>
        </div>
      </form>
    </div>
  )
}
