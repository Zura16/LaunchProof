import { Settings, Github, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-slate-900" />
          <span>Account & Privacy Settings</span>
        </h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Manage your GitHub connection, privacy controls, and data retention.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-8 space-y-6 shadow-xl">
        {/* Connected Accounts */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-slate-900">Connected Accounts</h3>
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 backdrop-blur-md p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/90 text-white shadow-sm">
                <Github className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">GitHub Connected</p>
                <p className="text-[11px] font-medium text-slate-500">@alexchen • 3 repositories synced</p>
              </div>
            </div>
            <button className="rounded-xl bg-rose-50/80 backdrop-blur-md px-4 py-2 text-xs font-bold text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors shadow-xs">
              Disconnect GitHub
            </button>
          </div>
        </div>

        {/* Public Profile Privacy */}
        <div className="border-t border-slate-200/80 pt-6 space-y-3">
          <h3 className="text-sm font-black text-slate-900">Privacy Controls</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Public Proof Profile</p>
              <p className="text-[11px] font-medium text-slate-500">Allow recruiters to view your verified evidence graph at launchproof.app/u/alex-chen</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 bg-white text-slate-900 focus:ring-slate-900" />
          </div>
        </div>

        {/* Data Removal */}
        <div className="border-t border-slate-200/80 pt-6 space-y-3">
          <h3 className="text-sm font-black text-rose-700">Danger Zone</h3>
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/50 backdrop-blur-md p-5 shadow-xs">
            <div>
              <p className="text-xs font-black text-slate-900">Delete Account & Résumé Data</p>
              <p className="text-[11px] font-medium text-slate-500">Permanently remove all saved jobs, résumé text, and evidence graph data.</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-xl bg-rose-600/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-md shadow-rose-500/20">
              <Trash2 className="h-4 w-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
