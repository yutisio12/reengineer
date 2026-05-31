import { useState } from "react"
import { useModules, useProjects, useUpdateModule, useCreateModule } from "../hooks/use-api"
import { cn } from "../lib/utils"
import { showConfirm, showToast } from "../lib/swal"
import { Pencil, X, Plus } from "lucide-react"
import type { Module } from "../types"

function EditModal({ item, onClose }: { item: Module; onClose: () => void }) {
  const { data: projects } = useProjects()
  const [name, setName] = useState(item.name)
  const [code, setCode] = useState(item.code)
  const [projectId, setProjectId] = useState(item.project_id)
  const [isActive, setIsActive] = useState(item.is_active)
  const mutation = useUpdateModule()
  const handleSave = async () => {
    const confirmed = await showConfirm("Save Changes?", "Update this module?")
    if (!confirmed) return
    try {
      await mutation.mutateAsync({ id: item.id, data: { name, code, project_id: projectId, is_active: isActive } })
      showToast("success", "Module updated")
      onClose()
    } catch { showToast("error", "Failed to update module") }
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="border-4 border-black bg-white p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono font-bold text-sm uppercase">Edit Module</h3>
          <button onClick={onClose} className="hover:text-red-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50" />
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50" />
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Project</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50">
              {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 border-4 border-black px-4 py-3">
            <span className="font-mono text-xs font-bold uppercase">Active</span>
            <button onClick={() => setIsActive(!isActive)} className={cn("relative w-12 h-6 border-2 border-black transition-all", isActive ? "bg-green-600" : "bg-gray-300")}>
              <span className={cn("absolute top-0.5 w-4 h-4 bg-white border-2 border-black transition-all", isActive ? "left-[26px]" : "left-0.5")} />
            </button>
            <span className={cn("font-mono text-xs font-bold", isActive ? "text-green-700" : "text-red-600")}>{isActive ? "ACTIVE" : "INACTIVE"}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={mutation.isPending} className="bg-green-600 text-white font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-green-700 disabled:opacity-50 transition-all">{mutation.isPending ? "SAVING..." : "SAVE"}</button>
          <button onClick={onClose} className="bg-white text-black font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-black hover:text-white transition-all">CANCEL</button>
        </div>
      </div>
    </div>
  )
}

function AddModal({ onClose }: { onClose: () => void }) {
  const { data: projects } = useProjects()
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [projectId, setProjectId] = useState("")
  const mutation = useCreateModule()
  const handleSave = async () => {
    const confirmed = await showConfirm("Add Module?", "Create a new module?")
    if (!confirmed) return
    try {
      await mutation.mutateAsync({ name, code, project_id: projectId })
      showToast("success", "Module created")
      onClose()
    } catch { showToast("error", "Failed to create module") }
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="border-4 border-black bg-white p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono font-bold text-sm uppercase">Add Module</h3>
          <button onClick={onClose} className="hover:text-red-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50" />
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50" />
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Project</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50">
              <option value="">Select Project</option>
              {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={mutation.isPending || !name || !code || !projectId} className="bg-green-600 text-white font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-green-700 disabled:opacity-50 transition-all">{mutation.isPending ? "SAVING..." : "SAVE"}</button>
          <button onClick={onClose} className="bg-white text-black font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-black hover:text-white transition-all">CANCEL</button>
        </div>
      </div>
    </div>
  )
}

export function MasterModulesPage() {
  const { data: modules, isLoading } = useModules()
  const [editing, setEditing] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-mono font-bold uppercase">Modules</h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-green-600 text-white font-mono font-bold text-sm uppercase px-5 py-3 border-4 border-black hover:bg-green-700 transition-all"><Plus size={16} /> Add</button>
      </div>
      <div className="border-4 border-black bg-white">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="bg-black text-white uppercase text-xs">
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Code</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Name</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Project</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Status</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (<tr><td colSpan={5} className="px-4 py-12 text-center font-bold">LOADING...</td></tr>
            ) : modules?.length === 0 ? (<tr><td colSpan={5} className="px-4 py-12 text-center font-bold">NO DATA</td></tr>
            ) : (modules?.map((m, i) => (
              <tr key={m.id} className={cn("border-b-4 border-black", i % 2 === 0 ? "bg-white" : "bg-gray-100")}>
                <td className="px-4 py-3 font-bold">{m.code}</td>
                <td className="px-4 py-3">{m.name}</td>
                <td className="px-4 py-3">{m.project_name || "-"}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-block px-2 py-1 border-2 border-black font-bold text-xs uppercase", m.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>{m.is_active ? "ACTIVE" : "INACTIVE"}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setEditing(m.id)} className="flex items-center gap-1 bg-black text-white font-mono font-bold text-xs uppercase px-3 py-2 border-2 border-black hover:bg-white hover:text-black transition-all"><Pencil size={12} /> Edit</button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      {showAdd && <AddModal onClose={() => setShowAdd(false)} />}
      {editing && modules && (() => { const item = modules.find((m) => m.id === editing); if (!item) return null; return <EditModal item={item} onClose={() => setEditing(null)} /> })()}
    </div>
  )
}