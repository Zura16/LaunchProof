'use client'

import { useState, useEffect } from 'react'
import { loadAppState, saveAppState } from '@/lib/store/app-store'
import { StudentProfileData } from '@/lib/services/seed-data.service'
import { UserCheck, ExternalLink, ShieldCheck, Eye, EyeOff, Lock, Share2, Copy, Check, X, Award } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfileData | any>(null)
  const [showPublicBadges, setShowPublicBadges] = useState(true)
  const [showEmailContact, setShowEmailContact] = useState(true)
  const [showLinkedInModal, setShowLinkedInModal] = useState(false)
  const [copiedSharePost, setCopiedSharePost] = useState(false)
  const [copiedSeal, setCopiedSeal] = useState(false)

  useEffect(() => {
    const state = loadAppState()
    setProfile(state.profile)
  }, [])

  const handleToggleBadges = () => {
    setShowPublicBadges(!showPublicBadges)
  }

  const handleToggleEmail = () => {
    setShowEmailContact(!showEmailContact)
  }

  const handleCopyLinkedInPost = () => {
    const postText = `🚀 Excited to share my verified LaunchProof Career Proof Profile!\n\nVerified Technical Skill Proofs:\n- React & TypeScript (Verified Codebase Citations)\n- Node.js & PostgreSQL (Multi-Stage Docker & API Pipelines)\n\nRecruiters & Hiring Managers can view my verified source code proof profile here:\nhttp://localhost:3000/u/${profile?.publicSlug || 'my-profile'}\n\n#SoftwareEngineering #Verification #LaunchProof #CS2027`
    navigator.clipboard.writeText(postText)
    setCopiedSharePost(true)
    setTimeout(() => setCopiedSharePost(false), 2000)
  }

  const handleCopyVerificationSeal = () => {
    const sealCode = `<a href="http://localhost:3000/u/${profile?.publicSlug || 'my-profile'}"><img src="https://img.shields.io/badge/LaunchProof_Verified_Candidate-0f172a?style=for-the-badge&logo=shield" alt="Verified Candidate" /></a>`
    navigator.clipboard.writeText(sealCode)
    setCopiedSeal(true)
    setTimeout(() => setCopiedSeal(false), 2000)
  }

  if (!profile) return null

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-slate-900" />
            <span>Your Student Profile</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Your academic background and job targeting preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLinkedInModal(true)}
            className="glass-btn-secondary py-2.5 px-4 text-xs font-bold"
          >
            <Share2 className="h-4 w-4 text-slate-900" />
            <span>Share to LinkedIn</span>
          </button>

          <Link
            href={`/u/${profile.publicSlug || 'my-profile'}`}
            target="_blank"
            className="glass-btn-primary py-2.5 px-4 text-xs font-bold"
          >
            <span>View Public Proof Profile</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Digital Verification Seals Generator */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-100/80 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-slate-900" />
              <span>Digital Verification Credential Seal</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Embed your official LaunchProof candidate seal on your personal site or portfolio.</p>
          </div>

          <button onClick={handleCopyVerificationSeal} className="glass-btn-primary py-2 px-4 text-xs font-bold">
            {copiedSeal ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>HTML Seal Code Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-white" />
                <span>Copy HTML Seal Snippet</span>
              </>
            )}
          </button>
        </div>

        <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 text-white p-4 border border-slate-700 shadow-md">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-emerald-400">LaunchProof Verified Candidate</p>
            <p className="text-[11px] text-slate-300 font-medium">Verified Source Code Citations • {profile.university}</p>
          </div>
        </div>
      </div>

      {/* LinkedIn Share Modal */}
      {showLinkedInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 max-w-xl w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowLinkedInModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white shadow-xs">
                <Share2 className="h-3.5 w-3.5 text-white" />
                <span>LinkedIn Verified Credential Post</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">Share Your Verified Evidence Profile</h2>
              <p className="text-xs text-slate-500 font-medium">Copy this pre-formatted post text to share your proof profile on LinkedIn.</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs font-mono text-slate-800 space-y-2 leading-relaxed">
              <p className="font-bold text-slate-900">Post Draft:</p>
              <p>🚀 Excited to share my verified LaunchProof Career Proof Profile!</p>
              <p>Verified Technical Skill Proofs:</p>
              <p>- React & TypeScript (Verified Codebase Citations)</p>
              <p>- Node.js & PostgreSQL (Multi-Stage Docker & API Pipelines)</p>
              <p>Recruiters & Hiring Managers can view my verified source code proof profile here:</p>
              <p className="text-slate-900 font-bold underline">http://localhost:3000/u/{profile.publicSlug || 'my-profile'}</p>
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowLinkedInModal(false)}
                className="glass-btn-secondary py-2 px-4 text-xs"
              >
                Close
              </button>
              <button
                onClick={handleCopyLinkedInPost}
                className="glass-btn-primary py-2 px-5 text-xs font-bold"
              >
                {copiedSharePost ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Post Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-white" />
                    <span>Copy Post Text for LinkedIn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-8 space-y-6 shadow-xl">
        {/* Personal info */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 backdrop-blur-md p-4">
            <span className="text-xs font-bold text-slate-500">Full Name</span>
            <p className="text-sm font-black text-slate-900 mt-1">{profile.fullName}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 backdrop-blur-md p-4">
            <span className="text-xs font-bold text-slate-500">University</span>
            <p className="text-sm font-black text-slate-900 mt-1">{profile.university}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 backdrop-blur-md p-4">
            <span className="text-xs font-bold text-slate-500">Degree & Major</span>
            <p className="text-sm font-black text-slate-900 mt-1">{profile.degree} in {profile.major}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 backdrop-blur-md p-4">
            <span className="text-xs font-bold text-slate-500">Academic Status</span>
            <p className="text-sm font-black text-slate-900 mt-1">{profile.academicYear}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 backdrop-blur-md p-4">
            <span className="text-xs font-bold text-slate-500">Work Authorization</span>
            <p className="text-sm font-black text-slate-900 mt-1">{profile.workAuthorization || 'US Authorized'}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 backdrop-blur-md p-4">
            <span className="text-xs font-bold text-slate-500">Sponsorship Required</span>
            <p className="text-sm font-black text-slate-900 mt-1">{profile.sponsorshipRequired ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Privacy & Visibility Settings */}
        <div className="border-t border-slate-200/80 pt-6 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>Public Proof Profile Privacy & Visibility Controls</span>
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/80">
              <div>
                <p className="text-xs font-bold text-slate-900">Show Public Verification Badges</p>
                <p className="text-[11px] text-slate-500">Allow recruiters to view verified skill badges on your public link.</p>
              </div>
              <button
                onClick={handleToggleBadges}
                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                  showPublicBadges ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {showPublicBadges ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/80">
              <div>
                <p className="text-xs font-bold text-slate-900">Show Contact Request Button</p>
                <p className="text-[11px] text-slate-500">Enable "Request Phone Screen" button for technical recruiters.</p>
              </div>
              <button
                onClick={handleToggleEmail}
                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                  showEmailContact ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {showEmailContact ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Targets */}
        <div className="border-t border-slate-200/80 pt-6 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Target Roles & Preferred Locations</h3>
          <div className="flex flex-wrap gap-2">
            {(profile.targetRoleCategories || ['SWE Intern', 'Backend']).map((role: string) => (
              <span key={role} className="rounded-full bg-slate-900/90 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white shadow-xs">
                {role}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {(profile.preferredLocations || ['San Francisco, CA', 'Remote']).map((loc: string) => (
              <span key={loc} className="rounded-full bg-slate-100/80 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-slate-800 border border-slate-300/80">
                📍 {loc}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
