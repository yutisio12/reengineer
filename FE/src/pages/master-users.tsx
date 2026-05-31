import { useState } from "react"
import { useUsers, useUpdateUser, useCreateUser } from "../hooks/use-api"
import { cn } from "../lib/utils"
import { Pencil, X, Plus } from "lucide-react"
import { ROLES } from "../lib/constants"
import type { User, UserRole } from "../lib/constants"

function EditModal({ item, onClose }: { item: User; onClose: () => void }) {
  const [name, setName] = useState(item.name)
  const [email, setEmail] = useState(item.email)
  const [role, setRole] = useState<UserRole>(item.role)
  const [isActive, setIsActive] = useState(item.is_active)
  const mutation = useUpdateUser()
  const handleSave = async () => {
    await mutation.mutateAsync({ id: item.id, data: { name, email, role, is_active: isActive } })
    onClose()
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="border-4 border-black bg-white p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono font-bold text-sm uppercase">Edit User</h3>
          <button onClick={onClose} className="hover:text-red-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50" />
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50" />
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
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
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserRole>("drafter")
  const mutation = useCreateUser()
  const handleSave = async () => {
    await mutation.mutateAsync({ name, email, role })
    onClose()
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="border-4 border-black bg-white p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono font-bold text-sm uppercase">Add User</h3>
          <button onClick={onClose} className="hover:text-red-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50" />
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50" />
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={mutation.isPending || !name || !email} className="bg-green-600 text-white font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-green-700 disabled:opacity-50 transition-all">{mutation.isPending ? "SAVING..." : "SAVE"}</button>
          <button onClick={onClose} className="bg-white text-black font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-black hover:text-white transition-all">CANCEL</button>
        </div>
      </div>
    </div>
  )
}

export function MasterUsersPage() {
  const { data: users, isLoading } = useUsers()
  const [editing, setEditing] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-mono font-bold uppercase">Users</h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-green-600 text-white font-mono font-bold text-sm uppercase px-5 py-3 border-4 border-black hover:bg-green-700 transition-all"><Plus size={16} /> Add</button>
      </div>
      <div className="border-4 border-black bg-white">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="bg-black text-white uppercase text-xs">
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Name</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Email</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Role</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Status</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (<tr><td colSpan={5} className="px-4 py-12 text-center font-bold">LOADING...</td></tr>
            ) : users?.length === 0 ? (<tr><td colSpan={5} className="px-4 py-12 text-center font-bold">NO DATA</td></tr>
            ) : (users?.map((u, i) => (
              <tr key={u.id} className={cn("border-b-4 border-black", i % 2 === 0 ? "bg-white" : "bg-gray-100")}>
                <td className="px-4 py-3 font-bold">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 border-2 border-black font-bold text-xs uppercase bg-yellow-500 text-black">{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-block px-2 py-1 border-2 border-black font-bold text-xs uppercase", u.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>{u.is_active ? "ACTIVE" : "INACTIVE"}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setEditing(u.id)} className="flex items-center gap-1 bg-black text-white font-mono font-bold text-xs uppercase px-3 py-2 border-2 border-black hover:bg-white hover:text-black transition-all"><Pencil size={12} /> Edit</button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      {showAdd && <AddModal onClose={() => setShowAdd(false)} />}
      {editing && users && (() => { const item = users.find((u) => u.id === editing); if (!item) return null; return <EditModal item={item} onClose={() => setEditing(null)} /> })()}
    </div>
  )
}
