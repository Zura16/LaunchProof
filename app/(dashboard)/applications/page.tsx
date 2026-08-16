'use client'

import { useState, useEffect } from 'react'
import { loadAppState, saveAppState } from '@/lib/store/app-store'
import { ApplicationTrackerData } from '@/lib/services/seed-data.service'
import { Send, Plus, Trash2, CheckCircle2, FileText, Building2, Calendar } from 'lucide-react'

export default function ApplicationsPage() {
  const [apps, setApps] = useState<ApplicationTrackerData[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<ApplicationTrackerData['status']>('PREPARING')
  const [resumeVersion, setResumeVersion] = useState('v1_Backend_Focus.pdf')
  const [notes, setNotes] = useState('')
  const [copiedIcs, setCopiedIcs] = useState(false)

  useEffect(() => {
    const state = loadAppState()
    setApps(state.applications || [])
  }, [])

  const handleExportIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LaunchProof//Career Deadlines//EN
${apps
  .map(
    (a, i) => `BEGIN:VEVENT
SUMMARY:Interview / Follow-up: ${a.company} (${a.title})
DESCRIPTION:Pipeline Status: ${a.status}. Resume: ${a.resumeVersion}
DTSTART;VALUE=DATE:20260820
DTEND;VALUE=DATE:20260821
END:VEVENT`
  )
  .join('\n')}
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'LaunchProof_Interview_Deadlines.ics'
    link.click()
    URL.revokeObjectURL(url)
    setCopiedIcs(true)
    setTimeout(() => setCopiedIcs(false), 2000)
  }

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault()
    if (!company || !title) return

    const newApp: ApplicationTrackerData = {
      id: `app-${Date.now()}`,
      company,
      title,
      status,
      appliedDate: status === 'APPLIED' ? 'Today' : undefined,
      resumeVersion,
      notes,
    }

    const updated = [newApp, ...apps]
    setApps(updated)

    const state = loadAppState()
    saveAppState({ ...state, applications: updated })

    setCompany('')
    setTitle('')
    setNotes('')
    setShowAddForm(false)
  }

  const handleStatusChange = (id: string, newStatus: ApplicationTrackerData['status']) => {
    const updated = apps.map((app) => {
      if (app.id === id) {
        return {
          ...app,
          status: newStatus,
          appliedDate: newStatus === 'APPLIED' && !app.appliedDate ? 'Today' : app.appliedDate,
        }
      }
      return app
    })
    setApps(updated)
    const state = loadAppState()
    saveAppState({ ...state, applications: updated })
  }

  const handleDeleteApp = (id: string) => {
    const updated = apps.filter((a) => a.id !== id)
    setApps(updated)
    const state = loadAppState()
    saveAppState({ ...state, applications: updated })
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Send className="h-6 w-6 text-slate-900" />
            <span>Application Tracker ({apps.length})</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Track target job applications, update pipeline statuses, and attach custom résumé versions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleExportIcs} className="glass-btn-secondary py-2.5 px-4 text-xs font-bold">
            <Calendar className="h-4 w-4 text-slate-900" />
            <span>{copiedIcs ? 'Calendar iCal (.ics) Exported!' : 'Export Calendar Deadlines (.ics)'}</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="glass-btn-primary py-2.5 px-4 text-xs font-bold"
          >
            <Plus className="h-4 w-4 text-white" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Add New Application Form Modal / Card */}
      {showAddForm && (
        <form onSubmit={handleAddApplication} className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-black text-slate-900">Add Target Job Application</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe"
                required
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-slate-900 focus:outline-none"
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
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900">Pipeline Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-slate-900 focus:outline-none"
              >
                <option value="PREPARING">Preparing Application</option>
                <option value="APPLIED">Applied</option>
                <option value="RECRUITER_SCREEN">Recruiter Screen</option>
                <option value="TECHNICAL_INTERVIEW">Technical Interview</option>
                <option value="OFFER">Offer</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900">Notes / Referral Details</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Referred by engineer on LinkedIn..."
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="glass-btn-secondary py-2 px-4 text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="glass-btn-primary py-2 px-5 text-xs">
              Save Application
            </button>
          </div>
        </form>
      )}

      {/* Applications Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 shadow-xl overflow-hidden">
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 backdrop-blur-md text-slate-500 font-bold uppercase border-b border-slate-200/80 text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied Date</th>
                <th className="px-4 py-3">Résumé Version</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 bg-white font-medium">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-black text-slate-900">{app.company}</td>
                  <td className="px-4 py-3 text-slate-700 font-semibold">{app.title}</td>
                  <td className="px-4 py-3">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                      className="rounded-lg border border-slate-200/80 bg-slate-50 p-1 text-[11px] font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="PREPARING">Preparing</option>
                      <option value="APPLIED">Applied</option>
                      <option value="RECRUITER_SCREEN">Interview Screen</option>
                      <option value="OFFER">Offer</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{app.appliedDate || 'Not yet'}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{app.resumeVersion}</td>
                  <td className="px-4 py-3 text-slate-500 truncate max-w-xs">{app.notes || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteApp(app.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
