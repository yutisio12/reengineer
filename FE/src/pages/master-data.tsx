import { useCompanies, useProjects, useDisciplines, useUsers } from "../hooks/use-api"
import { cn } from "../lib/utils"

export function MasterCompaniesPage() {
  const { data: companies, isLoading } = useCompanies()
  return (
    <div>
      <h2 className="text-2xl font-mono font-bold uppercase mb-6">Companies</h2>
      <div className="border-4 border-black bg-white">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="bg-black text-white uppercase text-xs">
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Code</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Name</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Created At</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center font-bold">LOADING...</td></tr>
            ) : companies?.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center font-bold">NO DATA</td></tr>
            ) : (
              companies?.map((c, i) => (
                <tr key={c.id} className={cn("border-b-4 border-black", i % 2 === 0 ? "bg-white" : "bg-gray-100")}>
                  <td className="px-4 py-3 font-bold">{c.code}</td>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-xs">—</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function MasterProjectsPage() {
  const { data: projects, isLoading } = useProjects()
  return (
    <div>
      <h2 className="text-2xl font-mono font-bold uppercase mb-6">Projects</h2>
      <div className="border-4 border-black bg-white">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="bg-black text-white uppercase text-xs">
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Code</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Name</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Company</th>
              <th className="text-left px-4 py-3">Created At</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center font-bold">LOADING...</td></tr>
            ) : projects?.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center font-bold">NO DATA</td></tr>
            ) : (
              projects?.map((p, i) => (
                <tr key={p.id} className={cn("border-b-4 border-black", i % 2 === 0 ? "bg-white" : "bg-gray-100")}>
                  <td className="px-4 py-3 font-bold">{p.code}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.company_id}</td>
                  <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function MasterDisciplinesPage() {
  const { data: disciplines, isLoading } = useDisciplines()
  return (
    <div>
      <h2 className="text-2xl font-mono font-bold uppercase mb-6">Disciplines</h2>
      <div className="border-4 border-black bg-white">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="bg-black text-white uppercase text-xs">
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Code</th>
              <th className="text-left px-4 py-3">Name</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={2} className="px-4 py-12 text-center font-bold">LOADING...</td></tr>
            ) : disciplines?.length === 0 ? (
              <tr><td colSpan={2} className="px-4 py-12 text-center font-bold">NO DATA</td></tr>
            ) : (
              disciplines?.map((d, i) => (
                <tr key={d.id} className={cn("border-b-4 border-black", i % 2 === 0 ? "bg-white" : "bg-gray-100")}>
                  <td className="px-4 py-3 font-bold">{d.code}</td>
                  <td className="px-4 py-3">{d.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function MasterUsersPage() {
  const { data: users, isLoading } = useUsers()
  return (
    <div>
      <h2 className="text-2xl font-mono font-bold uppercase mb-6">Users</h2>
      <div className="border-4 border-black bg-white">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="bg-black text-white uppercase text-xs">
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Name</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Email</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Role</th>
              <th className="text-left px-4 py-3">Created At</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center font-bold">LOADING...</td></tr>
            ) : users?.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center font-bold">NO DATA</td></tr>
            ) : (
              users?.map((u, i) => (
                <tr key={u.id} className={cn("border-b-4 border-black", i % 2 === 0 ? "bg-white" : "bg-gray-100")}>
                  <td className="px-4 py-3 font-bold">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 border-2 border-black font-bold text-xs uppercase bg-yellow-500 text-black">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
