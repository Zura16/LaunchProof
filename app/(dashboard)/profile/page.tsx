import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import { UserCheck, GraduationCap, MapPin, Briefcase, ExternalLink, Shield } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const profile = ALEX_CHEN_SEED.profile

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-400" />
            <span>Student Profile</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Your academic background and job targeting preferences.
          </p>
        </div>
        <Link
          href={`/u/${profile.publicSlug}`}
          target="_blank"
          className="flex items-center gap-2 rounded-md bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          <span>View Public Proof Profile</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
        {/* Personal info */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <span className="text-xs text-slate-400">Full Name</span>
            <p className="text-sm font-bold text-white mt-1">{profile.fullName}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">University</span>
            <p className="text-sm font-bold text-white mt-1">{profile.university}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Degree & Major</span>
            <p className="text-sm font-bold text-white mt-1">{profile.degree} in {profile.major}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Expected Graduation</span>
            <p className="text-sm font-bold text-white mt-1">May 2027 ({profile.academicYear})</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Work Authorization</span>
            <p className="text-sm font-bold text-white mt-1">{profile.workAuthorization}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Sponsorship Required</span>
            <p className="text-sm font-bold text-white mt-1">{profile.sponsorshipRequired ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Targets */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Roles & Preferred Locations</h3>
          <div className="flex flex-wrap gap-2">
            {profile.targetRoleCategories.map((role) => (
              <span key={role} className="rounded bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
                {role}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {profile.preferredLocations.map((loc) => (
              <span key={loc} className="rounded bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                📍 {loc}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
