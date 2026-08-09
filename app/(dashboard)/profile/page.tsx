'use client'

import { useState, useEffect } from 'react'
import { loadAppState } from '@/lib/store/app-store'
import { StudentProfileData } from '@/lib/services/seed-data.service'
import { UserCheck, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfileData | any>(null)

  useEffect(() => {
    const state = loadAppState()
    setProfile(state.profile)
  }, [])

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
        <Link
          href={`/u/${profile.publicSlug || 'my-profile'}`}
          target="_blank"
          className="glass-btn-primary py-2.5 px-4"
        >
          <span>View Public Proof Profile</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

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
