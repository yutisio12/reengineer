import { useState } from "react"
import { useProjects, useCompanies, useUpdateProject, useCreateProject } from "../hooks/use-api"
import { cn } from "../lib/utils"
import { showConfirm, showToast } from "../lib/swal"
import { Pencil, X, Plus } from "lucide-react"
import type { Project } from "../types"

function EditModal({ item, onClose }: { item: Project; onClose: () => void }) {
  const { data: companies } = useCompanies()
  const [name, setName] = useState(item.name)
  const [code, setCode] = useState(item.code)
  const [companyId, setCompanyId] = useState(item.company_id)
  const [isActive, setIsActive] = useState(item.is_active)
  const mutation = useUpdateProject()
  const handleSave = async () => {
    const confirmed = await showConfirm("Save Changes?", "Update this project?")
    if (!confirmed) return
    try {
      await mutation.mutateAsync({ id: item.id, data: { name, code, company_id: companyId, is_active: isActive } })
      showToast("success", "Project updated")
      onClose()
    } catch { showToast("error", "Failed to update project") }
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="border-4 border-black p-6 w-full max-w-md" style={{ background: "#EAE8E3" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono font-bold text-sm uppercase">Edit Project</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none" style={{ background: "#F4F4F0" }} />
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none" style={{ background: "#F4F4F0" }} />
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Company</label>
            <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none" style={{ background: "#F4F4F0" }}>
              {companies?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 border-4 border-black px-4 py-3">
            <span className="font-mono text-xs font-bold uppercase">Active</span>
            <button onClick={() => setIsActive(!isActive)} className="relative w-12 h-6 border-2 border-black transition-all" style={{ background: isActive ? "#E61919" : "#D4D4D0" }}>
              <span className={cn("absolute top-0.5 w-4 h-4 bg-white border-2 border-black transition-all", isActive ? "left-[26px]" : "left-0.5")} />
            </button>
            <span className={cn("font-mono text-xs font-bold", isActive ? "text-[#111]" : "text-[#666]")}>{isActive ? "ACTIVE" : "INACTIVE"}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={mutation.isPending} className="text-white font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black disabled:opacity-50 transition-all" style={{ background: "#E61919", color: "#fff" }}>{mutation.isPending ? "SAVING..." : "SAVE"}</button>
          <button onClick={onClose} className="text-black font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-black hover:text-white transition-all" style={{ background: "#EAE8E3" }}>CANCEL</button>
        </div>
      </div>
    </div>
  )
}

function AddModal({ onClose }: { onClose: () => void }) {
  const { data: companies } = useCompanies()
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [companyId, setCompanyId] = useState("")
  const mutation = useCreateProject()
  const handleSave = async () => {
    const confirmed = await showConfirm("Add Project?", "Create a new project?")
    if (!confirmed) return
    try {
      await mutation.mutateAsync({ name, code, company_id: companyId })
      showToast("success", "Project created")
      onClose()
    } catch { showToast("error", "Failed to create project") }
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="border-4 border-black p-6 w-full max-w-md" style={{ background: "#EAE8E3" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono font-bold text-sm uppercase">Add Project</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none" style={{ background: "#F4F4F0" }} />
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none" style={{ background: "#F4F4F0" }} />
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Company</label>
            <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none" style={{ background: "#F4F4F0" }}>
              <option value="">Select Company</option>
              {companies?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={mutation.isPending || !name || !code || !companyId} className="text-white font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black disabled:opacity-50 transition-all" style={{ background: "#E61919", color: "#fff" }}>{mutation.isPending ? "SAVING..." : "SAVE"}</button>
          <button onClick={onClose} className="text-black font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-black hover:text-white transition-all" style={{ background: "#EAE8E3" }}>CANCEL</button>
        </div>
      </div>
    </div>
  )
}

export function MasterProjectsPage() {
  const { data: projects, isLoading } = useProjects()
  const [editing, setEditing] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-mono font-bold uppercase">Projects</h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-white font-mono font-bold text-sm uppercase px-5 py-3 border-4 border-black transition-all" style={{ background: "#E61919", color: "#fff" }}><Plus size={16} /> Add</button>
      </div>
      <div className="border-4 border-black" style={{ background: "#EAE8E3" }}>
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="bg-black text-white uppercase text-xs">
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Code</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Name</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Company</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Status</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (<tr><td colSpan={5} className="px-4 py-12 text-center font-bold">LOADING...</td></tr>
            ) : projects?.length === 0 ? (<tr><td colSpan={5} className="px-4 py-12 text-center font-bold">NO DATA</td></tr>
            ) : (projects?.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? "#EAE8E3" : "#E0DDD8" }} className="border-b-4 border-black">
                <td className="px-4 py-3 font-bold">{p.code}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.company_name || "-"}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-block px-2 py-1 border-2 border-black font-bold text-xs uppercase", p.is_active ? "bg-[#EAE8E3] text-[#111]" : "bg-[#D4D4D0] text-[#666]")}>{p.is_active ? "ACTIVE" : "INACTIVE"}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setEditing(p.id)} className="flex items-center gap-1 bg-black text-white font-mono font-bold text-xs uppercase px-3 py-2 border-2 border-black hover:bg-white hover:text-black transition-all"><Pencil size={12} /> Edit</button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      {showAdd && <AddModal onClose={() => setShowAdd(false)} />}
      {editing && projects && (() => { const item = projects.find((p) => p.id === editing); if (!item) return null; return <EditModal item={item} onClose={() => setEditing(null)} /> })()}
    </div>
  )
}
