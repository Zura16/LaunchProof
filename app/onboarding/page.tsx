'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { loadAppState, saveAppState } from '@/lib/store/app-store'
import { Rocket, Sparkles, Upload, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [university, setUniversity] = useState('')
  const [degree, setDegree] = useState('Bachelor of Science')
  const [major, setMajor] = useState('Computer Science')
  const [academicYear, setAcademicYear] = useState('JUNIOR')
  const [targetRoles, setTargetRoles] = useState<string[]>(['SWE Intern', 'Backend Engineer'])
  const [resumeText, setResumeText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      setResumeText((evt.target?.result as string) || '')
    }
    reader.readAsText(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    setTimeout(() => {
      const slug = fullName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'my-profile'

      const newState = {
        savedJobs: [],
        projectPlan: {
          id: 'plan-custom-1',
          title: 'Upgrade Your Primary Repository',
          targetRepoName: 'MyProject',
          difficulty: 'MEDIUM' as const,
          objective: 'Containerize and optimize your main portfolio project to close evidence gaps.',
          whyItMatters: 'Employers look for concrete backend and containerization proof in top applicants.',
          skillsTargeted: ['Docker', 'REST APIs', 'PostgreSQL', 'Git'],
          definitionOfDone: ['Multi-stage Dockerfile working locally', 'Clean API endpoint structure'],
          expectedEvidence: ['Dockerfile in root repo', 'Passing GitHub Actions CI workflow'],
          milestones: [
            {
              order: 1,
              title: 'Milestone 1: Environment & Containerization',
              description: 'Create multi-stage Dockerfile and test locally.',
              tasks: [{ text: 'Write multi-stage Dockerfile for API', completed: false }],
            },
          ],
        },
        applications: [],
        customSkills: ['React', 'Node.js', 'Python', 'Git'],
        profile: {
          fullName: fullName || 'Your Name',
          university: university || 'Your University',
          degree,
          major,
          academicYear,
          publicSlug: slug,
        },
      }

      saveAppState(newState as any)
      setIsProcessing(false)
      router.push('/dashboard')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12 relative overflow-hidden bg-mobbin-grid">
      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        {/* Header Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-bold text-white shadow-lg shadow-slate-900/20 ring-1 ring-white/30">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">LaunchProof</span>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white shadow-xs">
            Create Your Account
          </span>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-2xl p-8 md:p-10 shadow-2xl space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-900 border border-slate-300/80">
              <Sparkles className="h-3.5 w-3.5 text-slate-900" />
              <span>Personalized Student Setup</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Set Up Your Proof Profile</h1>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Enter your student details to start building your own evidence-based career readiness graph.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Your Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  required
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900">University / College</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. Stanford University"
                    required
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900">Major / Field of Study</label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g. Computer Science"
                    required
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900">Degree Type</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-900 font-bold focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all"
                  >
                    <option value="Bachelor of Science">Bachelor of Science (BS)</option>
                    <option value="Bachelor of Arts">Bachelor of Arts (BA)</option>
                    <option value="Master of Science">Master of Science (MS)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900">Academic Year</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-900 font-bold focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all"
                  >
                    <option value="SOPHOMORE">Sophomore ('28)</option>
                    <option value="JUNIOR">Junior ('27)</option>
                    <option value="SENIOR">Senior ('26)</option>
                    <option value="GRADUATE">Graduate Student</option>
                  </select>
                </div>
              </div>

              {/* Upload Résumé */}
              <div className="space-y-1 pt-2">
                <label className="text-xs font-bold text-slate-900">Upload Your Résumé (Optional)</label>
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 p-4 text-center space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.txt"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="glass-btn-secondary py-2 px-4 text-xs"
                  >
                    <Upload className="h-3.5 w-3.5 text-slate-700" />
                    <span>Upload PDF / TXT Résumé</span>
                  </button>
                  {resumeText && <p className="text-xs text-emerald-700 font-bold">✓ Résumé Loaded</p>}
                </div>
              </div>
            </div>

            <button type="submit" disabled={isProcessing} className="glass-btn-primary w-full py-4 text-sm font-black">
              {isProcessing ? (
                <span>Building Your Profile...</span>
              ) : (
                <>
                  <span>Create My LaunchProof Account</span>
                  <ArrowRight className="h-4 w-4 text-white" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
