import { Settings, Shield, Github, Trash2, Key } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-400" />
          <span>Account & Privacy Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your GitHub connection, privacy controls, and data retention.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
        {/* Connected Accounts */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">Connected Accounts</h3>
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-white">GitHub Connected</p>
                <p className="text-[11px] text-slate-400">@alexchen • 3 repositories synced</p>
              </div>
            </div>
            <button className="rounded bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors">
              Disconnect GitHub
            </button>
          </div>
        </div>

        {/* Public Profile Privacy */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <h3 className="text-sm font-bold text-white">Privacy Controls</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-200">Public Proof Profile</p>
              <p className="text-[11px] text-slate-400">Allow recruiters to view your verified evidence graph at launchproof.app/u/alex-chen</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-blue-500" />
          </div>
        </div>

        {/* Data Removal */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <h3 className="text-sm font-bold text-rose-400">Danger Zone</h3>
          <div className="flex items-center justify-between rounded-lg border border-rose-500/20 bg-rose-950/10 p-4">
            <div>
              <p className="text-xs font-bold text-slate-200">Delete Account & Résumé Data</p>
              <p className="text-[11px] text-slate-400">Permanently remove all saved jobs, résumé text, and evidence graph data.</p>
            </div>
            <button className="flex items-center gap-1.5 rounded bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
