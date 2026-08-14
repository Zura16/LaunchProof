'use client'

import { useState, useEffect } from 'react'
import { loadAppState, saveAppState } from '@/lib/store/app-store'
import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import { Settings, Database, Download, RefreshCw, HardDrive, ShieldCheck, Check } from 'lucide-react'

export default function SettingsPage() {
  const [storageBytes, setStorageBytes] = useState(0)
  const [copiedBackup, setCopiedBackup] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const state = loadAppState()
    setProfile(state.profile)
    const jsonStr = JSON.stringify(state)
    setStorageBytes(new Blob([jsonStr]).size)
  }, [])

  const handleExportBackup = () => {
    const state = loadAppState()
    const jsonStr = JSON.stringify(state, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `LaunchProof_State_Backup_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setCopiedBackup(true)
    setTimeout(() => setCopiedBackup(false), 2000)
  }

  const handleResetState = () => {
    if (confirm('Are you sure you want to reset account data back to default demo state?')) {
      const demoState = {
        savedJobs: ALEX_CHEN_SEED.savedJobs,
        projectPlan: ALEX_CHEN_SEED.projectPlan,
        applications: ALEX_CHEN_SEED.applications,
        customSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Express', 'REST APIs', 'Git'],
        profile: ALEX_CHEN_SEED.profile,
      }
      saveAppState(demoState as any)
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-slate-900" />
          <span>System Settings & Storage Analytics</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Inspect client-side storage persistence, export account backups, and manage system preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Storage Usage Console */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-4 shadow-md">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
            <HardDrive className="h-4 w-4 text-slate-900" />
            <span>Local Storage Memory Usage</span>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 space-y-2 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Persistent State Size:</span>
              <span className="text-slate-900 font-mono">{(storageBytes / 1024).toFixed(2)} KB</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Active Profile:</span>
              <span className="text-slate-900">{profile?.fullName || 'Personal Account'}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Storage Backend:</span>
              <span className="text-emerald-700">localStorage / IndexedDB Engine</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button onClick={handleExportBackup} className="glass-btn-primary py-2 px-4 text-xs">
              {copiedBackup ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Backup Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 text-white" />
                  <span>Export JSON Backup</span>
                </>
              )}
            </button>

            <button onClick={handleResetState} className="glass-btn-secondary py-2 px-4 text-xs">
              <RefreshCw className="h-3.5 w-3.5 text-slate-700" />
              <span>Reset to Demo State</span>
            </button>
          </div>
        </div>

        {/* Engine Security & Verification */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-4 shadow-md">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
            <ShieldCheck className="h-4 w-4 text-slate-900" />
            <span>System Verification & Status</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
              <span>Evidence Classifier Status:</span>
              <span>ONLINE (100% Client Sync)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 font-bold">
              <span>PDF & TXT Parser:</span>
              <span>Intelligent Stream Reader Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 font-bold">
              <span>Next.js Production Build:</span>
              <span>v14.2.35 (Pre-compiled)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
