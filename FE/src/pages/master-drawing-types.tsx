import { useState } from "react"
import { useDrawingTypes, useUpdateDrawingType, useCreateDrawingType } from "../hooks/use-api"
import { cn } from "../lib/utils"
import { showConfirm, showToast } from "../lib/swal"
import { Pencil, X, Plus } from "lucide-react"
import type { DrawingType } from "../types"

function EditModal({ item, onClose }: { item: DrawingType; onClose: () => void }) {
  const [name, setName] = useState(item.name)
  const [code, setCode] = useState(item.code)
  const mutation = useUpdateDrawingType()
  const handleSave = async () => {
    const confirmed = await showConfirm("Save Changes?", "Update this drawing type?")
    if (!confirmed) return
    try {
      await mutation.mutateAsync({ id: item.id, data: { name, code } })
      showToast("success", "Drawing type updated")
      onClose()
    } catch { showToast("error", "Failed to update drawing type") }
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="border-4 border-black bg-white p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono font-bold text-sm uppercase">Edit Drawing Type</h3>
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
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const mutation = useCreateDrawingType()
  const handleSave = async () => {
    const confirmed = await showConfirm("Add Drawing Type?", "Create a new drawing type?")
    if (!confirmed) return
    try {
      await mutation.mutateAsync({ name, code })
      showToast("success", "Drawing type created")
      onClose()
    } catch { showToast("error", "Failed to create drawing type") }
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="border-4 border-black bg-white p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono font-bold text-sm uppercase">Add Drawing Type</h3>
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
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={mutation.isPending || !name || !code} className="bg-green-600 text-white font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-green-700 disabled:opacity-50 transition-all">{mutation.isPending ? "SAVING..." : "SAVE"}</button>
          <button onClick={onClose} className="bg-white text-black font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-black hover:text-white transition-all">CANCEL</button>
        </div>
      </div>
    </div>
  )
}

export function MasterDrawingTypesPage() {
  const { data: drawingTypes, isLoading } = useDrawingTypes()
  const [editing, setEditing] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-mono font-bold uppercase">Drawing Types</h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-green-600 text-white font-mono font-bold text-sm uppercase px-5 py-3 border-4 border-black hover:bg-green-700 transition-all"><Plus size={16} /> Add</button>
      </div>
      <div className="border-4 border-black bg-white">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="bg-black text-white uppercase text-xs">
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Code</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Name</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (<tr><td colSpan={3} className="px-4 py-12 text-center font-bold">LOADING...</td></tr>
            ) : drawingTypes?.length === 0 ? (<tr><td colSpan={3} className="px-4 py-12 text-center font-bold">NO DATA</td></tr>
            ) : (drawingTypes?.map((dt, i) => (
              <tr key={dt.id} className={cn("border-b-4 border-black", i % 2 === 0 ? "bg-white" : "bg-gray-100")}>
                <td className="px-4 py-3 font-bold">{dt.code}</td>
                <td className="px-4 py-3">{dt.name}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setEditing(dt.id)} className="flex items-center gap-1 bg-black text-white font-mono font-bold text-xs uppercase px-3 py-2 border-2 border-black hover:bg-white hover:text-black transition-all"><Pencil size={12} /> Edit</button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      {showAdd && <AddModal onClose={() => setShowAdd(false)} />}
      {editing && drawingTypes && (() => { const item = drawingTypes.find((dt) => dt.id === editing); if (!item) return null; return <EditModal item={item} onClose={() => setEditing(null)} /> })()}
    </div>
  )
}